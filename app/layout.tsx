import "./globals.css";

import React from "react";

import ThemeRegistry from "./components/Theme/ThemeRegistry";

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
    <html lang="en">
      <body>
        <h1>
          <span className="text-gradient">TradeJournal</span>
        </h1>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
