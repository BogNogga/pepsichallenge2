"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  subscribeFlyToCart,
  dispatchCartPulse,
  type FlyToCartDetail,
} from "@/lib/fly-to-cart-event";

interface Flight {
  id: number;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
  endX: number;
  endY: number;
  imageUrl: string | null;
}

interface FlyToCartProps {
  cartIconRef: React.RefObject<HTMLElement>;
}

const DURATION_MS = 300;

let nextId = 0;

export default function FlyToCart({ cartIconRef }: FlyToCartProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    return subscribeFlyToCart((detail: FlyToCartDetail) => {
      const target = cartIconRef.current;
      if (!target) {
        // No cart icon (we're on a screen without it). Just trigger the pulse anyway.
        dispatchCartPulse();
        return;
      }
      const targetRect = target.getBoundingClientRect();
      const flight: Flight = {
        id: nextId++,
        startX: detail.sourceRect.left,
        startY: detail.sourceRect.top,
        startW: detail.sourceRect.width,
        startH: detail.sourceRect.height,
        endX: targetRect.left + targetRect.width / 2,
        endY: targetRect.top + targetRect.height / 2,
        imageUrl: detail.imageUrl,
      };
      setFlights((arr) => [...arr, flight]);

      // Schedule cleanup + cart pulse on arrival.
      window.setTimeout(() => {
        dispatchCartPulse();
        setFlights((arr) => arr.filter((f) => f.id !== flight.id));
      }, DURATION_MS);
    });
  }, [cartIconRef]);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[60]">
      {flights.map((f) => {
        // Inline animation via CSS transitions:
        // Render at start, then on next frame apply transform to end.
        return <FlightClone key={f.id} flight={f} />;
      })}
    </div>,
    document.body
  );
}

function FlightClone({ flight }: { flight: Flight }) {
  const [transform, setTransform] = useState<{
    x: number;
    y: number;
    scale: number;
    opacity: number;
  }>({
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
  });

  useEffect(() => {
    // Trigger the animation on next frame so the transition kicks in.
    const id = window.requestAnimationFrame(() => {
      const dx = flight.endX - (flight.startX + flight.startW / 2);
      const dy = flight.endY - (flight.startY + flight.startH / 2);
      setTransform({
        x: dx,
        y: dy,
        scale: 0.2,
        opacity: 0,
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [flight]);

  const style: React.CSSProperties = {
    position: "absolute",
    left: flight.startX,
    top: flight.startY,
    width: flight.startW,
    height: flight.startH,
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
    opacity: transform.opacity,
    transformOrigin: "center",
    transition: `transform ${DURATION_MS}ms cubic-bezier(0.4, 0, 0.6, 1), opacity ${DURATION_MS}ms ease-in`,
    borderRadius: "1rem",
    overflow: "hidden",
    backgroundColor: "#141414",
    boxShadow: "0 0 30px rgba(6,182,212,0.4)",
  };

  return (
    <div style={style}>
      {flight.imageUrl ? (
        // Avoid Next/Image here — direct img is fine for ephemeral clone.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={flight.imageUrl}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-accent/30 to-accent/10" />
      )}
    </div>
  );
}
