'use client'

import Link from 'next/link'
import { Brain, ArrowLeft, FileText } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transform group-hover:scale-105 transition-transform">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  MedEvidence AI
                </h1>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Terms of Service
                </p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="h-6 w-px bg-gray-200 dark:border-gray-700" />
              <Link
                href="/"
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Terms Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 lg:p-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <div className="prose prose-emerald dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                By accessing and using MedEvidence AI, you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to these terms, please do not
                use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. Use License
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Permission is granted to temporarily use MedEvidence AI for personal, non-commercial
                transitory viewing only. This is the grant of a license, not a transfer of title,
                and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. Medical Disclaimer
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                <strong className="text-gray-900 dark:text-white">Important:</strong> MedEvidence AI
                is a research tool and does not provide medical advice, diagnosis, or treatment. The
                information provided is for research and educational purposes only. Always consult
                qualified healthcare professionals for medical advice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. User Accounts
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                When you create an account, you are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                5. Prohibited Uses
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                You may not use our service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>For any unlawful purpose</li>
                <li>To violate any laws or regulations</li>
                <li>To infringe upon intellectual property rights</li>
                <li>To transmit harmful or malicious code</li>
                <li>To interfere with the service's operation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                6. Limitation of Liability
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                In no event shall MedEvidence AI or its suppliers be liable for any damages arising
                out of the use or inability to use the materials on our platform, even if we have
                been notified of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                7. Changes to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We reserve the right to revise these terms at any time without notice. By using this
                service, you are agreeing to be bound by the then current version of these Terms of
                Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                8. Contact Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a
                  href="mailto:legal@medevidence.ai"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  legal@medevidence.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
