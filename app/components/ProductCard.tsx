"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import type { LiveProduct } from "@/lib/types";
import PlaceholderImage from "./PlaceholderImage";
import MetricInfo from "./MetricInfo";
import ProductDetailDrawer from "./ProductDetailDrawer";
import { dispatchFlyToCart } from "@/lib/fly-to-cart-event";

interface ProductCardProps {
  product: LiveProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
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
      dispatchFlyToCart({ sourceRect: rect, imageUrl: product.imageUrl });
    }
    addItem(product);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" as const }}
        whileHover={{ y: -2 }}
        data-product-card
        className="bg-surface rounded-2xl overflow-hidden flex flex-col border border-border-subtle/60 hover:border-accent/40 transition-colors"
      >
        {/* Image */}
        <div
          data-product-img
          className="relative aspect-video bg-background flex items-center justify-center overflow-hidden"
        >
          {showPlaceholder ? (
            <PlaceholderImage size={180} className="rounded-none" />
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
        <div className="p-5 flex flex-col flex-1 gap-3">
          <div>
            <p className="text-text-secondary text-sm">{product.brand}</p>
            <h3 className="font-semibold text-lg text-text-primary leading-snug">
              {product.name}
            </h3>
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
            <p className="text-sm text-text-secondary italic line-clamp-2 leading-relaxed">
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
        </div>
      </motion.div>

      <ProductDetailDrawer
        product={drawerOpen ? product : null}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
