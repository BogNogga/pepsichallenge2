"use client";

export type FlyToCartDetail = {
  sourceRect: DOMRect;
  imageUrl: string | null;
};

const EVENT_NAME = "flytocart";

export function dispatchFlyToCart(detail: FlyToCartDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FlyToCartDetail>(EVENT_NAME, { detail }));
}

export function subscribeFlyToCart(handler: (detail: FlyToCartDetail) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    handler((e as CustomEvent<FlyToCartDetail>).detail);
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

const PULSE_EVENT = "cart-pulse";

export function dispatchCartPulse() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PULSE_EVENT));
}

export function subscribeCartPulse(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PULSE_EVENT, handler);
  return () => window.removeEventListener(PULSE_EVENT, handler);
}
