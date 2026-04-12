"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

  const handleCheckout = useCallback(async () => {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product: item.product,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  }, [items]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-96 bg-surface border-l border-border-subtle flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
              <h2 className="text-xl font-bold text-text-primary">Your Cart</h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-4">
                  <ShoppingCart className="h-16 w-16 opacity-30" />
                  <p className="text-lg">Your cart is empty</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.li
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="bg-background rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary text-sm truncate">
                              {item.product.name}
                            </p>
                            <p className="text-text-secondary text-xs">
                              {item.product.brand}
                            </p>
                          </div>
                          <p className="text-text-primary font-semibold text-sm whitespace-nowrap">
                            {(item.product.price * item.quantity).toFixed(2)}{" "}
                            <span className="text-text-secondary text-xs uppercase">
                              {item.product.currency}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                item.quantity > 1
                                  ? updateQuantity(
                                      item.product.id,
                                      item.quantity - 1
                                    )
                                  : removeItem(item.product.id)
                              }
                              className="h-7 w-7 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-text-primary text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              className="h-7 w-7 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-text-secondary hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border-subtle px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Total</span>
                  <span className="text-xl font-bold text-text-primary">
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
                  Proceed to checkout
                </Button>
                <button
                  onClick={clearCart}
                  className="w-full text-center text-text-secondary hover:text-text-primary text-sm transition-colors"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
