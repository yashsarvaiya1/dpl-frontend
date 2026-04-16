// lib/axios.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ── Helpers ────────────────────────────────────────────────────────────────────
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

// ── Request — inject access token ─────────────────────────────────────────────
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

// ── Response — silent token refresh on 401 ────────────────────────────────────
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

    // Don't retry auth endpoints themselves
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
      // Use raw axios to avoid interceptor loop
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/auth/refresh/`,
        { refresh: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const { access, refresh } = res.data

      // Patch localStorage directly — Zustand store will pick it up on next read
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
