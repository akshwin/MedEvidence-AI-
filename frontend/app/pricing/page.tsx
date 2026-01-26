'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, ArrowLeft, Check, Zap, Shield, Database, MessageSquare, Search, FileText, Download, Users, Crown, Sparkles, ArrowRight } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import MobileMenu from '@/components/MobileMenu'
import { useTheme } from '@/lib/theme-context'

interface Plan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  icon: React.ReactNode
  gradient: string
  buttonText: string
  buttonLink: string
  popular?: boolean
  badge?: string
}

export default function PricingPage() {
  const { theme } = useTheme()

  const plans: Plan[] = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for students and individual researchers',
      icon: <Sparkles className="w-8 h-8" />,
      gradient: 'from-gray-500 to-gray-600',
      buttonText: 'Get Started Free',
      buttonLink: '/research',
      features: [
        '10 questions per day',
        '5 paper searches per day',
        'Basic citations',
        'PDF download (limited)',
        'Community support',
        'Access to 30M+ papers'
      ]
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'Ideal for healthcare professionals and researchers',
      icon: <Zap className="w-8 h-8" />,
      gradient: 'from-emerald-500 to-teal-600',
      buttonText: 'Start Pro Trial',
      buttonLink: '/research',
      popular: true,
      badge: 'Most Popular',
      features: [
        'Unlimited questions',
        'Unlimited paper searches',
        'Advanced citations with relevance scores',
        'Unlimited PDF downloads',
        'Priority support',
        'Access to 30M+ papers',
        'Export research reports',
        'Save favorite papers',
        'Advanced search filters'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For hospitals, clinics, and research institutions',
      icon: <Crown className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-600',
      buttonText: 'Contact Sales',
      buttonLink: '/research',
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Custom API access',
        'Dedicated support',
        'SLA guarantee',
        'Custom integrations',
        'Advanced analytics',
        'White-label options',
        'Training & onboarding',
        'Priority feature requests'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation Header */}
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transform group-hover:scale-105 transition-transform">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    MedEvidence AI
                  </h1>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Evidence-Based Medical Research</p>
                </div>
              </Link>
            </div>
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

      {/* Pricing Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <Zap className="w-4 h-4" />
            <span>Choose Your Plan</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Simple, Transparent
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Select the plan that fits your needs. All plans include access to our comprehensive medical research database.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${plan.popular
                  ? 'border-emerald-500 dark:border-emerald-500 scale-105'
                  : 'border-gray-200 dark:border-gray-700'
                }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white`}>
                  {plan.icon}
                </div>

                {/* Plan Name & Description */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && (
                      <span className="text-gray-500 dark:text-gray-400 ml-2 text-lg">/{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  href={plan.buttonLink}
                  className={`block w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-300 ${plan.popular
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transform hover:-translate-y-0.5'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Compare Plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-900 dark:text-white font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">Free</th>
                  <th className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">Pro</th>
                  <th className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Questions per day</td>
                  <td className="py-4 px-4 text-center text-gray-900 dark:text-white font-medium">10</td>
                  <td className="py-4 px-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">Unlimited</td>
                  <td className="py-4 px-4 text-center text-purple-600 dark:text-purple-400 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Paper searches per day</td>
                  <td className="py-4 px-4 text-center text-gray-900 dark:text-white font-medium">5</td>
                  <td className="py-4 px-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">Unlimited</td>
                  <td className="py-4 px-4 text-center text-purple-600 dark:text-purple-400 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">PDF downloads</td>
                  <td className="py-4 px-4 text-center text-gray-900 dark:text-white font-medium">Limited</td>
                  <td className="py-4 px-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">Unlimited</td>
                  <td className="py-4 px-4 text-center text-purple-600 dark:text-purple-400 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Advanced citations</td>
                  <td className="py-4 px-4 text-center text-gray-400 dark:text-gray-600">—</td>
                  <td className="py-4 px-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">✓</td>
                  <td className="py-4 px-4 text-center text-purple-600 dark:text-purple-400 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Export reports</td>
                  <td className="py-4 px-4 text-center text-gray-400 dark:text-gray-600">—</td>
                  <td className="py-4 px-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">✓</td>
                  <td className="py-4 px-4 text-center text-purple-600 dark:text-purple-400 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">API access</td>
                  <td className="py-4 px-4 text-center text-gray-400 dark:text-gray-600">—</td>
                  <td className="py-4 px-4 text-center text-gray-400 dark:text-gray-600">—</td>
                  <td className="py-4 px-4 text-center text-purple-600 dark:text-purple-400 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Team members</td>
                  <td className="py-4 px-4 text-center text-gray-900 dark:text-white font-medium">1</td>
                  <td className="py-4 px-4 text-center text-gray-900 dark:text-white font-medium">1</td>
                  <td className="py-4 px-4 text-center text-purple-600 dark:text-purple-400 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Support</td>
                  <td className="py-4 px-4 text-center text-gray-900 dark:text-white font-medium">Community</td>
                  <td className="py-4 px-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">Priority</td>
                  <td className="py-4 px-4 text-center text-purple-600 dark:text-purple-400 font-semibold">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6 mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can I change plans later?</h3>
              <p className="text-gray-600 dark:text-gray-400">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-400">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 dark:text-gray-400">Yes! The Free plan is available forever. Pro plans include a 14-day free trial with full access.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-emerald-100 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of healthcare professionals using MedEvidence AI for evidence-based research
            </p>
            <Link
              href="/research"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span>Start Researching Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
