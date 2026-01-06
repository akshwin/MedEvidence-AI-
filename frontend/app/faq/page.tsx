'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, ArrowLeft, ChevronDown, HelpCircle } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import MobileMenu from '@/components/MobileMenu'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'What is MedEvidence AI?',
    answer: 'MedEvidence AI is an AI-powered medical research platform that provides instant, evidence-based answers from peer-reviewed medical literature. It searches through 30+ million PubMed citations to deliver accurate, clinically relevant information with full citations.',
  },
  {
    question: 'How accurate are the answers?',
    answer: 'All answers are sourced from peer-reviewed medical papers indexed in PubMed. Our AI synthesizes information from multiple high-quality sources and provides citations for verification. However, MedEvidence AI is a research tool and does not replace professional medical advice.',
  },
  {
    question: 'Is MedEvidence AI free to use?',
    answer: 'Yes! We offer a free plan with 10 questions per day and 5 paper searches per day. We also have Pro and Enterprise plans with additional features for healthcare professionals and institutions.',
  },
  {
    question: 'Can I use this for medical diagnosis?',
    answer: 'No. MedEvidence AI is a research and educational tool only. It does not provide medical advice, diagnosis, or treatment recommendations. Always consult qualified healthcare professionals for medical decisions.',
  },
  {
    question: 'How do citations work?',
    answer: 'Every answer includes citations from the peer-reviewed papers used. You can click on citations to view the full paper details, including authors, journal, publication date, and direct links to PubMed.',
  },
  {
    question: 'Can I download my research results?',
    answer: 'Yes! You can download answers as PDF files, which include the full answer, all citations, and proper formatting. Pro and Enterprise plans offer unlimited downloads.',
  },
  {
    question: 'What makes MedEvidence AI different from other medical search tools?',
    answer: 'MedEvidence AI uses advanced AI to synthesize information from multiple papers into coherent answers, rather than just returning a list of papers. It understands clinical context and provides evidence-based answers with citations in seconds.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We take data security seriously and implement appropriate technical and organizational measures to protect your information. We do not share your queries or personal data with third parties.',
  },
  {
    question: 'Can I integrate MedEvidence AI with my EHR system?',
    answer: 'Enterprise plans include custom integration options. Please contact our sales team to discuss integration requirements and implementation.',
  },
  {
    question: 'How often is the database updated?',
    answer: 'Our database is continuously updated with new papers from PubMed. We process new publications regularly to ensure you have access to the latest medical research.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

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
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">FAQ</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="h-6 w-px bg-gray-200 dark:border-gray-700 hidden md:block" />
              <Link
                href="/"
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Got <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Questions?</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about MedEvidence AI. Can't find what you're looking for?{' '}
            <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
              Contact us
            </Link>
            .
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden transition-all hover:shadow-xl"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
            <p className="text-emerald-100 mb-6">
              Our support team is here to help. Get in touch and we'll respond as soon as possible.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

