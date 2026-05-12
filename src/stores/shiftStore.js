import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { shiftService } from '@/services/shiftService'

export const useShiftStore = defineStore('shifts', () => {
  // === State ===
  const shifts = ref([])
  const totalRecord = ref(0)
  const totalPage = ref(0)
  const loading = ref(false)
  const error = ref(null)
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const selectedIds = ref(new Set())
  const sortBy = ref('')
  const sortDirection = ref('ASC')
  const filters = ref([])

  let debounceTimer = null

  // === Getters ===
  const pageData = computed(() => shifts.value)
  const isFirstPage = computed(() => currentPage.value <= 1)
  const isLastPage = computed(() => currentPage.value >= totalPage.value)

  const pageInfo = computed(() => {
    const total = totalRecord.value
    const start = total === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1
    const end = Math.min(currentPage.value * pageSize.value, total)
    return { start, end, total }
  })

  const selectedCount = computed(() => selectedIds.value.size)
  const selectedIdList = computed(() => Array.from(selectedIds.value))

  // Kiểm tra trong các bản ghi đang chọn có bản ghi nào đang Sử dụng không
  const hasActiveInSelected = computed(() => {
    return shifts.value.some(
      (s) => selectedIds.value.has(s.productionShiftID) && s.shiftStatus === 1,
    )
  })

  // Kiểm tra trong các bản ghi đang chọn có bản ghi nào đang Ngừng sử dụng không
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
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      currentPage.value = 1
      fetchPage()
    }, 350)
  })

  // Khi đổi trang / pageSize → fetch lại
  watch([currentPage, pageSize], fetchPage)

  const init = () => fetchPage()

  // Phân trang
  const nextPage = () => { if (!isLastPage.value) currentPage.value++ }
  const prevPage = () => { if (!isFirstPage.value) currentPage.value-- }
  const resetPage = () => { currentPage.value = 1 }
  const setPageSize = (size) => {
    pageSize.value = size
    resetPage()
  }

  // CRUD
  async function addShift(data) {
    await shiftService.insert(data)
    resetPage()
    await fetchPage()
  }

  async function updateShift(data) {
    await shiftService.update(data)
    await fetchPage()
  }

  async function deleteByIds(ids) {
    await shiftService.deleteByIds(ids)
    ids.forEach((id) => selectedIds.value.delete(id))
    selectedIds.value = new Set(selectedIds.value)
    await fetchPage()
  }

  async function duplicateShift(id) {
    return await shiftService.duplicate(id)
  }

  async function toggleStatus(ids, status) {
    await shiftService.toggleStatus(ids, status)
    ids.forEach((id) => selectedIds.value.delete(id))
    selectedIds.value = new Set(selectedIds.value)
    await fetchPage()
  }

  // Lấy bản ghi theo ID
  const getById = (id) => shifts.value.find((s) => s.productionShiftID === id) ?? null

  // Selection
  const toggleSelect = (id) => {
    const s = new Set(selectedIds.value)
    s.has(id) ? s.delete(id) : s.add(id)
    selectedIds.value = s
  }

  const selectAll = (ids) => {
    const s = new Set(selectedIds.value)
    ids.forEach((id) => s.add(id))
    selectedIds.value = s
  }

  const unselectAll = () => { selectedIds.value = new Set() }
  const isSelected = (id) => selectedIds.value.has(id)

  return {
    // state
    shifts, totalRecord, totalPage, loading, error,
    searchKeyword, currentPage, pageSize, selectedIds,
    sortBy, sortDirection, filters,
    // getters
    pageData, isFirstPage, isLastPage, pageInfo,
    selectedCount, selectedIdList,
    hasActiveInSelected, hasInactiveInSelected,
    // actions
    init, fetchPage, nextPage, prevPage, resetPage, setPageSize,
    addShift, updateShift, deleteByIds, duplicateShift, toggleStatus,
    getById, toggleSelect, selectAll, unselectAll, isSelected,
  }
})
