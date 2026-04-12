import type { Metadata } from "next";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Shopping Assistant — Bluetooth Earbuds",
  description:
    "Experience AI-powered product discovery. Find the perfect Bluetooth earbuds with intelligent recommendations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-text-primary font-sans antialiased">
        <CartProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#141414",
                color: "#FAFAFA",
                border: "1px solid #262626",
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
