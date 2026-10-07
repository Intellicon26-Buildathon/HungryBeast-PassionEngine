import type { Metadata } from "next";
import "./globals.css";

import { AuthLayout } from "@/components/AuthLayout";

export const metadata: Metadata = {
  title: "The Passion Discovery Engine — Experience the work. Discover yourself.",
  description:
    "Don't just read about careers — step into them. AI-powered job simulations that let Sri Lankan students experience real work before they choose a path.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthLayout>{children}</AuthLayout>
      </body>
    </html>
  );
}
