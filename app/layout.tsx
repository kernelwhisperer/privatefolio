import "./globals.css";

import { Roboto } from "next/font/google";
import React from "react";

export const roboto = Roboto({
  display: "swap",
  style: ["normal", "italic"],
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  description: "Visualize your trades",
  title: "TradeJournal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        <h1>
          <span className="text-gradient">TradeJournal</span>
        </h1>
        {/* <CssBaseline /> */}
        {children}
      </body>
    </html>
  );
}
