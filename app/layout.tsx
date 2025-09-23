import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/sonner" // import your toaster
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Live Cricket Auction",
  description: "Real-time cricket player auction system",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans bg-gray-50 text-gray-900">
        <ErrorBoundary>
          {children}
          {/* Add Toaster here so it works app-wide */}
          <Toaster position="top-center" richColors />
        </ErrorBoundary>
      </body>
    </html>
  )
}
