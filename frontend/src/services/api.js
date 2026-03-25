import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

api.interceptors.request.use(
  (config) => {
    // Sanitize any 24-char hex IDs that might have accidentally appended suffixes like :1
    if (config.url) {
      config.url = config.url.replace(/([a-f\d]{24}):\d+/g, '$1');
    }

    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    const res = response.data
    // If it's our new standardized format, extract data
    if (res && typeof res.success === 'boolean' && res.hasOwnProperty('data')) {
      return res.data
    }
    // Fallback for non-refactored endpoints
    return res
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = '/login'
      }
    }
    const message =
      err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Request failed'
    return Promise.reject(new Error(message))
  },
)

