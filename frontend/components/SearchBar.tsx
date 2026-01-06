'use client'

import { useState } from 'react'
import { Search, Loader2, FileText, ExternalLink, TrendingUp, Sparkles, Download, BookmarkPlus } from 'lucide-react'
import { searchPapers, Paper, dashboardApi } from '@/lib/api'
import { formatAuthors, formatDate } from '@/lib/utils'
import { downloadSearchResultsPDF } from '@/lib/pdf-utils'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast-context'
import PaperActions from './PaperActions'
import AdvancedFilters, { SearchFilters } from './AdvancedFilters'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [savingQuery, setSavingQuery] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    if (!query.trim() || loading) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await searchPapers(query.trim(), 10, filters)
      setPapers(response.papers)
      
      // Auto-save query if authenticated
      if (isAuthenticated && query.trim()) {
        try {
          await dashboardApi.saveQuery({
            query_text: query.trim(),
            query_type: 'search',
            results_count: response.papers.length
          })
        } catch (saveError) {
          // Silently fail - saving is optional
          console.error('Failed to save query:', saveError)
        }
      }
    } catch (error) {
      console.error('Error searching papers:', error)
      setPapers([])
      showToast('Failed to search papers. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Auto-search when filters change if query exists
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    if (query.trim() && searched) {
      // Debounce filter changes
      setTimeout(() => {
        handleSearch()
      }, 500)
    }
  }

  const handleSaveQuery = async () => {
    if (!query.trim() || !isAuthenticated) {
      showToast('Please login to save queries', 'info')
      return
    }
    
    setSavingQuery(true)
    try {
      await dashboardApi.saveQuery({
        query_text: query.trim(),
        query_type: 'search',
        results_count: papers.length
      })
      showToast('Query saved successfully!', 'success')
    } catch (error: any) {
      showToast('Failed to save query', 'error')
      console.error('Save query error:', error)
    } finally {
      setSavingQuery(false)
    }
  }

  const handleDownloadPDF = () => {
    if (papers.length > 0) {
      const filename = `medevidence-search-${query.substring(0, 30).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`
      downloadSearchResultsPDF(query, papers, filename)
    }
  }

  const exampleQueries = [
    "diabetes treatment",
    "cancer immunotherapy",
    "cardiovascular disease prevention",
    "mental health interventions"
  ]

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medical literature... (e.g., 'diabetes treatment', 'cancer immunotherapy')"
            className={`w-full pl-14 pr-32 sm:pr-36 py-5 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md font-medium ${
              (filters.year_from || filters.year_to || filters.journal || filters.study_type || filters.author || (filters.mesh_terms && filters.mesh_terms.length > 0))
                ? 'border-emerald-300 dark:border-emerald-600'
                : 'border-gray-200 dark:border-gray-600'
            }`}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (!query.trim() || loading)) {
                e.preventDefault()
              }
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            {isAuthenticated && searched && papers.length > 0 && (
              <button
                type="button"
                onClick={handleSaveQuery}
                disabled={savingQuery}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                title="Save this search query"
              >
                {savingQuery ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-600 disabled:hover:via-teal-600 disabled:hover:to-cyan-600 flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={(e) => {
                if (!query.trim() || loading) {
                  e.preventDefault()
                  return
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={() => {
          setFilters({})
          if (searched && query.trim()) {
            // Re-search with cleared filters
            setTimeout(() => {
              handleSearch()
            }, 100)
          }
        }}
      />

      {/* Example Queries */}
      {!searched && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-100 dark:border-blue-800 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">Try searching for:</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Clinical research topics</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setQuery(example)
                  // Auto-search when clicking example
                  setTimeout(() => {
                    const form = document.querySelector('form')
                    if (form) {
                      form.requestSubmit()
                    }
                  }, 100)
                }}
                className="px-4 py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-all hover:shadow-md"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Searching medical literature...</h3>
          <p className="text-gray-600 dark:text-gray-300">Finding peer-reviewed papers from clinical research databases</p>
        </div>
      )}

      {/* No Results */}
      {!loading && searched && papers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No papers found</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-6">
            Try adjusting your search terms or use different clinical keywords to find relevant medical papers.
          </p>
          <button
            onClick={() => {
              setQuery('')
              setSearched(false)
              setPapers([])
            }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-lg"
          >
            New Search
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && papers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Found <span className="text-emerald-600 dark:text-emerald-400 text-lg">{papers.length}</span> paper{papers.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Sorted by clinical relevance
              </div>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium text-sm shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {papers.map((paper, index) => (
              <div
                key={paper.pmid}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 leading-snug text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {paper.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                          {paper.abstract}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{formatAuthors(paper.authors)}</span>
                          </span>
                          {paper.year && (
                            <span className="flex items-center space-x-1">
                              <span>•</span>
                              <span className="font-medium">{paper.year}</span>
                            </span>
                          )}
                          {paper.journal && (
                            <span className="flex items-center space-x-1">
                              <span>•</span>
                              <span className="italic">{paper.journal}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex-shrink-0 flex flex-col items-center space-y-2">
                    {isAuthenticated && (
                      <PaperActions paper={paper} />
                    )}
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-600 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all group-hover:shadow-lg transform group-hover:scale-110"
                      title="View on PubMed"
                    >
                      <ExternalLink className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
