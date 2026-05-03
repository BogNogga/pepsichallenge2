"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import type { LiveProduct } from "@/lib/types";
import MetricInfo from "./MetricInfo";
import PlaceholderImage from "./PlaceholderImage";

interface ProductDetailDrawerProps {
  product: LiveProduct | null;
  onClose: () => void;
}

export default function ProductDetailDrawer({
  product,
  onClose,
}: ProductDetailDrawerProps) {
  const { addItem } = useCart();

  // Close on Escape
  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [product, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [product]);

  const features: { label: string; value: string | null }[] = product
    ? [
        {
          label: "Battery Life",
          value: product.features.batteryLifeHours
            ? `${product.features.batteryLifeHours}h`
            : null,
        },
        { label: "Bluetooth", value: product.features.bluetoothVersion },
        {
          label: "Noise Cancelling",
          value:
            product.features.noiseCancelling === null
              ? null
              : product.features.noiseCancelling
              ? "Yes"
              : "No",
        },
        { label: "Water Resistance", value: product.features.waterResistance },
        {
          label: "Weight",
          value: product.features.weightGrams
            ? `${product.features.weightGrams}g`
            : null,
        },
      ]
    : [];

  // Parse pros/cons from rationale + customerSentiment
  const pros: string[] = [];
  const cons: string[] = [];
  if (product) {
    // Extract from customerSentiment and rationale
    if (product.customerSentiment) {
      const sentiment = product.customerSentiment.toLowerCase();
      if (sentiment.includes("comfort") || sentiment.includes("comfortable"))
        pros.push("Comfortable for long sessions");
      if (sentiment.includes("sound") || sentiment.includes("audio") || sentiment.includes("quality"))
        pros.push("Strong sound quality");
      if (sentiment.includes("battery") || sentiment.includes("long lasting"))
        pros.push("Long battery life");
      if (sentiment.includes("fit") && !sentiment.includes("doesn't fit"))
        pros.push("Good fit");
      if (sentiment.includes("value") || sentiment.includes("worth") || sentiment.includes("price"))
        pros.push("Solid value for money");

      if (sentiment.includes("bulky") || sentiment.includes("heavy"))
        cons.push("On the heavier side");
      if (sentiment.includes("loose") || sentiment.includes("fall") || sentiment.includes("doesn't fit"))
        cons.push("Fit may not suit everyone");
      if (sentiment.includes("bass") && (sentiment.includes("lack") || sentiment.includes("weak")))
        cons.push("Bass could be stronger");
      if (sentiment.includes("mic") && (sentiment.includes("poor") || sentiment.includes("bad") || sentiment.includes("average")))
        cons.push("Microphone quality is average");
      if (sentiment.includes("expensive") || sentiment.includes("pricey"))
        cons.push("On the pricier side");
    }

    // Ensure we have at least some items
    if (pros.length === 0) {
      if (product.features.noiseCancelling) pros.push("Active noise cancellation");
      if (product.features.batteryLifeHours && product.features.batteryLifeHours >= 6)
        pros.push(`${product.features.batteryLifeHours}h battery life`);
      if (product.features.waterResistance) pros.push(`Water-resistant (${product.features.waterResistance})`);
    }
    if (cons.length === 0) {
      cons.push("No specific drawbacks reported in reviews");
    }
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Centered popup */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-border-subtle rounded-lg shadow-2xl flex flex-col w-full max-w-5xl max-h-[88vh] pointer-events-auto"
          >
            {/* Sticky header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle flex-shrink-0">
              <h2 className="font-bold text-xl text-text-primary truncate pr-4 tracking-tight">
                {product.name}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-background transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>

            {/* Scrollable body \u2014 horizontal at lg+ */}
            <div className="flex-1 overflow-y-auto px-8 py-8 text-lg">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left column \u2014 image + price + specs */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="relative aspect-square bg-background rounded-lg overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <PlaceholderImage size={240} className="rounded-none" />
                    )}
                  </div>

                  <div>
                    <p className="text-text-secondary text-base">{product.brand}</p>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-4xl font-bold text-text-primary">
                        {product.price.toFixed(2)}
                      </span>
                      <span className="text-text-secondary text-base uppercase">
                        {product.currency}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">
                      Specifications
                    </h3>
                    <div className="border border-border-subtle rounded-lg overflow-visible text-base">
                      {features.map((f, i) => (
                        <div
                          key={f.label}
                          className={`flex items-center justify-between px-4 py-2.5 ${
                            i % 2 === 0 ? "bg-surface/50" : "bg-background"
                          }`}
                        >
                          <span className="text-text-secondary flex items-center gap-1.5">
                            {f.label}
                            <MetricInfo label={f.label} />
                          </span>
                          <span className="text-text-primary font-medium">
                            {f.value ?? "\u2014"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column \u2014 narrative */}
                <div className="lg:col-span-3 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Description
                    </h3>
                    <p className="text-text-secondary text-lg leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {product.rationale && (
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        Overview
                      </h3>
                      <p className="text-text-secondary text-lg leading-relaxed">
                        {product.rationale}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">
                      Pros & cons
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {pros.map((pro, i) => (
                          <div key={i} className="flex items-start gap-2 text-base">
                            <Check className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                            <span className="text-text-secondary">{pro}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {cons.map((con, i) => (
                          <div key={i} className="flex items-start gap-2 text-base">
                            <Minus className="h-5 w-5 text-red-400 mt-1 flex-shrink-0" />
                            <span className="text-text-secondary">{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {product.customerSentiment && (
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        Customer feedback
                      </h3>
                      <p className="text-text-secondary text-lg leading-relaxed">
                        {product.customerSentiment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky footer with add to cart */}
            <div className="px-6 py-4 border-t border-border-subtle flex-shrink-0">
              <Button
                onClick={() => {
                  addItem(product);
                  onClose();
                }}
                className="w-full bg-accent hover:bg-accent/90 text-white rounded-lg h-12 font-semibold text-base transition-all"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to cart
              </Button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
