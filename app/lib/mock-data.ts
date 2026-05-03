import type { ClarifyResponse, LiveProduct, RecommendResponse } from "./types";

/**
 * Mock data for the demo's mock-mode (no Claude / no web search).
 * Five product set with rich descriptions / sentiment / pros-cons hooks.
 * Image URLs are intentionally null — the placeholder SVG renders deterministically
 * without depending on the network.
 */

export const MOCK_QUERY = "Best earbuds for working from home";

export const mockClarifyResponse: ClarifyResponse = {
  questions: [
    {
      id: "q1",
      question: "What will you mostly use them for?",
      options: ["Work calls", "Focus listening", "Both equally", "Travel & commute"],
    },
    {
      id: "q2",
      question: "What's your budget range?",
      options: ["Under $100", "$100–$200", "$200–$300", "Over $300"],
    },
    {
      id: "q3",
      question: "How important is active noise cancellation?",
      options: ["Critical", "Nice to have", "Don't need it"],
    },
    {
      id: "q4",
      question: "Which platform do you mainly use?",
      options: ["iPhone / Mac", "Android", "Windows", "Mixed"],
    },
  ],
};

export const MOCK_SUMMARY =
  "Based on your need for clear calls and focused listening, here are five strong picks. The Bose QC Ultra Earbuds lead on noise cancellation and call quality — the rest cover different price points and use cases.";

let mockIdCounter = 0;
function mockId(slug: string): string {
  return `mock-${slug}-${mockIdCounter++}`;
}

export function buildMockProducts(): LiveProduct[] {
  // New ids each call so layoutId / cart-key behavior matches a real run.
  mockIdCounter = 0;
  return [
    {
      id: mockId("bose-qc-ultra"),
      name: "QuietComfort Ultra Earbuds",
      brand: "Bose",
      price: 299,
      currency: "USD",
      imageUrl: null,
      sourceUrl: "https://www.bose.com/p/earbuds/quietcomfort-ultra-earbuds",
      features: {
        batteryLifeHours: 6,
        bluetoothVersion: "5.3",
        noiseCancelling: true,
        waterResistance: "IPX4",
        weightGrams: 7,
      },
      description:
        "Bose's flagship earbuds with class-leading active noise cancellation, immersive audio with head tracking, and a comfortable stay-in-ear fit. The companion app exposes EQ controls, multipoint pairing, and customizable ANC modes.",
      customerSentiment:
        "Customers consistently praise the comfort and the noise cancellation, especially for open offices and flights. A few mention the case is bulky and the price is high relative to AirPods Pro.",
      rationale:
        "The QC Ultra Earbuds top the field on ANC and call clarity — the two things that matter most for working from home. Sound is rich without being bass-heavy, and the fit holds during long sessions. Caveat from reviews: case is on the bulky side.",
      isRecommended: true,
      recommendationReason:
        "Best overall for work-from-home: leading ANC, clear calls, and all-day comfort.",
    },
    {
      id: mockId("airpods-pro-2"),
      name: "AirPods Pro 2 (USB-C)",
      brand: "Apple",
      price: 249,
      currency: "USD",
      imageUrl: null,
      sourceUrl: "https://www.apple.com/airpods-pro/",
      features: {
        batteryLifeHours: 6,
        bluetoothVersion: "5.3",
        noiseCancelling: true,
        waterResistance: "IP54",
        weightGrams: 5,
      },
      description:
        "Apple's second-gen Pros with USB-C, Adaptive Audio, and conversation awareness. Deepest integration with iPhone, iPad, and Mac — including hands-free Siri and one-tap pairing.",
      customerSentiment:
        "Customers love the seamless Apple ecosystem hand-off and the Adaptive Audio feature. Android users note the experience is much more limited without iCloud.",
      rationale:
        "The AirPods Pro 2 are the easy pick if you live in Apple's ecosystem — automatic switching between Mac and iPhone is genuinely useful for work. ANC is strong, though a notch behind Bose. Note: most advanced features only show up on Apple devices.",
      isRecommended: false,
      recommendationReason: null,
    },
    {
      id: mockId("sony-wf1000xm5"),
      name: "WF-1000XM5",
      brand: "Sony",
      price: 279,
      currency: "USD",
      imageUrl: null,
      sourceUrl: "https://electronics.sony.com/audio/headphones/c/all-headphones",
      features: {
        batteryLifeHours: 8,
        bluetoothVersion: "5.3",
        noiseCancelling: true,
        waterResistance: "IPX4",
        weightGrams: 6,
      },
      description:
        "Sony's flagship earbuds with LDAC support for high-resolution streaming, multipoint Bluetooth, and adaptive ANC. The Headphones Connect app offers granular EQ and listening profiles.",
      customerSentiment:
        "Reviewers highlight the audio fidelity and battery life. Some note the touch controls are over-eager and the call mic is weaker than the Bose.",
      rationale:
        "The WF-1000XM5 lead on raw audio quality and battery — the longest in the set. Strong ANC and multipoint make them a flexible all-rounder. Caveat: call quality is a step behind the Bose, less ideal if calls dominate your day.",
      isRecommended: false,
      recommendationReason: null,
    },
    {
      id: mockId("jabra-elite-10"),
      name: "Elite 10 Gen 2",
      brand: "Jabra",
      price: 229,
      currency: "USD",
      imageUrl: null,
      sourceUrl: "https://www.jabra.com/bluetooth-headsets/jabra-elite-10",
      features: {
        batteryLifeHours: 8,
        bluetoothVersion: "5.3",
        noiseCancelling: true,
        waterResistance: "IP57",
        weightGrams: 6,
      },
      description:
        "Jabra's call-focused earbuds with six microphones, an enterprise-grade voice pickup setup, and Dolby Atmos with head tracking. The Sound+ app supports MyControls and MyFit.",
      customerSentiment:
        "Customers in remote-first roles single out the call quality and the secure fit during workouts. A small share mention the ANC is not at the level of Bose or Sony.",
      rationale:
        "Built around the call experience — the six-mic array consistently beats peers in noisy rooms. Strong battery, secure fit, and IP57 dust/water resistance make them robust. Caveat: ANC is good, not class-leading.",
      isRecommended: false,
      recommendationReason: null,
    },
    {
      id: mockId("nothing-ear-2"),
      name: "Ear (a)",
      brand: "Nothing",
      price: 99,
      currency: "USD",
      imageUrl: null,
      sourceUrl: "https://nl.nothing.tech/products/ear-a",
      features: {
        batteryLifeHours: 9,
        bluetoothVersion: "5.3",
        noiseCancelling: true,
        waterResistance: "IP54",
        weightGrams: 5,
      },
      description:
        "Nothing's value-tier earbuds with a transparent design language, LDAC support, and Smart ANC. ChatGPT integration is available when paired with a Nothing phone.",
      customerSentiment:
        "Customers like the price-to-feature ratio and the unmistakable look. Some report the touch controls misfire and the ANC is moderate.",
      rationale:
        "An aggressively priced option that nails the basics — long battery, solid sound, decent ANC. The transparent design also reads well on camera. Caveat: ANC and call quality are both clearly below the higher-end picks.",
      isRecommended: false,
      recommendationReason: null,
    },
  ];
}

export const mockRecommendResponse: RecommendResponse = {
  summary: MOCK_SUMMARY,
  // Note: callers should rebuild with `buildMockProducts()` per run so each demo gets fresh ids.
  recommendations: [],
};
