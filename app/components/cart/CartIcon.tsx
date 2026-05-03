"use client";

import { forwardRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { subscribeCartPulse } from "@/lib/fly-to-cart-event";

interface CartIconProps {
  onClick: () => void;
}

const CartIcon = forwardRef<HTMLButtonElement, CartIconProps>(function CartIcon(
  { onClick },
  ref
) {
  const { totalItems } = useCart();
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(
    () =>
      subscribeCartPulse(() => {
        setPulseKey((k) => k + 1);
      }),
    []
  );

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      animate={
        pulseKey > 0
          ? { scale: [1, 1.1, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      key={`pulse-${pulseKey}`}
      className="relative flex items-center justify-center h-11 w-11 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
      aria-label="Open cart"
    >
      <ShoppingCart className="h-6 w-6" strokeWidth={2.2} />
      {totalItems > 0 && (
        <motion.span
          key={totalItems}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow-md"
        >
          {totalItems}
        </motion.span>
      )}
    </motion.button>
  );
});

export default CartIcon;
