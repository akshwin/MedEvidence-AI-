'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Stethoscope, Search, MessageSquare, BookOpen, Zap, Shield, Globe, ArrowRight, CheckCircle2, Brain, Database, Code, Github, Twitter, Linkedin, Mail, Activity, Play, ArrowUp, User, LogOut, BarChart3, History, Bookmark, FileText, Bell, TrendingUp, Clock, ExternalLink } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import DemoVideo from '@/components/DemoVideo'
import MobileMenu from '@/components/MobileMenu'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'
import { dashboardApi, type DashboardStats } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const { theme } = useTheme()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardStats()
    }
  }, [isAuthenticated, user])

  const loadDashboardStats = async () => {
    setLoadingStats(true)
    try {
      const statsData = await dashboardApi.getStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Show authenticated user dashboard
  if (isAuthenticated && user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Navigation */}
        <nav className={`border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm'
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
          } sticky top-0 z-50`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transform hover:scale-105 transition-transform">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    MedEvidence AI
                  </h1>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Evidence-Based Medical Research</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <ThemeToggle />
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <Link href="/dashboard" className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/research" className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 inline-flex items-center space-x-1.5">
                  Research
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/conversations" className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>History</span>
                </Link>
                <Link href="/profile" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm">
                  <User className="w-4 h-4" />
                  <span>{user?.full_name || user?.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
              <MobileMenu />
            </div>
          </div>
        </nav>

        {/* Welcome Dashboard */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.full_name || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Continue your evidence-based medical research journey
            </p>
          </div>

          {/* Quick Actions - Moved to Top */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Start Research Card */}
            <Link href="/research" className="group relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 shadow-2xl hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Start Researching</h3>
                <p className="text-emerald-50 mb-4">Ask clinical questions or search medical literature</p>
                <div className="flex items-center space-x-2 text-white/80 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  <span>AI-powered answers</span>
                  <span className="mx-2">•</span>
                  <Database className="w-4 h-4" />
                  <span>30M+ papers</span>
                </div>
              </div>
            </Link>

            {/* Dashboard Card */}
            <Link href="/dashboard" className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-700 transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">View Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Manage your saved queries, bookmarks, and reading lists</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Bookmark className="w-4 h-4" />
                  <span>{stats?.total_bookmarks || 0} bookmarks</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{stats?.total_notes || 0} notes</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link href="/conversations" className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-700 transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total_conversations}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversations</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{stats.conversations_this_week} this week</p>
              </Link>

              <Link href="/dashboard?tab=bookmarks" className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-teal-200 dark:hover:border-teal-700 transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                    <Bookmark className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total_bookmarks}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bookmarked Papers</p>
              </Link>

              <Link href="/dashboard?tab=lists" className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-cyan-200 dark:hover:border-cyan-700 transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total_reading_lists}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reading Lists</p>
              </Link>

              <Link href="/dashboard?tab=notes" className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-700 transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total_notes}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
              </Link>
            </div>
          ) : null}

          {/* Recent Activity & Quick Links */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Recent Conversations */}
            <Link href="/conversations" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  <span>Recent Conversations</span>
                </h3>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {stats?.total_conversations || 0} total conversations
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                View all →
              </p>
            </Link>

            {/* Saved Queries */}
            <Link href="/dashboard?tab=queries" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Search className="w-5 h-5 text-teal-600" />
                  <span>Saved Queries</span>
                </h3>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {stats?.total_saved_queries || 0} saved searches
              </p>
              <p className="text-teal-600 dark:text-teal-400 text-sm font-medium">
                Manage queries →
              </p>
            </Link>

            {/* Alerts */}
            <Link href="/dashboard?tab=alerts" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  <span>Alerts</span>
                </h3>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {stats?.total_alerts || 0} active alerts
              </p>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                Manage alerts →
              </p>
            </Link>
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <p>© 2026 MedEvidence AI. All rights reserved.</p>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <Link href="/docs" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Documentation
                </Link>
                <Link href="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </div>

        {/* Scroll to Top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-full shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 group"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className={`border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${scrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm'
        : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
        } sticky top-0 z-50`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transform hover:scale-105 transition-transform">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  MedEvidence AI
                </h1>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Evidence-Based Medical Research</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <ThemeToggle />
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm">
                Features
              </a>
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm">
                About
              </a>
              <Link href="/docs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm">
                Docs
              </Link>
              <Link href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm">
                Pricing
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/research" className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 inline-flex items-center space-x-1.5">
                    Research
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/profile" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm">
                    <User className="w-4 h-4" />
                    <span>{user?.full_name || user?.email?.split('@')[0]}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="ml-auto flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm">
                    Login
                  </Link>
                  <Link href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            <MobileMenu />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 max-w-7xl">
        <div className="text-center max-w-5xl mx-auto mb-16">

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
            Evidence-Based Answers from
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Medical Literature
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Get instant, evidence-based answers with citations from peer-reviewed medical papers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-12">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">Peer-Reviewed</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="font-medium">Clinical Evidence</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="font-medium">30M+ Papers</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">Medical-Focused</span>
            </div>
          </div>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-sm">
            <Activity className="w-4 h-4" />
            <span>Evidence-Based Medical Research AI</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/research"
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold text-lg shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transform hover:-translate-y-1 inline-flex items-center space-x-2"
            >
              <span>Start Researching</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/docs" className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl inline-block text-center">
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-8 lg:p-12 border border-emerald-100 dark:border-emerald-800/50 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                About <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">MedEvidence AI</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 mx-auto rounded-full"></div>
            </div>
            <div className="space-y-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              <p>
                <strong className="text-emerald-700 dark:text-emerald-400">MedEvidence AI</strong> is an advanced medical research platform that provides instant, evidence-based answers from peer-reviewed medical literature. Our AI-powered system searches through <strong className="text-teal-700 dark:text-teal-400">30+ million PubMed citations</strong> to deliver accurate, clinically relevant information with full citations.
              </p>
              <p>
                Designed specifically for healthcare professionals, researchers, and medical students, MedEvidence AI combines the power of artificial intelligence with the rigor of peer-reviewed medical research. Every answer is backed by real medical papers, ensuring you get trustworthy, evidence-based information for clinical decision-making.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Evidence-Based</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All answers sourced from peer-reviewed medical literature</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Comprehensive</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Access to 30M+ medical papers from PubMed</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Instant Results</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get answers in seconds with full citations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <Zap className="w-4 h-4" />
            <span>See It In Action</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Experience AI-Powered
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Medical Research</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Watch how MedEvidence AI helps healthcare professionals find evidence-based answers and search through millions of medical papers
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Video Player */}
          <DemoVideo 
            videoType="direct"
            videoUrl="/videos/demo-video.mp4"
          />

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ask Clinical Questions</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Get instant, evidence-based answers to clinical questions with citations from peer-reviewed medical literature
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Search Medical Papers</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Search through 30+ million medical papers using advanced semantic search to find relevant clinical studies
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <Link
              href="/research"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold text-lg shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transform hover:-translate-y-1"
            >
              <span>Try It Yourself</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 lg:p-16 shadow-2xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2">30M+</div>
              <div className="text-emerald-100 font-medium">Peer-Reviewed Papers</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2">100%</div>
              <div className="text-emerald-100 font-medium">Evidence-Based</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2">24/7</div>
              <div className="text-emerald-100 font-medium">Clinical Access</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2">Open</div>
              <div className="text-emerald-100 font-medium">Source</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <CheckCircle2 className="w-4 h-4" />
            <span>Clinical Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Built for
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Healthcare Professionals</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Evidence-based AI tools designed specifically for clinicians, researchers, and medical students
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-600 hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Clinical Evidence</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Get evidence-based answers with citations from peer-reviewed medical literature. Every response is backed by clinical research.
            </p>
          </div>
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-600 hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Medical Literature Search</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Search through millions of medical papers using advanced semantic search. Find clinical studies, guidelines, and research instantly.
            </p>
          </div>
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-600 hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Peer-Reviewed Citations</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Every answer includes citations from PubMed with direct links. Verify sources and access full papers for clinical decision-making.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand Column */}
            <div className="md:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-white">MedEvidence AI</span>
                  <p className="text-xs text-gray-400">Evidence-Based Medical Research</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Evidence-based medical research platform for healthcare professionals.
              </p>
              <div className="flex items-center space-x-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4 text-gray-300 hover:text-white transition-colors" />
                </a>
                <a
                  href="mailto:akshwint.2003@gmail.com"
                  className="w-9 h-9 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4 text-gray-300 hover:text-white transition-colors" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Quick Links</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/research" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                    Research
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Pricing Section */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Pricing</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                    View Plans
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Contact</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                    Get in Touch
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700/50 dark:border-gray-800/50 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-sm text-gray-400">
              <span className="text-center">© 2026 MedEvidence AI. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Go to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-full shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
        </button>
      )}
    </div>
  )
}
