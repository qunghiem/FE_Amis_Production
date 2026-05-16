// toast notification

import { ref } from 'vue'

// biến chứa danh sách thông báo đang hiển thị
const toasts = ref([])

// Biến đếm để tạo ID duy nhất cho mỗi thông báo, tránh trùng lặp khi xóa
let idCounter = 0

export function useToast() {
  /**
   *
   * @param {string} message - nội dung thông báo
   * @param {string} type - Loại thông báo (success, error, warning, loading)
   * @param {string} duration - Thời gian hiển thị (ms), nếu là 0 sẽ không tự ẩn
   * @returns
   */
  function show(message, type = 'success', duration = 3000) {
    const id = ++idCounter // tăng id lên 1 đơn vị
    toasts.value.push({ id, message, type }) // Thêm thông báo vào mảng để giao diện render
    // Nếu có đặt thời gian chờ, tự động xóa thông báo sau khi hết hạn
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id // Trả về ID để có thể dùng cho hàm update hoặc remove sau này
  }

  /**
   * Xóa thông báo khỏi danh sách dựa trên ID
   * @param {*} id
   */
  function remove(id) {
    // tìm index của phần tử cần xóa
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1) // Cắt bỏ 1 phần tử tại vị trí tìm thấy
  }

  // Các hàm tiện ích giúp gọi nhanh theo loại thông báo
  function success(msg) {
    return show(msg, 'success')
  }
  function error(msg) {
    return show(msg, 'error')
  }
  function loading(msg) {
    return show(msg, 'loading', 0)
  } // Thường dùng cho các tác vụ đang chạy, không tự đóng
  function warning(msg) {
    return show(msg, 'warning')
  }

  /**
   * Cập nhật nội dung cho một thông báo đang hiển thị
   * Thường dùng để chuyển trạng thái từ 'loading' sang 'success'
   */
  function update(id, msg, type, duration = 3000) {
    const t = toasts.value.find((t) => t.id === id)
    if (t) {
      t.message = msg
      t.type = type
    }
    // Sau khi cập nhật, nếu có duration thì bắt đầu đếm ngược để đóng
    if (duration > 0) setTimeout(() => remove(id), duration)
  }

  return { toasts, show, remove, success, error, loading, warning, update }
}
