import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { shiftService } from '@/services/shiftService'

export const useShiftStore = defineStore('shifts', () => {
  // === State ===
  const shifts = ref([]) // danh sách ca làm việc trên trang hiện tại
  const totalRecord = ref(0) // tổng số bản ghi (dùng để tính phân trang)
  const totalPage = ref(0) // tổng số trang (dựa trên totalRecord và pageSize)
  const loading = ref(false) // trạng thái đang tải dữ liệu
  const error = ref(null) // lỗi nếu có khi tải dữ liệu
  const searchKeyword = ref('') // từ khóa tìm kiếm (được debounce khi thay đổi)
  const currentPage = ref(1) // trang hiện tại (bắt đầu từ 1)
  const pageSize = ref(10) // số bản ghi trên mỗi trang
  const selectedIds = ref(new Set()) // tập hợp ID của các ca làm việc đang được chọn (dùng Set để dễ thêm/xóa)
  const sortBy = ref('') // trường để sắp xếp (ví dụ: 'productionShiftName')
  const sortDirection = ref('ASC') // hướng sắp xếp ('ASC' hoặc 'DESC')
  const filters = ref([]) // mảng các bộ lọc (ví dụ: [{ field: 'shiftStatus', operator: 'eq', value: 1 }])

  let debounceTimer = null // timer để debounce tìm kiếm

  // === Getters ===
  const pageData = computed(() => shifts.value) // dữ liệu ca làm việc trên trang hiện tại (đã được fetch từ API)
  const isFirstPage = computed(() => currentPage.value <= 1) // có phải đang ở trang đầu tiên không
  const isLastPage = computed(() => currentPage.value >= totalPage.value) // có phải đang ở trang cuối cùng không

  // Thông tin hiển thị về phân trang, ví dụ: "1-10 trên 100 bản ghi"
  const pageInfo = computed(() => {
    const total = totalRecord.value
    const start = total === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1
    const end = Math.min(currentPage.value * pageSize.value, total)
    return { start, end, total }
  })

  const selectedCount = computed(() => selectedIds.value.size) // số lượng ca làm việc đang được chọn
  const selectedIdList = computed(() => Array.from(selectedIds.value)) // danh sách ID của các ca làm việc đang được chọn (dùng để gửi API)

  // Kiểm tra trong các bản ghi đang chọn có bản ghi nào đang Sử dụng không
  const hasActiveInSelected = computed(() => {
    return shifts.value.some(
      (s) => selectedIds.value.has(s.productionShiftID) && s.shiftStatus === 1,
    )
  })

  // Kiểm tra trong các bản ghi đang chọn có bản ghi nào đang Ngừng sử dụng không
  // some: chỉ cần 1 là true
  const hasInactiveInSelected = computed(() => {
    return shifts.value.some(
      (s) => selectedIds.value.has(s.productionShiftID) && s.shiftStatus === 0,
    )
  })

  // === Actions ===

  /**
   * Fetch dữ liệu từ API
   */
  async function fetchPage() {
    loading.value = true
    error.value = null
    try {
      const res = await shiftService.search(
        searchKeyword.value,
        currentPage.value,
        pageSize.value,
        filters.value,
        sortBy.value,
        sortDirection.value,
      )

      shifts.value = res.data
      totalRecord.value = res.totalRecord
      totalPage.value = res.totalPage
    } catch (err) {
      error.value = err.message
      shifts.value = []
    } finally {
      loading.value = false
    }
  }

  // Debounce tìm kiếm
  watch(searchKeyword, () => {
    // xóa timeout cũ nếu có
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      currentPage.value = 1
      fetchPage()
    }, 350)
  })

  // Khi đổi trang / pageSize → fetch lại
  watch([currentPage, pageSize], fetchPage)

  const init = () => fetchPage() // Hàm khởi tạo, có thể gọi khi vào trang để load dữ liệu lần đầu

  // Phân trang
  const nextPage = () => {
    if (!isLastPage.value) currentPage.value++
  }

  // chuyển trang
  const prevPage = () => {
    if (!isFirstPage.value) currentPage.value--
  }

  // về trang đầu
  const goToFirstPage = () => {
    if (!isFirstPage.value) currentPage.value = 1
  }

  // về trang cuối
  const goToLastPage = () => {
    if (!isLastPage.value) currentPage.value = totalPage.value
  }

  // reset lại Page
  const resetPage = () => {
    currentPage.value = 1
  }

  // thay đổi page size
  const setPageSize = (size) => {
    pageSize.value = size
    resetPage()
  }

  // CRUD
  // Thêm ca làm việc mới
  async function addShift(data) {
    await shiftService.insert(data)
    resetPage()
    await fetchPage()
  }

  // Cập nhật ca làm việc
  async function updateShift(data) {
    await shiftService.update(data)
    await fetchPage()
  }

  // Xóa ca làm việc theo ID
  async function deleteByIds(ids) {
    // Gọi API xóa ca làm việc theo danh sách ID
    await shiftService.deleteByIds(ids)
    // Sau khi xóa thành công, bỏ chọn các ID đã xóa khỏi selectedIds
    ids.forEach((id) => selectedIds.value.delete(id))
    // Cập nhật lại selectedIds vì vue chỉ nhận ra thay đổi khi địa chỉ thay đổi, del là thay đổi bên trong vue k nhận ra
    selectedIds.value = new Set(selectedIds.value)
    await fetchPage()
  }

  // Nhân bản ca làm việc
  async function duplicateShift(id) {
    return await shiftService.duplicate(id)
  }

  // Chuyển trạng thái Sử dụng / Ngừng sử dụng
  async function toggleStatus(ids, status) {
    await shiftService.toggleStatus(ids, status)
    // Sau khi chuyển trạng thái thành công, bỏ chọn các ID đã thao tác khỏi selectedIds
    ids.forEach((id) => selectedIds.value.delete(id))
    // Cập nhật lại selectedIds
    selectedIds.value = new Set(selectedIds.value)
    await fetchPage()
  }

  // hàm Xuất Excel
  async function exportExcel() {
    await shiftService.exportExcel(
      searchKeyword.value,
      filters.value,
      sortBy.value,
      sortDirection.value,
    )
  }

  // Lấy bản ghi theo ID
  const getById = (id) => shifts.value.find((s) => s.productionShiftID === id) ?? null

  // Hàm toggle chọn 1 ca làm việc: nếu đã chọn thì bỏ chọn, nếu chưa chọn thì thêm vào selectedIds
  const toggleSelect = (id) => {
    // lấy ra 1 set mới từ selectedIds để thêm/xóa ID (vì selectedIds là Set nên việc thêm/xóa rất dễ dàng)
    const s = new Set(selectedIds.value)
    // nếu ID đã có trong set thì xóa nó đi (bỏ chọn), nếu chưa có thì thêm vào set (chọn)
    s.has(id) ? s.delete(id) : s.add(id)
    // cập nhật lại selectedIds với set initmới đã được thêm/xóa ID
    selectedIds.value = s
  }

  // Hàm chọn tất cả ca làm việc trên trang hiện tại
  const selectAll = (ids) => {
    // lấy ra 1 set mới từ selectedIds để thêm ID của tất cả ca làm việc trên trang hiện tại vào (vì selectedIds là Set nên việc thêm rất dễ dàng, đồng thời Set sẽ tự động loại bỏ ID trùng lặp nếu có)
    const s = new Set(selectedIds.value)
    //  thêm tất cả ID của ca làm việc trên trang hiện tại vào set
    ids.forEach((id) => s.add(id))
    // câp nhật lại selectedIds với set mới đã được thêm tất cả ID của ca làm việc trên trang hiện tại
    selectedIds.value = s
  }

  // Hàm bỏ chọn tất cả ca làm việc trên trang hiện tại
  const unselectAll = () => {
    selectedIds.value = new Set()
  }

  // Hàm kiểm tra xem 1 ca làm việc có đang được chọn hay không
  const isSelected = (id) => selectedIds.value.has(id)

  return {
    // state
    shifts,
    totalRecord,
    totalPage,
    loading,
    error,
    searchKeyword,
    currentPage,
    pageSize,
    selectedIds,
    sortBy,
    sortDirection,
    filters,
    // getters
    pageData,
    isFirstPage,
    isLastPage,
    pageInfo,
    selectedCount,
    selectedIdList,
    hasActiveInSelected,
    hasInactiveInSelected,
    // actions
    init,
    fetchPage,
    nextPage,
    prevPage,
    resetPage,
    setPageSize,
    goToFirstPage,
    goToLastPage,
    addShift,
    updateShift,
    deleteByIds,
    duplicateShift,
    toggleStatus,
    getById,
    exportExcel,
    toggleSelect,
    selectAll,
    unselectAll,
    isSelected,
  }
})
