import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { QueryProvider } from '@/lib/providers/query-provider'
import { ThemeProvider } from '@/lib/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    template: '%s | Medverus AI',
    default: 'Medverus AI - Premium Medical Information Platform'
  },
  description: 'Advanced medical AI platform providing access to curated medical information, PubMed research, and intelligent medical query processing for healthcare professionals.',
  keywords: [
    'medical AI',
    'healthcare',
    'medical research',
    'PubMed',
    'clinical decision support',
    'medical information',
    'healthcare professionals'
  ],
  authors: [
    {
      name: 'Medverus Team',
      url: 'https://medverus.ai'
    }
  ],
  creator: 'Medverus',
  publisher: 'Medverus',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://medverus.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Medverus AI - Medical Information Platform',
    description: 'Advanced medical AI platform for healthcare professionals',
    siteName: 'Medverus AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Medverus AI - Medical Information Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medverus AI - Medical Information Platform',
    description: 'Advanced medical AI platform for healthcare professionals',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
  category: 'healthcare',
  classification: 'Medical Information Platform',
  // Medical app specific metadata
  other: {
    'medical-disclaimer': 'This platform is for informational purposes only and does not provide medical advice',
    'target-audience': 'Healthcare professionals',
    'content-rating': 'Medical professional use only'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Medical app security headers */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://medverus-backend.fly.dev; font-src 'self';" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Medical app viewport and PWA setup */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Medverus AI" />
        
        {/* Preconnect to medical backend */}
        <link rel="preconnect" href="https://medverus-backend.fly.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://medverus-backend.fly.dev" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Medical disclaimer in head for screen readers */}
        <meta name="medical-disclaimer" content="This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical decisions." />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-background font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {/* Medical disclaimer for screen readers */}
            <div className="sr-only" role="alert" aria-live="polite">
              Medical Disclaimer: This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical decisions.
            </div>
            
            {/* Main application */}
            <div className="relative flex min-h-screen flex-col">
              <main className="flex-1">
                {children}
              </main>
            </div>
            
            {/* Toast notifications */}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }, function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}