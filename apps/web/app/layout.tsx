

import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Booking leilighet Kreta",
  description: "Book leilighet på Kreta",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="no">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
