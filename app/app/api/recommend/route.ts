import { randomUUID } from "node:crypto";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { generateId } from "@/lib/id";
import { log } from "@/lib/logger";
import { fetchSerpapiImages } from "@/lib/serpapi-image";
import type { LiveProduct, QuestionAnswer, RecommendResponse } from "@/lib/types";

const SYSTEM_PROMPT =
  "You are a shopping AI for Bluetooth earbuds. Use web search to find 3–5 current products matching the user's needs. For each product, extract: name, brand, price (raw, as found), currency, imageUrl (set to null — images are resolved separately), and the following features: batteryLifeHours, bluetoothVersion, noiseCancelling, waterResistance, weightGrams. Use null for any field you cannot verify — never fabricate values. Write a 2–3 sentence rationale per product including a small caveat drawn from customer sentiment. Mark at most 2 products as isRecommended: true. After searching, call the provide_recommendations tool with your results.";

const RECOMMENDATIONS_TOOL = {
  name: "provide_recommendations" as const,
  description: "Provide product recommendations in structured format",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: {
        type: "string" as const,
        description: "A brief summary of the recommendation results",
      },
      recommendations: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            name: { type: "string" as const },
            brand: { type: "string" as const },
            price: { type: "number" as const },
            currency: { type: "string" as const },
            imageUrl: { type: ["string", "null"] as const },
            sourceUrl: { type: "string" as const },
            features: {
              type: "object" as const,
              properties: {
                batteryLifeHours: { type: ["number", "null"] as const },
                bluetoothVersion: { type: ["string", "null"] as const },
                noiseCancelling: { type: ["boolean", "null"] as const },
                waterResistance: { type: ["string", "null"] as const },
                weightGrams: { type: ["number", "null"] as const },
              },
              required: [
                "batteryLifeHours",
                "bluetoothVersion",
                "noiseCancelling",
                "waterResistance",
                "weightGrams",
              ],
            },
            description: { type: "string" as const },
            customerSentiment: { type: "string" as const },
            rationale: { type: "string" as const },
            isRecommended: { type: "boolean" as const },
            recommendationReason: { type: ["string", "null"] as const },
          },
          required: [
            "name",
            "brand",
            "price",
            "currency",
            "imageUrl",
            "sourceUrl",
            "features",
            "description",
            "customerSentiment",
            "rationale",
            "isRecommended",
            "recommendationReason",
          ],
        },
      },
    },
    required: ["summary", "recommendations"],
  },
};

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let sessionId: string = randomUUID();
      let streamClosed = false;

      function safeEnqueue(data: Uint8Array) {
        if (!streamClosed) controller.enqueue(data);
      }
      function safeClose() {
        if (!streamClosed) { streamClosed = true; controller.close(); }
      }

      try {
        const { query, answers, sessionId: incomingSessionId } = (await request.json()) as {
          query: string;
          answers: QuestionAnswer[];
          sessionId?: string;
        };
        if (incomingSessionId) sessionId = incomingSessionId;

        if (!query || typeof query !== "string") {
          safeEnqueue(
            encoder.encode(sseEvent("error", { message: "Missing or invalid 'query' field" }))
          );
          safeClose();
          return;
        }

        // Build user message from query + answers (filter out no_preference)
        let userMessage = `Original request: ${query}`;
        const activeAnswers = (answers ?? []).filter(
          (a: QuestionAnswer) => !a.no_preference
        );
        if (activeAnswers.length > 0) {
          userMessage += "\n\nUser preferences:\n";
          userMessage += activeAnswers
            .map((a: QuestionAnswer) => `- ${a.question}: ${a.answer}`)
            .join("\n");
        }

        log({ type: "search_query", sessionId, route: "recommend", data: { query, answers } });

        safeEnqueue(
          encoder.encode(sseEvent("status", { message: "Searching the web for earbuds..." }))
        );

        const initialMessages = [{ role: "user" as const, content: userMessage }];
        const toolsDef = [
          { type: "web_search_20250305" as const, name: "web_search", max_uses: 5 },
          RECOMMENDATIONS_TOOL,
        ];
        let turnNumber = 1;

        log({
          type: "ai_input",
          sessionId,
          route: "recommend",
          data: { system: SYSTEM_PROMPT, messages: initialMessages, tools: toolsDef, turn: turnNumber },
        });

        const startTime1 = Date.now();
        const response = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 16000,
          system: SYSTEM_PROMPT,
          tools: [
            { type: "web_search_20250305", name: "web_search", max_uses: 5 },
            RECOMMENDATIONS_TOOL,
          ],
          messages: [{ role: "user", content: userMessage }],
        }, { timeout: 120000 });

        log({
          type: "ai_output",
          sessionId,
          route: "recommend",
          durationMs: Date.now() - startTime1,
          data: { turn: turnNumber, stopReason: response.stop_reason, content: response.content },
        });

        safeEnqueue(
          encoder.encode(sseEvent("status", { message: "Analyzing products and reviews..." }))
        );

        // Handle multi-turn: Claude may search first, then we need to continue
        let currentResponse = response;
        let toolResult: RecommendResponse | null = null;
        const conversationMessages: Array<{ role: string; content: unknown }> = [
          { role: "user", content: userMessage },
        ];

        // Loop to handle tool use responses (web_search requires sending results back)
        while (currentResponse.stop_reason === "tool_use") {
          const assistantContent = currentResponse.content;
          conversationMessages.push({ role: "assistant", content: assistantContent });

          // Check if provide_recommendations was called
          const recBlock = assistantContent.find(
            (block) => block.type === "tool_use" && block.name === "provide_recommendations"
          );

          if (recBlock && recBlock.type === "tool_use") {
            toolResult = recBlock.input as RecommendResponse;
            break;
          }

          // Process all tool_use blocks (web_search results are handled by the server,
          // but we still need to acknowledge them for the conversation to continue)
          const toolUseBlocks = assistantContent.filter(
            (block) => block.type === "tool_use"
          );

          const toolResults = toolUseBlocks.map((block) => {
            if (block.type !== "tool_use") return null;
            return {
              type: "tool_result" as const,
              tool_use_id: block.id,
              content: "Search results received. Please continue and call provide_recommendations when ready.",
            };
          }).filter(Boolean);

          safeEnqueue(
            encoder.encode(sseEvent("status", { message: "Comparing products..." }))
          );

          conversationMessages.push({ role: "user", content: toolResults });

          turnNumber++;
          log({
            type: "ai_input",
            sessionId,
            route: "recommend",
            data: { system: SYSTEM_PROMPT, turn: turnNumber, messageCount: conversationMessages.length },
          });

          const turnStart = Date.now();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentResponse = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 16000,
            system: SYSTEM_PROMPT,
            tools: [
              { type: "web_search_20250305", name: "web_search", max_uses: 5 },
              RECOMMENDATIONS_TOOL,
            ],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages: conversationMessages as any,
          }, { timeout: 120000 });

          log({
            type: "ai_output",
            sessionId,
            route: "recommend",
            durationMs: Date.now() - turnStart,
            data: { turn: turnNumber, stopReason: currentResponse.stop_reason, content: currentResponse.content },
          });
        }

        // If we exited the loop with end_turn, check the final response for the tool call
        if (!toolResult) {
          const recBlock = currentResponse.content.find(
            (block) => block.type === "tool_use" && block.name === "provide_recommendations"
          );
          if (recBlock && recBlock.type === "tool_use") {
            toolResult = recBlock.input as RecommendResponse;
          }
        }

        if (!toolResult) {
          safeEnqueue(
            encoder.encode(
              sseEvent("error", { message: "Failed to get structured recommendations from AI" })
            )
          );
          safeClose();
          return;
        }

        // Assign UUIDs to each product
        let recommendations: LiveProduct[] = toolResult.recommendations.map((product) => ({
          ...product,
          id: generateId(),
        }));

        // Scrape real product images from source URLs
        safeEnqueue(
          encoder.encode(sseEvent("status", { message: "Fetching product images..." }))
        );
        try {
          recommendations = await fetchSerpapiImages(recommendations, sessionId);
        } catch {
          // SerpAPI failed entirely — proceed with original imageUrl values
        }

        const result: RecommendResponse = {
          summary: toolResult.summary,
          recommendations,
        };

        safeEnqueue(
          encoder.encode(sseEvent("status", { message: "Finalizing recommendations..." }))
        );

        safeEnqueue(encoder.encode(sseEvent("result", result)));
        safeClose();
      } catch (error) {
        console.error("Recommend API error:", error);
        log({
          type: "ai_output",
          sessionId,
          route: "recommend",
          data: null,
          error: error instanceof Error ? error.message : String(error),
        });
        safeEnqueue(
          encoder.encode(
            sseEvent("error", {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to generate recommendations",
            })
          )
        );
        safeClose();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
