import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import type { CartItem } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { items } = (await request.json()) as { items: CartItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty 'items' array" },
        { status: 400 }
      );
    }

    // WARNING: client-trusted prices. Demo only, not production-safe.
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map((item: CartItem) => ({
        price_data: {
          currency: item.product.currency.toLowerCase(),
          product_data: { name: `${item.product.brand} ${item.product.name}` },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?screen=results`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}
