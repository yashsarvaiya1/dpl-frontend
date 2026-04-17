import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import Providers from "@/components/shared/Providers"
import { PublicEnvScript } from "next-runtime-env" // Changed from PublicEnvProvider

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

const APP_NAME = "DPL"
const APP_DEFAULT_TITLE = "DPL"
const APP_TITLE_TEMPLATE = "%s - DPL"
const APP_DESCRIPTION = "DPL Application"

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_DEFAULT_TITLE },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: "#0d9488",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-sans"
      )}
    >
      <head>
        {/* This script is MUST for runtime env to work in the browser */}
        <PublicEnvScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
