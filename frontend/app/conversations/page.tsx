'use client'

import Link from 'next/link'
import ChatHistory from '@/components/ChatHistory'
import AppHeader from '@/components/AppHeader'
import RequireAuth from '@/components/RequireAuth'

export default function ConversationsPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader active="history" />

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/"
              className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/research"
              className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Research
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">Chat History</span>
          </nav>
          <ChatHistory />
        </div>
      </div>
    </RequireAuth>
  )
}
