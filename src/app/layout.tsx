import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/contexts/toast-context";
import { CartProvider } from "@/contexts/cart-context";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import Toaster from "@/components/Toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "DevFlow - Crie sua loja online",
  description: "Plataforma para criar e gerenciar sua loja com pedidos via WhatsApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">
        <ReactQueryProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                {children}
                <Toaster />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
