import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"
import AuthProvider from "../(MainContent)/AuthProvider"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "DefakeZone | Identify AI-Generated Images",
    description:
        "Upload and analyze images to detect if they're real or AI-generated deepfakes with our cutting-edge technology.",
    openGraph: {
        title: "DefakeZone | Identify AI-Generated Images",
        description:
            "Upload and analyze images to detect if they're real or AI-generated deepfakes with our cutting-edge technology.",
        images: ["/og-image.jpg"],
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-white`}
            >
                <AuthProvider>
                    <Header />
                    <div className="flex-grow">{children}</div>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    )
}
