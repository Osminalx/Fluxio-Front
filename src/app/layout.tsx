import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { AuthInitializer } from "@/components/auth/auth-initializer"
import { AuthWrapper } from "@/components/auth/auth-wrapper"
import { TanstackProvider } from "@/components/providers/tanstack-provider"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload primary font
})

export const metadata: Metadata = {
  title: "FluxIO - Personal Finance Tracker",
  description: "Track your finances with style inspired by Persona 3 Reload",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased persona-gradient min-h-screen`}
      >
        <TanstackProvider>
          <AuthInitializer>
            <AuthWrapper>{children}</AuthWrapper>
          </AuthInitializer>
        </TanstackProvider>
      </body>
    </html>
  )
}
