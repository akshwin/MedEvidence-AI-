'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Bookmark, BookOpen, FileText, Bell, History, Search, Plus, Trash2, Edit, X,
  Save, Star, List, Tag, TrendingUp, MessageSquare, BarChart3, Clock, ExternalLink, AlertCircle, User, Activity as ActivityIcon, LogOut, Layout, Folder, Highlighter
} from 'lucide-react'
import UsageAnalytics from '@/components/UsageAnalytics'
import ConfirmDialog from '@/components/ConfirmDialog'
import AppHeader from '@/components/AppHeader'
import { useAuth } from '@/lib/auth-context'
import { dashboardApi, type DashboardStats, type SavedQuery, type Bookmark as BookmarkType, type ReadingList, type PaperNote, type Alert, type Activity as ActivityType, type PaperAnnotation } from '@/lib/api'
import { useToast } from '@/lib/toast-context'

type TabType = 'overview' | 'queries' | 'bookmarks' | 'lists' | 'notes' | 'alerts' | 'activity' | 'analytics' | 'annotations'

export default function DashboardContent() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null)
  
  // Saved Queries
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [showSaveQueryModal, setShowSaveQueryModal] = useState(false)
  const [queryToSave, setQueryToSave] = useState('')
  
  // Bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  
  // Reading Lists
  const [readingLists, setReadingLists] = useState<ReadingList[]>([])
  const [showCreateListModal, setShowCreateListModal] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  
  // Notes
  const [notes, setNotes] = useState<PaperNote[]>([])
  
  // Annotations
  const [annotations, setAnnotations] = useState<PaperAnnotation[]>([])
  
  // Alerts
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false)
  const [newAlertName, setNewAlertName] = useState('')
  const [newAlertQuery, setNewAlertQuery] = useState('')
  const [newAlertFrequency, setNewAlertFrequency] = useState('daily')
  
  // Activity
  const [activities, setActivities] = useState<ActivityType[]>([])
  
  // Delete confirmation dialogs
  const [deleteQueryDialog, setDeleteQueryDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })
  const [deleteBookmarkDialog, setDeleteBookmarkDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })
  const [deleteListDialog, setDeleteListDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })
  const [deleteNoteDialog, setDeleteNoteDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })
  const [deleteAnnotationDialog, setDeleteAnnotationDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })
  const [deleteAlertDialog, setDeleteAlertDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }
    
    // Check for tab query parameter from URL
    const tabParam = searchParams.get('tab') as TabType | null
    if (tabParam && ['overview', 'queries', 'bookmarks', 'lists', 'notes', 'alerts', 'activity', 'analytics', 'annotations'].includes(tabParam)) {
      setActiveTab(tabParam)
    } else {
      setActiveTab('overview')
    }
  }, [authLoading, searchParams])
  
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'overview') {
        const statsData = await dashboardApi.getStats()
        setStats(statsData)
        const activityData = await dashboardApi.getActivity({ limit: 10 })
        setActivities(activityData)
      } else if (activeTab === 'queries') {
        const queriesData = await dashboardApi.listSavedQueries()
        setSavedQueries(queriesData)
      } else if (activeTab === 'bookmarks') {
        const bookmarksData = await dashboardApi.listBookmarks()
        setBookmarks(bookmarksData)
      } else if (activeTab === 'lists') {
        const listsData = await dashboardApi.listReadingLists()
        setReadingLists(listsData)
      } else if (activeTab === 'notes') {
        const notesData = await dashboardApi.listNotes()
        setNotes(notesData)
      } else if (activeTab === 'annotations') {
        const annotationsData = await dashboardApi.listAnnotations()
        setAnnotations(annotationsData)
      } else if (activeTab === 'alerts') {
        const alertsData = await dashboardApi.listAlerts()
        setAlerts(alertsData)
      } else if (activeTab === 'activity') {
        const activityData = await dashboardApi.getActivity({ limit: 50 })
        setActivities(activityData)
      } else if (activeTab === 'analytics') {
        // Analytics tab loads its own data
      }
    } catch (error: any) {
      console.error('Dashboard load error:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      })
      
      let errorMessage = 'Failed to load dashboard data'
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 401) {
          errorMessage = 'Please log in to access dashboard'
          router.push('/login')
        } else if (error.response.status === 404) {
          errorMessage = 'Dashboard endpoint not found. Please check if the backend is running.'
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please check if database tables are created.'
        } else {
          errorMessage = error.response.data?.detail || error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to backend server. Please ensure the backend is running.'
      } else {
        // Error setting up request
        errorMessage = error.message || 'An unexpected error occurred'
      }
      
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQuery = async () => {
    if (!queryToSave.trim()) {
      showToast('Please enter a query', 'error')
      return
    }
    try {
      await dashboardApi.saveQuery({
        query_text: queryToSave,
        query_type: 'search'
      })
      showToast('Query saved successfully', 'success')
      setQueryToSave('')
      setShowSaveQueryModal(false)
      loadDashboardData()
    } catch (error: any) {
      showToast('Failed to save query', 'error')
    }
  }

  const handleDeleteQueryClick = (id: string) => {
    setDeleteQueryDialog({ isOpen: true, id })
  }

  const handleDeleteQueryConfirm = async () => {
    if (!deleteQueryDialog.id) return
    try {
      await dashboardApi.deleteSavedQuery(deleteQueryDialog.id)
      showToast('Query deleted', 'success')
      setDeleteQueryDialog({ isOpen: false, id: null })
      loadDashboardData()
    } catch (error: any) {
      showToast('Failed to delete query', 'error')
      setDeleteQueryDialog({ isOpen: false, id: null })
    }
  }

  const handleDeleteQueryCancel = () => {
    setDeleteQueryDialog({ isOpen: false, id: null })
  }

  const handleDeleteBookmarkClick = (id: string) => {
    setDeleteBookmarkDialog({ isOpen: true, id })
  }

  const handleDeleteBookmarkConfirm = async () => {
    if (!deleteBookmarkDialog.id) return
    try {
      await dashboardApi.deleteBookmark(deleteBookmarkDialog.id)
      showToast('Bookmark removed', 'success')
      setDeleteBookmarkDialog({ isOpen: false, id: null })
      loadDashboardData()
    } catch (error: any) {
      showToast('Failed to remove bookmark', 'error')
      setDeleteBookmarkDialog({ isOpen: false, id: null })
    }
  }

  const handleDeleteBookmarkCancel = () => {
    setDeleteBookmarkDialog({ isOpen: false, id: null })
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      showToast('Please enter a list name', 'error')
      return
    }
    try {
      await dashboardApi.createReadingList({
        name: newListName,
        description: newListDescription || undefined
      })
      showToast('Reading list created', 'success')
      setNewListName('')
      setNewListDescription('')
      setShowCreateListModal(false)
      loadDashboardData()
    } catch (error: any) {
      showToast('Failed to create reading list', 'error')
    }
  }

  const handleDeleteListClick = (id: string) => {
    setDeleteListDialog({ isOpen: true, id })
  }

  const handleDeleteListConfirm = async () => {
    if (!deleteListDialog.id) return
    try {
      await dashboardApi.deleteReadingList(deleteListDialog.id)
      showToast('Reading list deleted', 'success')
      setDeleteListDialog({ isOpen: false, id: null })
      loadDashboardData()
    } catch (error: any) {
      showToast('Failed to delete reading list', 'error')
      setDeleteListDialog({ isOpen: false, id: null })
    }
  }

  const handleDeleteListCancel = () => {
    setDeleteListDialog({ isOpen: false, id: null })
  }

  const handleDeleteNoteClick = (id: string) => {
    setDeleteNoteDialog({ isOpen: true, id })
  }

  const handleDeleteNoteConfirm = async () => {
    if (!deleteNoteDialog.id) return
    try {
      await dashboardApi.deleteNote(deleteNoteDialog.id)
      showToast('Note deleted', 'success')
      setDeleteNoteDialog({ isOpen: false, id: null })
      loadDashboardData()
    } catch (error: any) {
      showToast('Failed to delete note', 'error')
      setDeleteNoteDialog({ isOpen: false, id: null })
    }
  }

  const handleDeleteNoteCancel = () => {
    setDeleteNoteDialog({ isOpen: false, id: null })
  }

  const handleDeleteAnnotationClick = (id: string) => {
    setDeleteAnnotationDialog({ isOpen: true, id })
  }

  const handleDeleteAnnotationConfirm = async () => {
    if (!deleteAnnotationDialog.id) return
    try {
      await dashboardApi.deleteAnnotation(deleteAnnotationDialog.id)
      showToast('Annotation deleted', 'success')
      setDeleteAnnotationDialog({ isOpen: false, id: null })
      loadDashboardData()
    } catch (error: any) {
      showToast('Failed to delete annotation', 'error')
      setDeleteAnnotationDialog({ isOpen: false, id: null })
    }
  }

  const handleDeleteAnnotationCancel = () => {
    setDeleteAnnotationDialog({ isOpen: false, id: null })
  }

  const handleCreateAlert = async () => {
    if (!newAlertName.trim() || !newAlertQuery.trim()) {
      showToast('Please enter alert name and query', 'error')
      return
    }
    try {
      await dashboardApi.createAlert({
        name: newAlertName,
        query: newAlertQuery,
        frequency: newAlertFrequency
      })
      showToast('Alert created', 'success')
      setNewAlertName('')
      setNewAlertQuery('')
      setNewAlertFrequency('daily')
      setShowCreateAlertModal(false)
      loadDashboardData()
    } catch (error: any) {
      showToast('Failed to create alert', 'error')
    }
  }

  const handleToggleAlert = async (id: string) => {
    try {
      await dashboardApi.toggleAlert(id)
      loadDashboardData()
    } catch (error: any) {
      showToast('Failed to toggle alert', 'error')
    }
  }

  const handleDeleteAlertClick = (id: string) => {
    setDeleteAlertDialog({ isOpen: true, id })
  }

  const handleDeleteAlertConfirm = async () => {
    if (!deleteAlertDialog.id) return
    try {
      await dashboardApi.deleteAlert(deleteAlertDialog.id)
      showToast('Alert deleted', 'success')
      setDeleteAlertDialog({ isOpen: false, id: null })
      loadDashboardData()
    } catch (error: any) {
      showToast('Failed to delete alert', 'error')
      setDeleteAlertDialog({ isOpen: false, id: null })
    }
  }

  const handleDeleteAlertCancel = () => {
    setDeleteAlertDialog({ isOpen: false, id: null })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'query': 
        return <MessageSquare className="w-4 h-4" />
      case 'search': 
        return <Search className="w-4 h-4" />
      case 'bookmark': 
        return <Bookmark className="w-4 h-4" />
      case 'note': 
        return <FileText className="w-4 h-4" />
      case 'saved_query': 
        return <Save className="w-4 h-4" />
      case 'reading_list': 
        return <List className="w-4 h-4" />
      default: 
        return <Clock className="w-4 h-4" />
    }
  }

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Redirect if not authenticated (handled by useEffect, but show loading here)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader active="dashboard" />

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Dashboard</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your research, collections, and analytics</p>
        </div>

        {/* Improved Navigation with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
              <nav className="space-y-1">
                {[
                  {
                    title: 'Overview',
                    icon: BarChart3,
                    id: 'overview' as TabType,
                    description: 'Quick stats'
                  },
                  {
                    title: 'Research',
                    icon: Search,
                    id: 'queries' as TabType,
                    description: 'Saved queries'
                  },
                  {
                    title: 'Collections',
                    icon: Folder,
                    id: 'bookmarks' as TabType,
                    description: 'Bookmarks & lists',
                    children: [
                      { id: 'bookmarks' as TabType, label: 'Bookmarks', icon: Bookmark },
                      { id: 'lists' as TabType, label: 'Reading Lists', icon: BookOpen },
                      { id: 'notes' as TabType, label: 'Notes', icon: FileText },
                      { id: 'annotations' as TabType, label: 'Annotations', icon: Highlighter },
                    ]
                  },
                  {
                    title: 'Monitoring',
                    icon: Bell,
                    id: 'alerts' as TabType,
                    description: 'Alerts & activity',
                    children: [
                      { id: 'alerts' as TabType, label: 'Alerts', icon: Bell },
                      { id: 'activity' as TabType, label: 'Activity', icon: History },
                    ]
                  },
                  {
                    title: 'Analytics',
                    icon: ActivityIcon,
                    id: 'analytics' as TabType,
                    description: 'Usage & performance'
                  },
                ].map((section: any) => {
                  const SectionIcon = section.icon
                  const isActive = activeTab === section.id || (section.children && section.children.some((child: any) => child.id === activeTab))
                  
                  return (
                    <div key={section.id}>
                      <button
                        onClick={() => {
                          setActiveTab(section.id)
                          const newUrl = section.id === 'overview' 
                            ? '/dashboard' 
                            : `/dashboard?tab=${section.id}`
                          router.push(newUrl, { scroll: false })
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          isActive && !section.children
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <SectionIcon className="w-5 h-5" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{section.title}</div>
                          {section.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{section.description}</div>
                          )}
                        </div>
                      </button>
                      
                      {section.children && isActive && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-emerald-200 dark:border-emerald-800 pl-4">
                          {section.children.map((child: any) => {
                            const ChildIcon = child.icon
                            return (
                              <button
                                key={child.id}
                                onClick={() => {
                                  setActiveTab(child.id)
                                  router.push(`/dashboard?tab=${child.id}`, { scroll: false })
                                }}
                                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                  activeTab === child.id
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                              >
                                <ChildIcon className="w-4 h-4" />
                                <span>{child.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">Error Loading Dashboard</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">{error}</p>
                    <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
                      <p><strong>Possible solutions:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Ensure the backend server is running</li>
                        <li>Check if database tables are initialized (run <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">python init_db.py</code> in backend folder)</li>
                        <li>Verify your authentication token is valid</li>
                        <li>Check browser console for detailed error messages</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => {
                        setError(null)
                        loadDashboardData()
                      }}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-gray-600 dark:text-gray-400">Please fix the error above and retry.</p>
              </div>
            ) : (
              <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/conversations" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <MessageSquare className="w-8 h-8 text-emerald-600" />
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total_conversations}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Conversations</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{stats.conversations_this_week} this week</p>
                  </Link>

                  <Link href="/dashboard?tab=bookmarks" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <Bookmark className="w-8 h-8 text-teal-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total_bookmarks}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bookmarks</p>
                  </Link>

                  <Link href="/dashboard?tab=lists" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen className="w-8 h-8 text-cyan-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total_reading_lists}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reading Lists</p>
                  </Link>

                  <Link href="/dashboard?tab=notes" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total_notes}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                  </Link>
                </div>

                {/* Recent Activity */}
                {activities.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                      {activities.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="mt-0.5 text-gray-500 dark:text-gray-400">
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {activity.activity_type === 'bookmark' && `Bookmarked: ${activity.activity_data?.paper_title || activity.activity_data?.paper_id}`}
                              {activity.activity_type === 'saved_query' && `Saved query: "${activity.activity_data?.query_text}"`}
                              {activity.activity_type === 'note' && `Created note on paper`}
                              {activity.activity_type === 'reading_list' && `${activity.activity_data?.action === 'created' ? 'Created' : 'Updated'} reading list: ${activity.activity_data?.list_name}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(activity.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Saved Queries Tab */}
            {activeTab === 'queries' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Queries</h2>
                  <button
                    onClick={() => setShowSaveQueryModal(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save Query</span>
                  </button>
                </div>
                {savedQueries.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No saved queries yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedQueries.map((query) => (
                      <div key={query.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between group hover:border-emerald-200 dark:hover:border-emerald-700 transition-all">
                        <div className="flex-1 cursor-pointer" onClick={() => {
                          if (query.query_type === 'search') {
                            router.push(`/research?tab=search&query=${encodeURIComponent(query.query_text)}`)
                          } else {
                            router.push(`/research?tab=chat&query=${encodeURIComponent(query.query_text)}`)
                          }
                        }}>
                          <p className="text-gray-900 dark:text-white font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{query.query_text}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium">{query.query_type}</span>
                            {query.results_count !== null && <span>{query.results_count} results</span>}
                            <span>{formatDate(query.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (query.query_type === 'search') {
                                router.push(`/research?tab=search&query=${encodeURIComponent(query.query_text)}`)
                              } else {
                                router.push(`/research?tab=chat&query=${encodeURIComponent(query.query_text)}`)
                              }
                            }}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title="Use this query"
                          >
                            <Search className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteQueryClick(query.id)
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete query"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bookmarked Papers</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Papers you've saved for quick access</p>
                </div>
                {bookmarks.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No bookmarks yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookmarks.map((bookmark) => (
                      <div key={bookmark.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{bookmark.paper_title || `Paper ${bookmark.paper_id}`}</h3>
                          <button
                            onClick={() => handleDeleteBookmarkClick(bookmark.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {bookmark.paper_authors && bookmark.paper_authors.length > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{bookmark.paper_authors.slice(0, 3).join(', ')}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {bookmark.paper_year && <span>{bookmark.paper_year}</span>}
                          {bookmark.paper_journal && <span>{bookmark.paper_journal}</span>}
                        </div>
                        {bookmark.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">{bookmark.notes}</p>
                        )}
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${bookmark.paper_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-sm mt-2 hover:underline"
                        >
                          <span>View on PubMed</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reading Lists Tab */}
            {activeTab === 'lists' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reading Lists</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Organize papers into custom reading lists</p>
                  </div>
                  <button
                    onClick={() => setShowCreateListModal(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create List</span>
                  </button>
                </div>
                {readingLists.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No reading lists yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {readingLists.map((list) => (
                      <div key={list.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{list.name}</h3>
                            {list.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{list.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteListClick(list.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{list.paper_count} papers</span>
                          <button
                            onClick={async () => {
                              try {
                                const listDetail = await dashboardApi.getReadingList(list.id)
                                // For now, just show an alert. In the future, you could navigate to a detail page
                                showToast(`Reading list "${list.name}" has ${listDetail.papers.length} papers`, 'info')
                              } catch (error) {
                                showToast('Failed to load reading list details', 'error')
                              }
                            }}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            View →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your personal notes on research papers</p>
                </div>
                {notes.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No notes yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            {note.title && (
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{note.title}</h3>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{note.paper_title || `Paper ${note.paper_id}`}</p>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {note.tags.map((tag, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteNoteClick(note.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatDate(note.updated_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Annotations Tab */}
            {activeTab === 'annotations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Annotations & Highlights</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your annotations and highlights on research papers</p>
                </div>
                {annotations.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Highlighter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No annotations yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Select text in papers to create highlights and annotations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {annotations.map((annotation) => {
                      const colorClass = annotation.color === 'yellow' ? 'bg-yellow-200 dark:bg-yellow-900/30' :
                        annotation.color === 'green' ? 'bg-green-200 dark:bg-green-900/30' :
                        annotation.color === 'blue' ? 'bg-blue-200 dark:bg-blue-900/30' :
                        annotation.color === 'pink' ? 'bg-pink-200 dark:bg-pink-900/30' :
                        annotation.color === 'orange' ? 'bg-orange-200 dark:bg-orange-900/30' :
                        'bg-yellow-200 dark:bg-yellow-900/30'
                      
                      return (
                        <div key={annotation.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{annotation.paper_title || 'Untitled Paper'}</h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">PMID: {annotation.paper_id}</span>
                              </div>
                              {annotation.selected_text && (
                                <div className={`p-3 rounded-lg mb-3 ${colorClass}`}>
                                  <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{annotation.selected_text}"</p>
                                </div>
                              )}
                              {annotation.content && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{annotation.content}</p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>{new Date(annotation.created_at).toLocaleDateString()}</span>
                                {annotation.annotation_type && (
                                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{annotation.annotation_type}</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteAnnotationClick(annotation.id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get notified about new papers matching your criteria</p>
                  </div>
                  <button
                    onClick={() => setShowCreateAlertModal(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Alert</span>
                  </button>
                </div>
                {alerts.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No alerts yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{alert.name}</h3>
                              <span className={`px-2 py-1 text-xs rounded ${alert.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                {alert.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Query: {alert.query}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                              <span>Frequency: {alert.frequency}</span>
                              {alert.last_checked && <span>Last checked: {formatDate(alert.last_checked)}</span>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleAlert(alert.id)}
                              className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title={alert.is_active ? 'Deactivate' : 'Activate'}
                            >
                              <Bell className={`w-4 h-4 ${alert.is_active ? 'text-emerald-600' : 'text-gray-400'}`} />
                            </button>
                            <button
                              onClick={() => handleDeleteAlertClick(alert.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <UsageAnalytics />
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your recent actions and interactions</p>
                </div>
                {activities.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No activity yet</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="mt-0.5 text-gray-500 dark:text-gray-400">
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {activity.activity_type === 'bookmark' && `Bookmarked: ${activity.activity_data?.paper_title || activity.activity_data?.paper_id}`}
                              {activity.activity_type === 'saved_query' && `Saved query: "${activity.activity_data?.query_text}"`}
                              {activity.activity_type === 'note' && `Created note on paper`}
                              {activity.activity_type === 'reading_list' && `${activity.activity_data?.action === 'created' ? 'Created' : 'Updated'} reading list: ${activity.activity_data?.list_name}`}
                              {activity.activity_type === 'query' && `Query: ${activity.activity_data?.query || 'N/A'}`}
                              {activity.activity_type === 'search' && `Search: ${activity.activity_data?.query || 'N/A'}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(activity.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Save Query Modal */}
      {showSaveQueryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Save Query</h3>
              <button
                onClick={() => setShowSaveQueryModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Query</label>
                <textarea
                  value={queryToSave}
                  onChange={(e) => setQueryToSave(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Enter your query..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveQuery}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSaveQueryModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Reading List</h3>
              <button
                onClick={() => setShowCreateListModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="My Reading List"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateList}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateListModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateAlertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Alert</h3>
              <button
                onClick={() => setShowCreateAlertModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alert Name *</label>
                <input
                  type="text"
                  value={newAlertName}
                  onChange={(e) => setNewAlertName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., New COVID-19 Research"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Query *</label>
                <textarea
                  value={newAlertQuery}
                  onChange={(e) => setNewAlertQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Enter search query..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                <select
                  value={newAlertFrequency}
                  onChange={(e) => setNewAlertFrequency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateAlert}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateAlertModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={deleteQueryDialog.isOpen}
        title="Delete Saved Query"
        message="Are you sure you want to delete this saved query? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteQueryConfirm}
        onCancel={handleDeleteQueryCancel}
        type="danger"
      />

      <ConfirmDialog
        isOpen={deleteBookmarkDialog.isOpen}
        title="Remove Bookmark"
        message="Are you sure you want to remove this bookmark? You can bookmark it again later."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleDeleteBookmarkConfirm}
        onCancel={handleDeleteBookmarkCancel}
        type="danger"
      />

      <ConfirmDialog
        isOpen={deleteListDialog.isOpen}
        title="Delete Reading List"
        message="Are you sure you want to delete this reading list? All papers in this list will be removed. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteListConfirm}
        onCancel={handleDeleteListCancel}
        type="danger"
      />

      <ConfirmDialog
        isOpen={deleteNoteDialog.isOpen}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteNoteConfirm}
        onCancel={handleDeleteNoteCancel}
        type="danger"
      />

      <ConfirmDialog
        isOpen={deleteAlertDialog.isOpen}
        title="Delete Alert"
        message="Are you sure you want to delete this alert? You will no longer receive notifications for this query."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteAlertConfirm}
        onCancel={handleDeleteAlertCancel}
        type="danger"
      />

      <ConfirmDialog
        isOpen={deleteAnnotationDialog.isOpen}
        title="Delete Annotation"
        message="Are you sure you want to delete this annotation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteAnnotationConfirm}
        onCancel={handleDeleteAnnotationCancel}
        type="danger"
      />
    </>
  )
}

