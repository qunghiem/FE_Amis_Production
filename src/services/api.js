// axios instance

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5119/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.UserMsg ||
      err.response?.data?.DevMsg ||
      err.message ||
      'Lỗi kết nối máy chủ'
    console.error('[API Error]', msg, err.response?.data)
    return Promise.reject(new Error(msg))
  },
)

export default api
