"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import type { LiveProduct } from "@/lib/types";
import PlaceholderImage from "./PlaceholderImage";

interface ProductCardProps {
  product: LiveProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const { addItem } = useCart();

  const features: { label: string; value: string | null }[] = [
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
  ];

  const showPlaceholder = !product.imageUrl || imgError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" as const }}
      className="bg-surface rounded-2xl overflow-hidden flex flex-col hover:shadow-lg hover:shadow-accent/5 transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-video bg-background flex items-center justify-center overflow-hidden">
        {showPlaceholder ? (
          <PlaceholderImage size={200} className="rounded-none" />
        ) : (
          <Image
            src={product.imageUrl!}
            alt={product.name}
            fill
            unoptimized
            className="object-cover"
            onError={() => setImgError(true)}
          />
        )}
        {product.isRecommended && (
          <div className="absolute top-3 left-3">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className={cn(
                      "bg-accent/20 text-accent border border-accent/30 glow-accent",
                      "hover:bg-accent/30 cursor-default"
                    )}
                  >
                    AI Recommended
                  </Badge>
                </TooltipTrigger>
                {product.recommendationReason && (
                  <TooltipContent
                    side="bottom"
                    className="max-w-xs bg-surface border-border-subtle text-text-primary"
                  >
                    {product.recommendationReason}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-semibold text-lg text-text-primary leading-snug">
            {product.name}
          </h3>
          <p className="text-text-secondary text-sm">{product.brand}</p>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-text-primary">
            {product.price.toFixed(2)}
          </span>
          <span className="text-text-secondary text-sm uppercase">
            {product.currency}
          </span>
        </div>

        {/* Feature table */}
        <div className="border border-border-subtle rounded-xl overflow-hidden text-sm">
          {features.map((f, i) => (
            <div
              key={f.label}
              className={cn(
                "flex justify-between px-3 py-2",
                i % 2 === 0 ? "bg-background/50" : "bg-surface"
              )}
            >
              <span className="text-text-secondary">{f.label}</span>
              <span className="text-text-primary font-medium">
                {f.value ?? "\u2014"}
              </span>
            </div>
          ))}
        </div>

        {/* AI Rationale */}
        {product.rationale && (
          <p className="text-sm text-text-secondary italic line-clamp-3 leading-relaxed">
            {product.rationale}
          </p>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        <Button
          onClick={() => addItem(product)}
          className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl h-11 font-semibold transition-all mt-2"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to cart
        </Button>
      </div>
    </motion.div>
  );
}
