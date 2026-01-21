'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe, Check } from 'lucide-react'
import { SUPPORTED_LANGUAGES, setLanguage, getLanguage, type LanguageCode } from '@/lib/i18n'

interface LanguageSwitcherProps {
  className?: string
  showLabel?: boolean
}

export default function LanguageSwitcher({ className = '', showLabel = false }: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentLang(getLanguage())
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = (langCode: LanguageCode) => {
    setLanguage(langCode)
    setCurrentLang(langCode)
    setIsOpen(false)
    // Reload page to apply language changes
    window.location.reload()
  }

  const currentLangInfo = SUPPORTED_LANGUAGES[currentLang]

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title="Change Language"
      >
        <Globe className="w-4 h-4" />
        {showLabel && (
          <span className="text-sm font-medium">{currentLangInfo.nativeName}</span>
        )}
        <span className="text-lg">{currentLangInfo.flag}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Select Language
              </div>
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code as LanguageCode)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    currentLang === code
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{info.flag}</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">{info.nativeName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{info.name}</div>
                    </div>
                  </div>
                  {currentLang === code && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}





