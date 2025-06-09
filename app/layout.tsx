import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "U.O.E.C - Uploader",
  description: "Personal image management application"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-zinc-800 text-zinc-50">
      <body className={`${inter.className}`}>
        <div className="min-h-screen">{children}</div>
        <Toaster />
      </body>
    </html>
  )
}


import './globals.css'