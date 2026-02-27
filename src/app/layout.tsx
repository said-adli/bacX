import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

import { GlobalErrorBoundary as ErrorBoundary } from "@/components/GlobalErrorBoundary";

// removed force-dynamic to enable Static-by-Default rendering

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: 'swap',
});

import { Amiri, Cinzel } from "next/font/google";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

// --- SEO & VIEWPORT ---
export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: '%s | BrainyDZ',
    default: 'BrainyDZ | منصة التفوق الأكاديمي',
  },
  icons: {
    icon: '/images/favicon1.png',
    shortcut: '/images/favicon1.png',
    apple: '/images/favicon1.png',
  },
  description: "رحلة سينمائية نحو النجاح في البكالوريا.",
  keywords: ["brainy", "bac dz", "bac algeria", "تعليم", "بكالوريا", "دروس", "منصة تعليمية"],
  authors: [{ name: "Brainy Team" }],
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: "https://brainy-dz.vercel.app",
    siteName: "Brainy",
    title: "Brainy - منصة التفوق الأكاديمي",
    description: "استعد للبكالوريا مع أفضل الأساتذة في بيئة تعليمية ذكية.",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brainy - منصة التفوق الأكاديمي",
    description: "استعد للبكالوريا مع أفضل الأساتذة في بيئة تعليمية ذكية.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

// ============================================================================
// ROOT LAYOUT - NON-BLOCKING
// ============================================================================
// CRITICAL FIX: Removed async data fetching from root layout.
// Auth hydration now happens client-side via AuthProvider's useEffect.
// This prevents blocking the main thread on every navigation.
// ============================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${ibmPlexSansArabic.variable} ${playfairDisplay.variable} ${amiri.variable} ${cinzel.variable} antialiased bg-background text-foreground font-sans selection:bg-primary/30`}>
        <AuthProvider>
          <ErrorBoundary>
            {children}
            <Toaster
              position="bottom-center"
              richColors
              theme="dark"
              toastOptions={{
                className: "glass-panel text-foreground font-sans",
                style: {
                  fontFamily: 'var(--font-sans)',
                  background: 'rgba(10, 10, 15, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFF'
                }
              }}
            />
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
