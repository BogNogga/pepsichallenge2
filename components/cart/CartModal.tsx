"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import PlaceholderImage from "@/components/PlaceholderImage";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** RefObject for the cart icon — used to compute scale-from-icon transform-origin. */
  anchorRef: React.RefObject<HTMLElement>;
}

export default function CartModal({ isOpen, onClose, anchorRef }: CartModalProps) {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  const handleCheckout = useCallback(async () => {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ product: item.product, quantity: item.quantity })),
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
    }
  }, [items]);

  // Compute transform origin from anchor rect (cart icon center) at open time.
  // Updated each open in case viewport changed.
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Compute origin
  let originStyle: React.CSSProperties = { transformOrigin: "100% 0%" };
  if (typeof window !== "undefined" && anchorRef.current) {
    const rect = anchorRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    originStyle = {
      transformOrigin: `${cx}px ${cy}px`,
    };
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-6">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={originStyle}
              className="bg-surface border border-border-subtle rounded-3xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[80vh] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
                <h2 className="text-xl font-bold text-text-primary tracking-tight">
                  Your cart
                  {totalItems > 0 && (
                    <span className="ml-2 text-sm text-text-secondary font-normal">
                      ({totalItems} {totalItems === 1 ? "item" : "items"})
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[200px]">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-3 py-10">
                    <ShoppingCart className="h-12 w-12 opacity-30" strokeWidth={1.5} />
                    <p className="text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <motion.li
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.25 }}
                          className="bg-background rounded-xl p-3 flex items-center gap-3"
                        >
                          {/* Thumb */}
                          <div className="relative h-14 w-14 rounded-lg bg-surface flex-shrink-0 overflow-hidden">
                            {item.product.imageUrl ? (
                              <Image
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <PlaceholderImage size={56} className="rounded-none" />
                            )}
                          </div>

                          {/* Name + brand */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary text-sm truncate">
                              {item.product.name}
                            </p>
                            <p className="text-text-secondary text-xs">{item.product.brand}</p>
                          </div>

                          {/* Quantity */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() =>
                                item.quantity > 1
                                  ? updateQuantity(item.product.id, item.quantity - 1)
                                  : removeItem(item.product.id)
                              }
                              className="h-7 w-7 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-text-primary text-sm font-medium w-6 text-center tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-7 w-7 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Price */}
                          <p className="text-text-primary font-semibold text-sm whitespace-nowrap min-w-[5rem] text-right">
                            {(item.product.price * item.quantity).toFixed(2)}{" "}
                            <span className="text-text-secondary text-xs uppercase">
                              {item.product.currency}
                            </span>
                          </p>

                          {/* Remove */}
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-text-secondary hover:text-red-400 transition-colors p-1 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-border-subtle px-6 py-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Total</span>
                    <span className="text-xl font-bold text-text-primary tabular-nums">
                      {totalPrice.toFixed(2)}{" "}
                      <span className="text-text-secondary text-sm uppercase">
                        {items[0]?.product.currency ?? "USD"}
                      </span>
                    </span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl h-12 font-semibold text-base transition-all"
                  >
                    Checkout to Stripe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <button
                    onClick={clearCart}
                    className="w-full text-center text-text-secondary hover:text-text-primary text-xs transition-colors"
                  >
                    Clear cart
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
