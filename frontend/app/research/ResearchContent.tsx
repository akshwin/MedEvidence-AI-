'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, MessageSquare, Zap, Lock } from 'lucide-react'
import Chat from '@/components/Chat'
import SearchBar from '@/components/SearchBar'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'
import AppHeader from '@/components/AppHeader'

export default function ResearchContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat')
  const { theme } = useTheme()
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Check for query parameter to set initial tab and query
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const queryParam = searchParams.get('query')

    if (tabParam === 'search' || tabParam === 'chat') {
      setActiveTab(tabParam)
    }

    // If there's a query parameter, we'll need to pass it to the components
    // This will be handled by the components themselves via URL params
  }, [searchParams])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Don't redirect automatically, show the auth prompt instead
    }
  }, [isAuthenticated, loading])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <AppHeader active="research" subtitle="Research Platform" />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Research</span>
        </nav>

        {/* Auth Prompt */}
        {!isAuthenticated && !loading && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-8 mb-8 text-center">
            <Lock className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in or sign up to access the research features and save your conversations.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link
                href="/login"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-semibold"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'chat'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'search'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Search Papers</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          {activeTab === 'chat' ? <Chat /> : <SearchBar />}
        </div>
      </div>
    </div>
  )
}
