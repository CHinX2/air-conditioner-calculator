import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Aircooling Calculator",
  description: "Calculate cooling capacity by ping, kcal/h, and kW."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
