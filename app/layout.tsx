import React from "react";

import { App } from "./components/RootLayout/App";

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
        <App>{children}</App>
      </body>
    </html>
  );
}
