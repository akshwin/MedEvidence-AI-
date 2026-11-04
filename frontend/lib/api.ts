import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors (don't redirect on 401, let components handle it)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401 - let components handle authentication
    // They can check isAuthenticated and redirect if needed
    return Promise.reject(error)
  },
)

export interface QueryRequest {
  query: string
}

export interface Citation {
  pmid: string
  title: string
  authors: string[]
  year?: number
  journal?: string
  relevance_score?: number
}

export interface QueryResponse {
  answer: string
  citations: Citation[]
  metadata?: {
    papers_retrieved?: number
    query?: string
  }
}

export interface Paper {
  pmid: string
  title: string
  abstract: string
  authors: string[]
  year?: number
  journal?: string
}

export interface SearchRequest {
  query: string
  limit?: number
}

export interface SearchResponse {
  papers: Paper[]
  total: number
}

// Query endpoint - Main chat interface
export const queryResearch = async (query: string): Promise<QueryResponse> => {
  const response = await api.post<QueryResponse>('/api/query', {
    query,
    language: 'en',
    auto_detect_language: false,
  })
  return response.data
}

// Search endpoint - Find papers with advanced filters
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

export const searchPapers = async (
  query: string,
  limit: number = 10,
  filters?: SearchFilters,
): Promise<SearchResponse> => {
  const response = await api.post<SearchResponse>('/api/search', {
    query,
    limit,
    language: 'en',
    auto_detect_language: false,
    include_non_english: false,
    ...filters,
  })
  return response.data
}

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const response = await api.get<{ status: string }>('/health')
  return response.data
}

// Contact form
export interface ContactRequest {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactResponse {
  success: boolean
  message: string
}

export const sendContactEmail = async (data: ContactRequest): Promise<ContactResponse> => {
  const response = await api.post<ContactResponse>('/api/contact', data)
  return response.data
}

// Authentication API
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name?: string
}

