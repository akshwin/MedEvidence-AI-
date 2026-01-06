'use client'

import { Suspense } from 'react'
import DashboardContent from './DashboardContent'
import RequireAuth from '@/components/RequireAuth'

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RequireAuth>
        <DashboardContent />
      </RequireAuth>
    </Suspense>
  )
}
