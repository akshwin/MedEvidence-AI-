'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, TrendingUp, Clock, AlertCircle, Activity, Zap, 
  Search, MessageSquare, Calendar, Server, RefreshCw 
} from 'lucide-react'
import { dashboardApi, type UsageStats, type EndpointUsage, type UsageLog } from '@/lib/api'
import { useToast } from '@/lib/toast-context'

export default function UsageAnalytics() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [endpointUsage, setEndpointUsage] = useState<EndpointUsage[]>([])
  const [recentUsage, setRecentUsage] = useState<UsageLog[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('month')

  useEffect(() => {
    loadUsageData()
  }, [selectedPeriod])

  const loadUsageData = async () => {
    setLoading(true)
    try {
      const [statsData, endpointData, recentData] = await Promise.all([
        dashboardApi.getUsageStats(),
        dashboardApi.getEndpointUsage(selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 7 : 30),
        dashboardApi.getRecentUsage(20)
      ])
      setStats(statsData)
      setEndpointUsage(endpointData)
      setRecentUsage(recentData)
    } catch (error: any) {
      console.error('Error loading usage data:', error)
      showToast('Failed to load usage analytics', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatTime = (ms: number | null) => {
    if (ms === null || ms === undefined || isNaN(ms)) return 'N/A'
    // Round to 1 decimal place for milliseconds
    if (ms < 1000) {
      const rounded = Math.round(ms * 10) / 10
      // Remove trailing zeros for whole numbers
      return rounded % 1 === 0 ? `${Math.round(rounded)}ms` : `${rounded}ms`
    }
    // Round to 2 decimal places for seconds
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-emerald-600 dark:text-emerald-400'
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600 dark:text-blue-400'
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No usage data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6" />
            <span>Usage Analytics</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your API usage and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'today' | 'week' | 'month')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={loadUsageData}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 text-emerald-600" />
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {selectedPeriod === 'today' ? stats.queries_today : 
             selectedPeriod === 'week' ? stats.queries_this_week : 
             stats.queries_this_month}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Queries ({selectedPeriod})</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.total_queries} total
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Search className="w-8 h-8 text-teal-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {selectedPeriod === 'today' ? stats.searches_today : 
             selectedPeriod === 'week' ? stats.searches_this_week : 
             stats.searches_this_month}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Searches ({selectedPeriod})</p>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
            {stats.total_searches} total
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.average_response_time_ms !== null && stats.average_response_time_ms !== undefined
              ? formatTime(stats.average_response_time_ms)
              : 'N/A'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Last 30 days
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className={`w-8 h-8 ${stats.error_rate > 5 ? 'text-red-600' : stats.error_rate > 1 ? 'text-yellow-600' : 'text-emerald-600'}`} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.error_rate.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Last 30 days
          </p>
        </div>
      </div>

      {/* Usage Chart */}
      {stats.usage_by_day && stats.usage_by_day.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Usage Over Time</span>
          </h3>
          <div className="h-64 flex items-end space-x-1">
            {stats.usage_by_day.map((day, idx) => {
              const maxUsage = Math.max(...stats.usage_by_day.map(d => d.total))
              const height = maxUsage > 0 ? (day.total / maxUsage) * 100 : 0
              return (
                <div key={idx} className="flex-1 flex flex-col items-center space-y-1">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${height}%`, minHeight: day.total > 0 ? '4px' : '0' }}
                    title={`${formatDate(day.date)}: ${day.total} requests (${day.queries} queries, ${day.searches} searches)`}
                  />
                  {idx % Math.ceil(stats.usage_by_day.length / 7) === 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-45 origin-top-left whitespace-nowrap">
                      {formatDate(day.date)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-600 rounded"></div>
              <span>Queries</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-teal-500 rounded"></div>
              <span>Searches</span>
            </div>
          </div>
        </div>
      )}

      {/* Most Used Endpoints */}
      {endpointUsage.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>Endpoint Performance</span>
          </h3>
          <div className="space-y-3">
            {endpointUsage.map((endpoint) => (
              <div key={endpoint.endpoint} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{endpoint.endpoint}</p>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span>{endpoint.count} requests</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(endpoint.avg_response_time_ms)}</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${endpoint.error_count > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      <AlertCircle className="w-3 h-3" />
                      <span>{endpoint.error_count} errors</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {endpoint.success_count > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {((endpoint.success_count / endpoint.count) * 100).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">0%</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">success rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Usage Logs */}
      {recentUsage.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Recent API Calls</span>
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentUsage.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">{log.method}</span>
                    <span className="text-gray-600 dark:text-gray-400">{log.endpoint}</span>
                    <span className={`text-sm font-medium ${getStatusColor(log.status_code)}`}>
                      {log.status_code}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {log.response_time_ms && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(log.response_time_ms)}</span>
                      </span>
                    )}
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  {log.error_message && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{log.error_message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

