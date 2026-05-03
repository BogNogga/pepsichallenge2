export type MetricDescription = {
  title: string;
  description: string;
  example?: string;
};

export const metricDescriptions: Record<string, MetricDescription> = {
  batteryLifeHours: {
    title: "Battery life",
    description:
      "How long the earbuds last on a single charge, not counting the charging case.",
    example: "8h = a full work day without charging.",
  },
  bluetoothVersion: {
    title: "Bluetooth version",
    description:
      "Newer versions give a more stable connection, lower power use, and better range.",
    example: "5.3 is the current standard; 5.0 is fine for most use.",
  },
  noiseCancelling: {
    title: "Noise cancelling",
    description:
      "Active noise cancellation filters out ambient sound using built-in microphones.",
    example: "Useful on transit or in an office; less needed working from home.",
  },
  waterResistance: {
    title: "Water resistance (IP rating)",
    description:
      "Indicates protection against dust and water. First digit = dust, second = water.",
    example: "IPX4 = splash-resistant. IPX7 = brief submersion is fine.",
  },
  weightGrams: {
    title: "Weight",
    description: "The weight per earbud. Lighter earbuds are more comfortable for long sessions.",
    example: "Under 6g per bud is barely noticeable.",
  },
  driver_size: {
    title: "Driver size",
    description: "The diameter of the speaker inside the earbud. Larger drivers usually mean more bass.",
    example: "10mm is standard; 12mm+ gives a noticeably bigger low end.",
  },
  frequency_response: {
    title: "Frequency response",
    description:
      "The range of tones the earbuds can reproduce, from low (bass) to high (treble).",
    example: "20Hz–20kHz covers the full range of human hearing.",
  },
  impedance: {
    title: "Impedance",
    description:
      "The resistance of the speaker, in ohms. Lower impedance is easier to drive from a phone.",
    example: "16–32 ohms is typical for earbuds.",
  },
  codec_support: {
    title: "Audio codecs",
    description:
      "Codecs determine how audio is sent over Bluetooth. Better codecs mean higher quality.",
    example: "AAC works well on iPhone; LDAC and aptX give higher quality on Android.",
  },
  anc_levels: {
    title: "ANC levels",
    description: "How many adjustable levels of active noise cancellation are available.",
    example: "More levels = finer tuning to your environment.",
  },
  transparency_mode: {
    title: "Transparency mode",
    description:
      "Lets ambient sound through so you can hold a conversation without removing the earbuds.",
  },
  charging_case_battery: {
    title: "Charging case battery",
    description:
      "Extra listening time the charging case provides on top of the earbuds' own battery.",
    example: "24h total with case ≈ 3 extra full charges on the go.",
  },
  fast_charging: {
    title: "Fast charging",
    description: "How much listening time you get from a short charging burst.",
    example: "10 min charge = 1h listening is a common spec.",
  },
  wireless_charging: {
    title: "Wireless charging",
    description:
      "Whether the case can be placed on a Qi pad instead of using a cable.",
  },
  microphone_quality: {
    title: "Microphone quality",
    description:
      "How well you sound on calls. More mics and noise reduction help in busy places.",
  },
  multipoint: {
    title: "Multipoint connection",
    description:
      "Pair the earbuds with two devices at once — e.g. laptop and phone — without re-pairing.",
    example: "Useful when switching between work laptop and personal phone.",
  },
  ear_tip_sizes: {
    title: "Ear tip sizes",
    description:
      "How many silicone tip sizes are included to help you find a good fit.",
    example: "S/M/L is standard; some brands also include XS and XL.",
  },
};

/**
 * Maps the feature labels used in ProductCard to metric keys.
 */
export const featureLabelToKey: Record<string, string> = {
  "Battery Life": "batteryLifeHours",
  "Bluetooth": "bluetoothVersion",
  "Noise Cancelling": "noiseCancelling",
  "Water Resistance": "waterResistance",
  "Weight": "weightGrams",
};
