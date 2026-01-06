'use client'

import Link from 'next/link'
import { Brain, Home, ArrowLeft, Search, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
            <FileQuestion className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-9xl font-extrabold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 inline-flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          <Link
            href="/research"
            className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold shadow-lg hover:shadow-xl inline-flex items-center justify-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>Start Researching</span>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <Link href="/docs" className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Documentation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Learn how to use MedEvidence AI</p>
          </Link>
          <Link href="/pricing" className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Pricing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View our plans and features</p>
          </Link>
          <Link href="/contact" className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Contact</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get help and support</p>
          </Link>
        </div>
      </div>
    </div>
  )
}





