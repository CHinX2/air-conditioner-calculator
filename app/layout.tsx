import type { Metadata } from "next";

import "./globals.css";
import SwRegister from "@/components/pwa/sw-register";

export const metadata: Metadata = {
  title: "冷氣試算",
  description: "冷氣試算（坪數換算 Kcal/h 與 kW）"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#1a1a40" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
      <SwRegister />
    </html>
  );
}
