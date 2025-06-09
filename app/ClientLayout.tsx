"use client"

import type React from "react"

import { Inter } from "next/font/google"
import { useEffect } from "react"
import { initializeSampleData } from "@/lib/data"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize data when the app first loads
  useEffect(() => {
    // Initialize data storage
    initializeSampleData()
  }, [])

  return (
    <html lang="en">
      <head>
        <title>MediTrack - Medicine Reminder & Tracker</title>
        <meta name="description" content="Your simple medicine reminder and adherence tracker" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
