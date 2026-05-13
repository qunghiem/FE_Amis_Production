import api from './api'

/**
 * Format TimeSpan "01:00:00" → "01:00"
 */
const formatTime = (ts) => {
  if (!ts) return '-'
  const parts = ts.split(':')
  return `${parts[0]}:${parts[1]}`
}

/**
 * Format DateTime "2025-01-15T10:30:00" → "15/01/2025"
 */
const formatDate = (dt) => {
  if (!dt) return '-'
  try {
    const d = new Date(dt)
    if (isNaN(d.getTime())) return '-'
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  } catch {
    return '-'
  }
}

/**
 * Parse "HH:mm" → "HH:mm:ss" để gửi backend
 */
const toTimeSpan = (val) => {
  if (!val) return null
  if (val.split(':').length === 2) return val + ':00'
  return val
}

/**
 * Convert dữ liệu từ backend → frontend
 */
const toFrontend = (e) => ({
  ...e,
  startTimeDisplay: formatTime(e.startTime),
  endTimeDisplay: formatTime(e.endTime),
  breakStartTimeDisplay: formatTime(e.breakStartTime),
  breakEndTimeDisplay: formatTime(e.breakEndTime),
  createdDateDisplay: formatDate(e.createdDate),
  modifiedDateDisplay: formatDate(e.modifiedDate),
})

/**
 * Convert dữ liệu từ frontend → backend
 */
const toBackend = (c) => ({
  productionShiftID: c.productionShiftID || '00000000-0000-0000-0000-000000000000',
  productionShiftCode: c.productionShiftCode || '',
  productionShiftName: c.productionShiftName || '',
  startTime: toTimeSpan(c.startTime),
  endTime: toTimeSpan(c.endTime),
  breakStartTime: toTimeSpan(c.breakStartTime) || null,
  breakEndTime: toTimeSpan(c.breakEndTime) || null,
  workHour: c.workHour || 0,
  breakHour: c.breakHour || 0,
  description: c.description || null,
  shiftStatus: c.shiftStatus ?? 1,
  createdBy: c.createdBy || null,
  createdDate: c.createdDate || new Date().toISOString(),
  modifiedBy: c.modifiedBy || null,
  modifiedDate: new Date().toISOString(),
})

// API Service
export const shiftService = {
  // tìm kiếm với phân trang, filter, sort
  async search(keyword = '', pageNumber = 1, pageSize = 10, filters = [], sortBy = '', sortDirection = 'ASC') {
    const { data } = await api.post('/Shift/filter-paging', {
      keyword,
      pageNumber,
      pageSize,
      filters,
      sortBy,
      sortDirection,
    })
    return {
      ...data,
      data: data.data.map(toFrontend), // map từng phần tử trong data sang toFrontend
    }
  },

  // Lấy chi tiết ca làm việc theo ID
  async getById(id) {
    const { data } = await api.get(`/Shift/${id}`)
    return toFrontend(data)
  },

  // Thêm mới ca làm việc
  async insert(shift) {
    const { data } = await api.post('/Shift', toBackend(shift))
    return data
  },

  // Cập nhật ca làm việc
  async update(shift) {
    const { data } = await api.put(`/Shift/${shift.productionShiftID}`, toBackend(shift))
    return data
  },

  // Xóa ca làm việc theo ID (có thể xóa nhiều ID cùng lúc)
  async deleteByIds(ids) {
    const { data } = await api.delete('/Shift', { data: ids })
    return data
  },

  // Nhân bản ca làm việc
  async duplicate(id) {
    const { data } = await api.get(`/Shift/duplicate/${id}`)
    return toFrontend(data)
  },

  // Chuyển trạng thái Sử dụng / Ngừng sử dụng hàng loạt
  async toggleStatus(ids, status) {
    const { data } = await api.put('/Shift/toggle-status', { ids, status })
    return data
  },
}
