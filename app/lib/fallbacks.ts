import type { ClarifyResponse, RecommendResponse } from "./types";

export const fallbackClarifyResponse: ClarifyResponse = {
  questions: [
    {
      id: "q1",
      question: "What will you primarily use the earbuds for?",
      options: ["Work calls", "Music", "Working out", "Commuting"],
    },
    {
      id: "q2",
      question: "What's your budget range?",
      options: ["Under $50", "$50–$100", "$100–$200", "Over $200"],
    },
    {
      id: "q3",
      question: "How important is noise cancellation?",
      options: ["Essential", "Nice to have", "Not important"],
    },
  ],
};

export const fallbackRecommendResponse: RecommendResponse = {
  summary:
    "I wasn't able to search for products at this time. Here are some popular earbuds to consider based on general recommendations.",
  recommendations: [
    {
      id: fallbackId(),
      name: "QuietComfort Ultra Earbuds",
      brand: "Bose",
      price: 299,
      currency: "USD",
      imageUrl: null,
      sourceUrl: "https://www.bose.com",
      features: {
        batteryLifeHours: 6,
        bluetoothVersion: "5.3",
        noiseCancelling: true,
        waterResistance: "IPX4",
        weightGrams: 7,
      },
      description: "Premium earbuds with world-class noise cancellation and immersive sound.",
      customerSentiment: "Customers mention excellent noise cancellation but note the premium price.",
      rationale:
        "The Bose QC Ultra Earbuds offer industry-leading noise cancellation and a comfortable fit for all-day wear. They support spatial audio and have a reliable companion app. Some users note the price is high, but the sound quality justifies it for audiophiles.",
      isRecommended: true,
      recommendationReason: "Best overall noise cancellation and sound quality",
    },
    {
      id: fallbackId(),
      name: "Galaxy Buds3 Pro",
      brand: "Samsung",
      price: 249,
      currency: "USD",
      imageUrl: null,
      sourceUrl: "https://www.samsung.com",
      features: {
        batteryLifeHours: 7,
        bluetoothVersion: "5.4",
        noiseCancelling: true,
        waterResistance: "IP57",
        weightGrams: 5,
      },
      description: "Feature-packed earbuds with excellent integration in the Samsung ecosystem.",
      customerSentiment: "Customers appreciate the comfort and ANC but wish for better cross-platform support.",
      rationale:
        "Samsung's Galaxy Buds3 Pro deliver strong ANC, great call quality, and a sleek design. They're particularly well-suited for Samsung phone users. Battery life is solid at 7 hours, though the fit may not suit all ear shapes.",
      isRecommended: false,
      recommendationReason: null,
    },
    {
      id: fallbackId(),
      name: "AirPods Pro 2",
      brand: "Apple",
      price: 249,
      currency: "USD",
      imageUrl: null,
      sourceUrl: "https://www.apple.com",
      features: {
        batteryLifeHours: 6,
        bluetoothVersion: "5.3",
        noiseCancelling: true,
        waterResistance: "IP54",
        weightGrams: 5,
      },
      description: "Apple's flagship earbuds with adaptive transparency and personalized spatial audio.",
      customerSentiment: "Customers love the seamless Apple integration but note limited features on Android.",
      rationale:
        "The AirPods Pro 2 are the go-to choice for iPhone users, with deep OS integration, adaptive transparency mode, and USB-C charging. Sound quality is balanced and pleasant. However, Android users won't get the full feature set.",
      isRecommended: true,
      recommendationReason: "Best choice for Apple ecosystem users",
    },
  ],
};

function fallbackId(): string {
  return `fallback-${Math.random().toString(36).substring(2, 10)}`;
}