export interface AuthUser {
  id: string
  email: string
  full_name: string | null
  is_verified: boolean
  is_active: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

export interface UserResponse {
  id: string
  email: string
  full_name: string | null
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    const response = await api.post<LoginResponse>('/api/auth/login', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  register: async (
    email: string,
    password: string,
    fullName?: string,
  ): Promise<{ message: string; user_id: string; verification_url?: string }> => {
    const response = await api.post<{
      message: string
      user_id: string
      verification_url?: string
    }>('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    })
    return response.data
  },

  getCurrentUser: async (token?: string): Promise<UserResponse> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await api.get<UserResponse>('/api/auth/me', { headers })
    return response.data
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/api/auth/verify-email', { token })
      return response.data
    } catch (error: any) {
      // Log the error for debugging
      console.error('Verify email API error:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  resendVerification: async (
    email: string,
  ): Promise<{ message: string; verification_url?: string }> => {
    const response = await api.post<{ message: string; verification_url?: string }>(
      '/api/auth/resend-verification',
      { email },
    )
    return response.data
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    })
    return response.data
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
    return response.data
  },
}

// Conversation API
export interface MessageData {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

export interface ConversationData {
  id: string
  title: string | null
  created_at: string
  updated_at: string
  message_count: number
  is_archived: boolean
  is_shared: boolean
  share_token: string | null
}

export interface ConversationDetail {
  id: string
  title: string | null
  created_at: string
  updated_at: string
  is_archived: boolean
  is_shared: boolean
  share_token: string | null
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    created_at: string
    citations?: Citation[]
  }>
}

export interface CreateConversationRequest {
  title?: string
  messages: MessageData[]
}

export const conversationsApi = {
  create: async (data: CreateConversationRequest): Promise<ConversationData> => {
    const response = await api.post<ConversationData>('/api/conversations/', data)
    return response.data
  },

  list: async (params?: {
    archived?: boolean
    search?: string
    limit?: number
    offset?: number
  }): Promise<ConversationData[]> => {
    const response = await api.get<ConversationData[]>('/api/conversations/', { params })
    return response.data
  },

  get: async (id: string): Promise<ConversationDetail> => {
    const response = await api.get<ConversationDetail>(`/api/conversations/${id}`)
    return response.data
  },

  update: async (
    id: string,
    data: { title?: string; is_archived?: boolean },
  ): Promise<ConversationData> => {
    const response = await api.put<ConversationData>(`/api/conversations/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/conversations/${id}`)
  },

  share: async (id: string): Promise<{ share_token: string; share_url: string }> => {
    const response = await api.post<{ share_token: string; share_url: string }>(
      `/api/conversations/${id}/share`,
    )
    return response.data
  },

  unshare: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/api/conversations/${id}/share`)
    return response.data
  },

  getShared: async (shareToken: string): Promise<ConversationDetail> => {
    const response = await api.get<ConversationDetail>(`/api/conversations/shared/${shareToken}`)
    return response.data
  },
}

// Dashboard API
export interface SavedQuery {
  id: string
  query_text: string
  query_type: string
  results_count: number | null
  created_at: string
  metadata?: any
}

export interface Bookmark {
  id: string
  paper_id: string
  paper_title: string | null
  paper_authors: string[] | null
  paper_year: number | null
  paper_journal: string | null
  notes: string | null
  created_at: string
}

export interface ReadingList {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  is_public: boolean
  paper_count: number
}

export interface ReadingListDetail extends ReadingList {
  papers: Array<{
    id: string
    paper_id: string
    paper_title: string | null
    paper_authors: string[] | null
    paper_year: number | null
    paper_journal: string | null
    notes: string | null
    added_at: string
  }>
}

export interface PaperNote {
  id: string
  paper_id: string
  paper_title: string | null
  title: string | null
  content: string
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  activity_type: string
  activity_data: any
  created_at: string
}

export interface DashboardStats {
  total_conversations: number
  total_messages: number
  total_bookmarks: number
  total_reading_lists: number
  total_notes: number
  total_saved_queries: number
  recent_activity_count: number
  conversations_this_week: number
  messages_this_week: number
}

export const dashboardApi = {
  // Statistics
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/api/dashboard/stats')
    return response.data
  },

  // Saved Queries
  saveQuery: async (data: {
    query_text: string
    query_type?: string
    results_count?: number
    metadata?: any
  }): Promise<SavedQuery> => {
    const response = await api.post<SavedQuery>('/api/dashboard/queries', data)
    return response.data
  },

  listSavedQueries: async (params?: {
    query_type?: string
    limit?: number
    offset?: number
  }): Promise<SavedQuery[]> => {
    const response = await api.get<SavedQuery[]>('/api/dashboard/queries', { params })
    return response.data
  },

  deleteSavedQuery: async (id: string): Promise<void> => {
    await api.delete(`/api/dashboard/queries/${id}`)
  },

  // Bookmarks
  createBookmark: async (data: {
    paper_id: string
    paper_title?: string
    paper_authors?: string[]
    paper_year?: number
    paper_journal?: string
    notes?: string
  }): Promise<Bookmark> => {
    const response = await api.post<Bookmark>('/api/dashboard/bookmarks', data)
    return response.data
  },

  listBookmarks: async (params?: { limit?: number; offset?: number }): Promise<Bookmark[]> => {
    const response = await api.get<Bookmark[]>('/api/dashboard/bookmarks', { params })
    return response.data
  },

  deleteBookmark: async (id: string): Promise<void> => {
    await api.delete(`/api/dashboard/bookmarks/${id}`)
  },

  checkBookmark: async (
    paperId: string,
  ): Promise<{ is_bookmarked: boolean; bookmark_id: string | null }> => {
    const response = await api.get<{ is_bookmarked: boolean; bookmark_id: string | null }>(
      `/api/dashboard/bookmarks/check/${paperId}`,
    )
    return response.data
  },

  // Reading Lists
  createReadingList: async (data: {
    name: string
    description?: string
    is_public?: boolean
  }): Promise<ReadingList> => {
    const response = await api.post<ReadingList>('/api/dashboard/reading-lists', data)
    return response.data
  },

  listReadingLists: async (): Promise<ReadingList[]> => {
    const response = await api.get<ReadingList[]>('/api/dashboard/reading-lists')
    return response.data
  },

  getReadingList: async (id: string): Promise<ReadingListDetail> => {
    const response = await api.get<ReadingListDetail>(`/api/dashboard/reading-lists/${id}`)
    return response.data
  },

  addPaperToReadingList: async (
    listId: string,
    data: {
      paper_id: string
      paper_title?: string
      paper_authors?: string[]
      paper_year?: number
      paper_journal?: string
      notes?: string
    },
  ): Promise<{ id: string; message: string }> => {
    const response = await api.post<{ id: string; message: string }>(
      `/api/dashboard/reading-lists/${listId}/papers`,
      data,
    )
    return response.data
  },

  removePaperFromReadingList: async (listId: string, paperId: string): Promise<void> => {
    await api.delete(`/api/dashboard/reading-lists/${listId}/papers/${paperId}`)
  },

  deleteReadingList: async (id: string): Promise<void> => {
    await api.delete(`/api/dashboard/reading-lists/${id}`)
  },

  // Notes
  createNote: async (data: {
    paper_id: string
    paper_title?: string
    title?: string
    content: string
    tags?: string[]
  }): Promise<PaperNote> => {
    const response = await api.post<PaperNote>('/api/dashboard/notes', data)
    return response.data
  },

  listNotes: async (params?: {
    paper_id?: string
    limit?: number
    offset?: number
  }): Promise<PaperNote[]> => {
    const response = await api.get<PaperNote[]>('/api/dashboard/notes', { params })
    return response.data
  },

  updateNote: async (
    id: string,
    data: {
      paper_id: string
      paper_title?: string
      title?: string
      content: string
      tags?: string[]
    },
  ): Promise<PaperNote> => {
    const response = await api.put<PaperNote>(`/api/dashboard/notes/${id}`, data)
    return response.data
  },

  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/api/dashboard/notes/${id}`)
  },

  // Activity
  getActivity: async (params?: { limit?: number }): Promise<Activity[]> => {
    const response = await api.get<Activity[]>('/api/dashboard/activity', { params })
    return response.data
  },

  // Usage Analytics
  getUsageStats: async (): Promise<UsageStats> => {
    const response = await api.get<UsageStats>('/api/dashboard/usage/stats')
    return response.data
  },

  getEndpointUsage: async (days: number = 30): Promise<EndpointUsage[]> => {
    const response = await api.get<EndpointUsage[]>('/api/dashboard/usage/endpoints', {
      params: { days },
    })
    return response.data
  },

  getRecentUsage: async (limit: number = 50): Promise<UsageLog[]> => {
    const response = await api.get<UsageLog[]>('/api/dashboard/usage/recent', { params: { limit } })
    return response.data
  },

  // Annotations
  createAnnotation: async (data: {
    paper_id: string
    paper_title?: string
    annotation_type?: string
    selected_text?: string
    start_offset?: number
    end_offset?: number
    content?: string
    color?: string
    tags?: string[]
  }): Promise<PaperAnnotation> => {
    const response = await api.post<PaperAnnotation>('/api/dashboard/annotations', data)
    return response.data
  },

  listAnnotations: async (params?: {
    paper_id?: string
    limit?: number
    offset?: number
  }): Promise<PaperAnnotation[]> => {
    const response = await api.get<PaperAnnotation[]>('/api/dashboard/annotations', { params })
    return response.data
  },

  updateAnnotation: async (
    id: string,
    data: {
      paper_id: string
      paper_title?: string
      annotation_type?: string
      selected_text?: string
      start_offset?: number
      end_offset?: number
      content?: string
      color?: string
      tags?: string[]
    },
  ): Promise<PaperAnnotation> => {
    const response = await api.put<PaperAnnotation>(`/api/dashboard/annotations/${id}`, data)
    return response.data
  },

  deleteAnnotation: async (id: string): Promise<void> => {
    await api.delete(`/api/dashboard/annotations/${id}`)
  },

  // Comparisons
  createComparison: async (data: {
    name?: string
    paper_ids: string[]
  }): Promise<PaperComparison> => {
    const response = await api.post<PaperComparison>('/api/dashboard/comparisons', data)
    return response.data
  },

  listComparisons: async (params?: {
    limit?: number
    offset?: number
  }): Promise<PaperComparison[]> => {
    const response = await api.get<PaperComparison[]>('/api/dashboard/comparisons', { params })
    return response.data
  },

  deleteComparison: async (id: string): Promise<void> => {
    await api.delete(`/api/dashboard/comparisons/${id}`)
  },
}

