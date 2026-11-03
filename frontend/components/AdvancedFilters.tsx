'use client'

import { useState } from 'react'
import { Filter, X, Calendar, BookOpen, User, Tag, ArrowUpDown, Sparkles } from 'lucide-react'

export interface SearchFilters {
  year_from?: number
  year_to?: number
  journal?: string
  study_type?: string
  author?: string
  mesh_terms?: string[]
  search_fields?: string[]
  boolean_operator?: string
  sort_by?: string
  sort_order?: string
}

interface AdvancedFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onReset: () => void
}

const STUDY_TYPES = [
  { value: 'RCT', label: 'Randomized Controlled Trial' },
  { value: 'Meta-Analysis', label: 'Meta-Analysis' },
  { value: 'Systematic Review', label: 'Systematic Review' },
  { value: 'Review', label: 'Review' },
  { value: 'Clinical Trial', label: 'Clinical Trial' },
]

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date', label: 'Newest First' },
  { value: 'citations', label: 'Most Cited' },
]

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  const hasActiveFilters =
    filters.year_from ||
    filters.year_to ||
    filters.journal ||
    filters.study_type ||
    filters.author ||
    filters.sort_by !== 'relevance'

  const activeFilterCount = [
    filters.year_from || filters.year_to,
    filters.journal,
    filters.study_type,
    filters.author,
    filters.sort_by !== 'relevance',
  ].filter(Boolean).length

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilter = (key: keyof SearchFilters) => {
    updateFilter(key, undefined)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Compact Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Filter
            className={`w-4 h-4 ${hasActiveFilters ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
          />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel - Always visible when open, compact design */}
      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Year Range - Compact */}
            <div className="space-y-2">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <Calendar className="w-3.5 h-3.5" />
                <span>Year Range</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1900"
                  max={currentYear}
                  value={filters.year_from || ''}
                  onChange={(e) =>
                    updateFilter('year_from', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="From"
                  className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                <input
                  type="number"
                  min="1900"
                  max={currentYear}
                  value={filters.year_to || ''}
                  onChange={(e) =>
                    updateFilter('year_to', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="To"
                  className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              {(filters.year_from || filters.year_to) && (
                <button
                  onClick={() => {
                    clearFilter('year_from')
                    clearFilter('year_to')
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center space-x-1"
                >
                  <X className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Journal - Compact */}
            <div className="space-y-2">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Journal</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.journal || ''}
                  onChange={(e) => updateFilter('journal', e.target.value || undefined)}
                  placeholder="e.g., Nature, Lancet"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-8"
                />
                {filters.journal && (
                  <button
                    onClick={() => clearFilter('journal')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Study Type - Compact */}
            <div className="space-y-2">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <Tag className="w-3.5 h-3.5" />
                <span>Study Type</span>
              </label>
              <select
                value={filters.study_type || ''}
                onChange={(e) => updateFilter('study_type', e.target.value || undefined)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {STUDY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Author - Compact */}
            <div className="space-y-2">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <User className="w-3.5 h-3.5" />
                <span>Author</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.author || ''}
                  onChange={(e) => updateFilter('author', e.target.value || undefined)}
                  placeholder="e.g., Smith J"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-8"
                />
                {filters.author && (
                  <button
                    onClick={() => clearFilter('author')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sort By - Full width, below other filters */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort Results</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilter('sort_by', option.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    (filters.sort_by || 'relevance') === option.value
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {filters.year_from && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs">
                    <span>
                      Year: {filters.year_from}
                      {filters.year_to ? `-${filters.year_to}` : '+'}
                    </span>
                    <button
                      onClick={() => {
                        clearFilter('year_from')
                        clearFilter('year_to')
                      }}
                      className="hover:text-emerald-900 dark:hover:text-emerald-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.journal && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs">
                    <span>Journal: {filters.journal}</span>
                    <button
                      onClick={() => clearFilter('journal')}
                      className="hover:text-emerald-900 dark:hover:text-emerald-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.study_type && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs">
                    <span>Type: {filters.study_type}</span>
                    <button
                      onClick={() => clearFilter('study_type')}
                      className="hover:text-emerald-900 dark:hover:text-emerald-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.author && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs">
                    <span>Author: {filters.author}</span>
                    <button
                      onClick={() => clearFilter('author')}
                      className="hover:text-emerald-900 dark:hover:text-emerald-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.sort_by && filters.sort_by !== 'relevance' && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs">
                    <span>
                      Sort: {SORT_OPTIONS.find((o) => o.value === filters.sort_by)?.label}
                    </span>
                    <button
                      onClick={() => updateFilter('sort_by', 'relevance')}
                      className="hover:text-emerald-900 dark:hover:text-emerald-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
