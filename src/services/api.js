import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5119/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Custom error giữ nguyên response data từ backend
 */
//
class ApiError extends Error {
  constructor(message, statusCode, errors) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors // List<string> từ moreInfo
  }
}

// xử lí lỗi response từ backend, trả về ApiError với message + statusCode + errors (nếu có) để component gọi API dễ dàng xử lí
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data // lấy dữ liệu lỗi từ response (nếu có)
    const statusCode = err.response?.status // lấy status code từ response (nếu có)

    // lấy message lỗi ưu tiên userMsg, nếu không có thì devMsg, nếu vẫn không có thì lấy message mặc định từ error (thường là lỗi kết nối)
    const msg = data?.userMsg || data?.devMsg || err.message || 'Lỗi kết nối máy chủ'

    // moreInfo chứa List<string> lỗi chi tiết từ ValidateException
    const errors = Array.isArray(data?.moreInfo) ? data.moreInfo : []

    console.error('[API Error]', msg, data)
    // trả về lỗi dưới dạng ApiError để component có thể dễ dàng xử lí (hiển thị message lỗi, hiển thị chi tiết lỗi nếu có, xử lí theo status code, v.v.)
    return Promise.reject(new ApiError(msg, statusCode, errors))
  },
)

export default api
export { ApiError }
