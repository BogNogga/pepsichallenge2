"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import type { LiveProduct } from "@/lib/types";
import PlaceholderImage from "./PlaceholderImage";
import MetricInfo from "./MetricInfo";
import ProductDetailDrawer from "./ProductDetailDrawer";
import { dispatchFlyToCart } from "@/lib/fly-to-cart-event";

interface HeroProductCardProps {
  product: LiveProduct;
  /** Whether to render the full content or the skeleton-collapsed shape (during reveal morph). */
  variant?: "reveal" | "grid";
}

/**
 * Hero card variant of the recommended product.
 * Uses layoutId="hero-recommendation" so Framer Motion morphs it between
 * Screen 3b (revealing) and Screen 4 (grid-ready) positions.
 */
export default function HeroProductCard({ product, variant = "grid" }: HeroProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    const card = e.currentTarget.closest("[data-product-card]");
    const img = card?.querySelector("[data-product-img]") as HTMLElement | null;
    if (img) {
      const rect = img.getBoundingClientRect();
      dispatchFlyToCart({
        sourceRect: rect,
        imageUrl: product.imageUrl,
      });
    }
    addItem(product);
  };

  return (
    <>
      <motion.div
        layoutId="hero-recommendation"
        transition={{
          layout: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
        }}
        data-product-card
        className={cn(
          "relative bg-surface rounded-2xl overflow-hidden glow-hero",
          variant === "grid" ? "max-w-3xl mx-auto" : "max-w-md mx-auto"
        )}
      >
        {/* AI #1 Badge */}
        <div className="absolute top-4 left-4 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            AI #1
          </motion.div>
        </div>

        <div className={cn("flex", variant === "grid" ? "flex-col md:flex-row" : "flex-col")}>
          {/* Image */}
          <div
            data-product-img
            className={cn(
              "relative bg-background flex items-center justify-center overflow-hidden flex-shrink-0",
              variant === "grid" ? "md:w-1/2 aspect-video md:aspect-auto" : "aspect-video"
            )}
          >
            {showPlaceholder ? (
              <PlaceholderImage size={220} className="rounded-none" />
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
          </div>

          {/* Content */}
          <div className={cn("p-6 flex flex-col gap-3", variant === "grid" ? "md:w-1/2" : "")}>
            <div>
              <p className="text-text-secondary text-sm">{product.brand}</p>
              <h2 className="font-bold text-2xl text-text-primary leading-tight tracking-tight">
                {product.name}
              </h2>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-text-primary">
                {product.price.toFixed(2)}
              </span>
              <span className="text-text-secondary text-sm uppercase">
                {product.currency}
              </span>
            </div>

            {variant === "grid" && (
              <>
                <div className="border border-border-subtle rounded-xl overflow-hidden text-sm">
                  {features.map((f, i) => (
                    <div
                      key={f.label}
                      className={cn(
                        "flex items-center justify-between px-3 py-2",
                        i % 2 === 0 ? "bg-background/50" : "bg-surface"
                      )}
                    >
                      <span className="text-text-secondary flex items-center gap-1.5">
                        {f.label}
                        <MetricInfo label={f.label} />
                      </span>
                      <span className="text-text-primary font-medium">
                        {f.value ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>

                {product.rationale && (
                  <p className="text-sm text-text-secondary italic line-clamp-3 leading-relaxed">
                    {product.rationale}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-1.5 text-base font-semibold text-accent hover:text-accent/80 transition-colors self-start py-1"
                >
                  Read more
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="flex-1" />

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl h-11 font-semibold transition-all mt-2"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to cart
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <ProductDetailDrawer
        product={drawerOpen ? product : null}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
