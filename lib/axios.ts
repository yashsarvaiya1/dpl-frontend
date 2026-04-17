import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { env } from 'next-runtime-env'

// Fallback to localhost:8000 if the env var fails to load
const getBaseUrl = () => env('NEXT_PUBLIC_API_URL') || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

const getStoredAuth = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('dpl-auth')
    if (!raw) return null
    return JSON.parse(raw)?.state ?? null
  } catch {
    return null
  }
}

const clearAuthAndRedirect = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('dpl-auth')
  window.location.href = '/login'
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const auth = getStoredAuth()
    if (auth?.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue: {
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}[] = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }
    
    const url = originalRequest.url ?? ''
    if (url.includes('/auth/login') || url.includes('/auth/set-password') || url.includes('/auth/logout')) {
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      }).catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    const auth = getStoredAuth()
    const refreshToken = auth?.refreshToken

    if (!refreshToken) {
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    try {
      // Ensure we don't have double slashes if NEXT_PUBLIC_API_URL ends in /
      const baseUrl = getBaseUrl().replace(/\/$/, '');
      const res = await axios.post(
        `${baseUrl}/accounts/auth/refresh/`,
        { refresh: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const { access, refresh } = res.data

      const raw = localStorage.getItem('dpl-auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        parsed.state.accessToken = access
        if (refresh) parsed.state.refreshToken = refresh
        localStorage.setItem('dpl-auth', JSON.stringify(parsed))
      }

      processQueue(null, access)
      originalRequest.headers.Authorization = `Bearer ${access}`
      return apiClient(originalRequest)

    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null)
      clearAuthAndRedirect()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
