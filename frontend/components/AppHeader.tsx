'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Brain, BarChart3, History, User, LogOut } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import MobileMenu from '@/components/MobileMenu'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast-context'

type ActiveNav = 'dashboard' | 'research' | 'history' | 'profile' | undefined

export default function AppHeader({
  active,
  subtitle,
  rightSlot,
}: {
  active?: ActiveNav
  subtitle?: string
  rightSlot?: React.ReactNode
}) {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  const linkClass = (key?: ActiveNav) =>
    `px-4 py-2 transition-colors font-medium text-sm flex items-center space-x-2 ${
      active === key
        ? 'text-emerald-700 dark:text-emerald-400'
        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
    }`

  return (
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
              {subtitle ? (
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{subtitle}</p>
              ) : null}
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-gray-200 dark:border-gray-700 hidden md:block" />

            {rightSlot ? <div className="hidden md:flex items-center space-x-2">{rightSlot}</div> : null}

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-1">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className={linkClass('dashboard')}>
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/research" className={linkClass('research')}>
                    <span>Research</span>
                  </Link>
                  <Link href="/conversations" className={linkClass('history')}>
                    <History className="w-4 h-4" />
                    <span>History</span>
                  </Link>
                  <Link href="/profile" className={linkClass('profile')}>
                    <User className="w-4 h-4" />
                    <span>{user?.full_name || user?.email?.split('@')[0] || 'User'}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      showToast('Logged out successfully', 'success')
                      router.push('/login')
                    }}
                    className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium text-sm flex items-center space-x-2"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                !loading && (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
                    >
                      Sign Up
                    </Link>
                  </>
                )
              )}
            </div>

            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  )
}


