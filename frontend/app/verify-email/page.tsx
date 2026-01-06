'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useToast } from '@/lib/toast-context'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      return
    }

    const verifyEmail = async () => {
      try {
        const result = await authApi.verifyEmail(token)
        setStatus('success')
        const messageText = result.message || 'Email verified successfully!'
        setMessage(messageText)
        
        // Show appropriate toast based on message
        if (messageText.toLowerCase().includes('already verified')) {
          showToast('Email was already verified', 'info')
        } else {
          showToast('Email verified successfully!', 'success')
        }
        
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } catch (error: any) {
        console.error('Verification error:', error)
        console.error('Error response:', error.response)
        setStatus('error')
        let errorMessage = 'Verification failed. The link may have expired.'
        
        if (error.response) {
          errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage
        } else if (error.message) {
          errorMessage = error.message
        }
        
        setMessage(errorMessage)
        showToast(errorMessage, 'error')
      }
    }

    verifyEmail()
  }, [searchParams, router, showToast])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying your email...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {message.toLowerCase().includes('already verified') ? 'Already Verified!' : 'Email Verified!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Redirecting to home page...
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all"
            >
              <span>Go to Home</span>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Link
                href="/resend-verification"
                className="block w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all"
              >
                Resend Verification Email
              </Link>
              <Link
                href="/login"
                className="block w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

