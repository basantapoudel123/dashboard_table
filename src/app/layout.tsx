import type { Metadata } from "next"
import { JetBrains_Mono, Libre_Baskerville, Outfit } from "next/font/google"

import { AppProviders } from "@/components/providers"

import "./globals.css"

/** Body & UI — Outfit (300 / 400 for copy; heavier weights for UI). */
const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

/** H1/H2 — Libre Baskerville, weight 700 for strong authority. */
const fontHeading = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "700"],
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Lot inventory dashboard",
  description: "Editable vehicle inventory table (take-home)",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontHeading.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
