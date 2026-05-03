import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { log } from "@/lib/logger";
import type { ClarifyingQuestion } from "@/lib/types";

const SYSTEM_PROMPT =
  "You are a shopping assistant for Bluetooth earbuds. Ask 3–5 short, concrete questions to clarify the user's needs. Focus on use case, budget, and key features. Respond using the provided tool.";

const QUESTIONS_TOOL = {
  name: "generate_questions" as const,
  description: "Generate clarifying questions for the user",
  input_schema: {
    type: "object" as const,
    properties: {
      questions: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            id: { type: "string" as const },
            question: { type: "string" as const },
            options: { type: "array" as const, items: { type: "string" as const } },
          },
          required: ["id", "question", "options"],
        },
      },
    },
    required: ["questions"],
  },
};

export async function POST(request: Request) {
  const sessionId = randomUUID();

  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'query' field" },
        { status: 400 }
      );
    }

    log({ type: "search_query", sessionId, route: "clarify", data: { query } });

    const messages = [{ role: "user" as const, content: query }];
    const tools = [QUESTIONS_TOOL];

    let questions: ClarifyingQuestion[] | null = null;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        log({
          type: "ai_input",
          sessionId,
          route: "clarify",
          data: { system: SYSTEM_PROMPT, messages, tools, attempt },
        });

        const startTime = Date.now();
        const response = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          tools,
          tool_choice: { type: "tool", name: "generate_questions" },
          messages,
        });

        log({
          type: "ai_output",
          sessionId,
          route: "clarify",
          durationMs: Date.now() - startTime,
          data: response,
        });

        const toolBlock = response.content.find((block) => block.type === "tool_use");
        if (!toolBlock || toolBlock.type !== "tool_use") {
          throw new Error("No tool_use block in response");
        }

        const input = toolBlock.input as { questions: ClarifyingQuestion[] };
        if (!Array.isArray(input.questions)) {
          throw new Error("Invalid questions format");
        }

        questions = input.questions;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!questions) {
      throw lastError;
    }

    return NextResponse.json({ questions, sessionId });
  } catch (error) {
    console.error("Clarify API error:", error);
    log({
      type: "ai_output",
      sessionId,
      route: "clarify",
      data: null,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to generate clarifying questions" },
      { status: 500 }
    );
  }
}
