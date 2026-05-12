import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5119/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Custom error giữ nguyên response data từ backend
 */
class ApiError extends Error {
  constructor(message, statusCode, errors) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors // List<string> từ MoreInfo
  }
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data
    const statusCode = err.response?.status
    const msg = data?.UserMsg || data?.DevMsg || err.message || 'Lỗi kết nối máy chủ'

    // MoreInfo chứa List<string> lỗi chi tiết từ ValidateException
    const errors = Array.isArray(data?.MoreInfo) ? data.MoreInfo : []

    console.error('[API Error]', msg, data)
    return Promise.reject(new ApiError(msg, statusCode, errors))
  },
)

export default api
export { ApiError }
