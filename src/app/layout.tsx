import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Saswati's Kitchen Admin",
  description: "Operations control portal for Saswati's Kitchen.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
