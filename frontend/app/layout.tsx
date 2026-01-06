import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import { ToastProvider } from '@/lib/toast-context'
import { AuthProvider } from '@/lib/auth-context'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MedEvidence AI | AI-powered clinical evidence, instantly',
  description: 'Evidence-backed medical answers from PubMed. MedEvidence AI combines PubMed\'s 39 million citations with your institution\'s protocols to provide AI-powered clinical evidence, instantly.',
  keywords: ['medical research', 'PubMed', 'clinical evidence', 'AI healthcare', 'medical literature', 'evidence-based medicine'],
  authors: [{ name: 'MedEvidence AI' }],
  openGraph: {
    title: 'MedEvidence AI | AI-powered clinical evidence',
    description: 'Evidence-backed medical answers from PubMed. Get instant, evidence-based answers with citations from peer-reviewed medical papers.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MedEvidence AI | AI-powered clinical evidence',
    description: 'Evidence-backed medical answers from PubMed',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://medevidence.ai" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