// Paper Analysis Types
export interface PaperAnnotation {
  id: string
  paper_id: string
  paper_title: string | null
  annotation_type: string
  selected_text: string | null
  start_offset: number | null
  end_offset: number | null
  content: string | null
  color: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface PaperComparison {
  id: string
  name: string | null
  paper_ids: string[]
  comparison_data: any | null
  created_at: string
  updated_at: string
}

// Search API extensions
export const searchApi = {
  getPaperById: async (paperId: string): Promise<Paper> => {
    const response = await api.get<Paper>(`/api/search/papers/${paperId}`)
    return response.data
  },

  getRelatedPapers: async (paperId: string, limit: number = 10): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>(`/api/search/papers/${paperId}/related`, {
      params: { limit },
    })
    return response.data
  },

  getCitedBy: async (paperId: string, limit: number = 10): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>(`/api/search/papers/${paperId}/cited-by`, {
      params: { limit },
    })
    return response.data
  },

  getRecommendations: async (paperId: string, limit: number = 10): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>(
      `/api/search/papers/${paperId}/recommendations`,
      { params: { limit } },
    )
    return response.data
  },
}

// Usage Analytics Types
export interface UsageStats {
  total_queries: number
  total_searches: number
  queries_today: number
  searches_today: number
  queries_this_week: number
  searches_this_week: number
  queries_this_month: number
  searches_this_month: number
  average_response_time_ms: number
  error_rate: number
  most_used_endpoints: Array<{
    endpoint: string
    count: number
    avg_response_time_ms: number
  }>
  usage_by_day: Array<{
    date: string
    queries: number
    searches: number
    total: number
  }>
}

export interface EndpointUsage {
  endpoint: string
  count: number
  avg_response_time_ms: number
  error_count: number
  success_count: number
}

export interface UsageLog {
  id: string
  endpoint: string
  method: string
  status_code: number
  response_time_ms: number | null
  error_message: string | null
  created_at: string
  metadata?: any
}
