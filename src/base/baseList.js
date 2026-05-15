/**
 * baseList.js — Options API base cho các trang danh sách (List Page)
 *
 * ===== CÁCH DÙNG =====
 *
 * // ShiftPage.vue
 * import baseList from '@/mixins/baseList'
 * export default {
 *   extends: baseList,
 *   data() {
 *     return {
 *       // Override store, columns, entity config
 *       entityName: 'shift',
 *       rowKey: 'productionShiftID',
 *     }
 *   },
 *   computed: {
 *     columns() { return [ ... ] },
 *   },
 *   methods: {
 *     // Override nếu cần custom logic
 *     getStore() { return useShiftStore() },
 *   }
 * }
 *
 * ===== TÍNH NĂNG BASE =====
 * - Grid: columns, rows, pagination, sort, filter, search
 * - CRUD: add, edit, duplicate, delete (single + batch)
 * - Batch actions: toggle status, batch delete
 * - More menu (dropdown 3 chấm)
 * - Toast notifications
 * - Confirm modal
 * - Warning popup
 * - Export Excel
 * - Keyboard: document click → close more menu
 */

import { useToast } from '@/composables/useToast'

export default {
  // ─────────────────────────── DATA ───────────────────────────
  data() {
    return {
      // ══════ Cấu hình entity — PHẢI override ở component con ══════
      /** Tên entity dùng cho i18n key, vd: 'shift' → $t('shift.toast.adding') */
      entityName: '',

      /** Trường làm row key trong grid, vd: 'productionShiftID' */
      rowKey: 'id',

      // ══════ Store state (được sync từ getStore()) ══════
      store: null,

      // ══════ Form state ══════
      formVisible: false,
      editingItem: null,

      // ══════ More menu (dropdown 3 chấm) ══════
      moreMenuId: null,
      moreMenuPos: { top: 0, left: 0 },

      // ══════ Confirm modal ══════
      confirmState: {
        visible: false,
        title: '',
        message: '',
        onConfirm: null,
      },

      // ══════ Warning popup ══════
      warningState: {
        visible: false,
        message: '',
      },
    }
  },

  // ─────────────────────────── COMPUTED ───────────────────────────
  computed: {
    /**
     * Cấu hình columns cho MsGrid.
     * PHẢI override ở component con, trả về mảng [{ key, label, width, ... }]
     */
    columns() {
      return []
    },

    /** Row của more menu đang mở */
    moreMenuRow() {
      if (this.moreMenuId === null || !this.store) return null
      return this.store.getById(this.moreMenuId)
    },
  },

  // ─────────────────────────── METHODS ───────────────────────────
  methods: {
    // ══════════════════════════════════════════════════
    // STORE — override ở component con
    // ══════════════════════════════════════════════════

    /**
     * Trả về Pinia store instance.
     * PHẢI override ở component con.
     * @returns {Object} Pinia store
     */
    getStore() {
      throw new Error('[baseList] getStore() chưa được override.')
    },

    /**
     * Khởi tạo store (gán ref).
     * Được gọi trong created() để store có sẵn trước khi template render.
     */
    initStore() {
      this.store = this.getStore()
    },

    /**
     * Fetch dữ liệu lần đầu.
     * Được gọi trong mounted() sau khi DOM sẵn sàng.
     * Override nếu cần thêm logic init.
     */
    loadData() {
      this.store.init()
    },

    // ══════════════════════════════════════════════════
    // SORT / FILTER / SEARCH
    // ══════════════════════════════════════════════════

    handleSortChange({ sortBy, sortDirection }) {
      this.store.sortBy = sortBy
      this.store.sortDirection = sortDirection
      this.store.resetPage()
      this.store.fetchPage()
    },

    handleFilterApply(filter) {
      const idx = this.store.filters.findIndex((f) => f.Property === filter.Property)
      if (idx >= 0) this.store.filters.splice(idx, 1, filter)
      else this.store.filters.push(filter)
      this.store.resetPage()
      this.store.fetchPage()
    },

    handleFilterClear(property) {
      const idx = this.store.filters.findIndex((f) => f.Property === property)
      if (idx >= 0) this.store.filters.splice(idx, 1)
      this.store.resetPage()
      this.store.fetchPage()
    },

    clearAllFilters() {
      this.store.filters.splice(0, this.store.filters.length)
      this.store.resetPage()
      this.store.fetchPage()
    },

    // ══════════════════════════════════════════════════
    // MORE MENU (dropdown 3 chấm)
    // ══════════════════════════════════════════════════

    toggleMoreMenu(id, event) {
      if (this.moreMenuId === id) {
        this.moreMenuId = null
        return
      }
      const btn = event.currentTarget
      const rect = btn.getBoundingClientRect()
      this.moreMenuPos = {
        top: rect.bottom + 4,
        left: rect.right - 170,
      }
      this.moreMenuId = id
    },

    closeMoreMenu() {
      this.moreMenuId = null
    },

    // ══════════════════════════════════════════════════
    // FORM — Add / Edit / Close
    // ══════════════════════════════════════════════════

    openAddModal() {
      this.editingItem = null
      this.formVisible = true
    },

    openEditModal(id) {
      this.editingItem = this.store.getById(id)
      this.formVisible = true
    },

    closeModal() {
      this.formVisible = false
      this.editingItem = null
    },

    /**
     * Xử lý khi form emit 'saved'.
     * Override nếu entity có logic save khác (vd: field khác để check isEdit).
     *
     * @param {Object} data - Dữ liệu từ form, có _action = 'save' | 'save-and-add'
     */
    async handleSaved(data) {
      const me = this
      const toast = useToast()
      const isEdit = !!data[me.rowKey]
      const isSaveAndAdd = data._action === 'save-and-add'
      const entity = me.entityName

      const tid = toast.loading(
        isEdit
          ? me.$t(`${entity}.toast.updating`)
          : me.$t(`${entity}.toast.adding`),
      )

      try {
        if (isEdit) {
          await me.store.updateShift
            ? await me.store.updateShift(data) // nếu store có method riêng
            : await me.store.update(data)
        } else {
          await me.store.addShift
            ? await me.store.addShift(data)
            : await me.store.add(data)
        }

        toast.update(
          tid,
          isEdit
            ? me.$t(`${entity}.toast.updateSuccess`)
            : me.$t(`${entity}.toast.addSuccess`),
          'success',
        )

        if (isSaveAndAdd) {
          me.getFormRef()?.resetForm()
        } else {
          me.closeModal()
        }
      } catch (err) {
        toast.remove(tid)
        me.getFormRef()?.resetSaving()
        me.handleSaveError(err)
      }
    },

    /**
     * Trả về ref đến component Form (ShiftForm, ...).
     * Override ở component con: return this.$refs.shiftFormRef
     */
    getFormRef() {
      return this.$refs.formRef || null
    },

    /**
     * Trả về ref đến component Grid.
     * Override nếu ref name khác.
     */
    getGridRef() {
      return this.$refs.gridRef || null
    },

    /**
     * Xử lý lỗi khi save thất bại.
     * Mặc định: nếu có errors từ ApiError → show warning, ngược lại toast error.
     */
    handleSaveError(err) {
      const toast = useToast()
      if (err.name === 'ApiError' && err.errors?.length > 0) {
        this.showWarning(err.errors.join('<br>'))
      } else {
        toast.error(err.message)
      }
    },

    // ══════════════════════════════════════════════════
    // DUPLICATE
    // ══════════════════════════════════════════════════

    /**
     * Nhân bản bản ghi.
     * Override nếu entity có logic duplicate khác.
     */
    async handleDuplicate(id) {
      const me = this
      const toast = useToast()
      me.moreMenuId = null

      try {
        const duplicated = await me.store.duplicateShift
          ? await me.store.duplicateShift(id)
          : await me.store.duplicate(id)

        // Xoá ID để form hiểu là "thêm mới" (nhân bản)
        me.editingItem = { ...duplicated, [me.rowKey]: null }
        me.formVisible = true
      } catch (err) {
        toast.error(err.message)
      }
    },

    // ══════════════════════════════════════════════════
    // TOGGLE STATUS
    // ══════════════════════════════════════════════════

    async handleToggleSingle(row) {
      const me = this
      const toast = useToast()
      me.moreMenuId = null
      const newStatus = row.shiftStatus === 1 ? 0 : 1

      try {
        await me.store.toggleStatus([row[me.rowKey]], newStatus)
        me.getGridRef()?.deselectIds([row[me.rowKey]])
      } catch (err) {
        toast.error(err.message)
      }
    },

    async handleBatchToggle(selectedIds, status) {
      const me = this
      const toast = useToast()

      try {
        await me.store.toggleStatus(selectedIds, status)
        me.getGridRef()?.deselectIds(selectedIds)
      } catch (err) {
        toast.error(err.message)
      }
    },

    // ══════════════════════════════════════════════════
    // DELETE
    // ══════════════════════════════════════════════════

    /**
     * Mở confirm xoá 1 bản ghi.
     * Override nếu entity cần message confirm khác.
     */
    openDeleteConfirm(id) {
      const me = this
      me.moreMenuId = null
      const entity = me.entityName
      const item = me.store.getById(id)
      const codeField = me.getCodeField()

      me.confirmState = {
        visible: true,
        title: me.$t(`${entity}.confirm.deleteTitle`),
        message: me.$t(`${entity}.confirm.deleteSingle`, {
          code: item?.[codeField] || '',
        }),
        onConfirm: () => me.handleDelete([id]),
      }
    },

    openBatchDeleteConfirm(ids) {
      const me = this
      const entity = me.entityName

      me.confirmState = {
        visible: true,
        title: me.$t(`${entity}.confirm.deleteTitle`),
        message: me.$t(`${entity}.confirm.deleteBatch`, { count: ids.length }),
        onConfirm: () => me.handleDelete([...ids]),
      }
    },

    closeConfirm() {
      this.confirmState.visible = false
      this.confirmState.onConfirm = null
    },

    async onConfirm() {
      const callback = this.confirmState.onConfirm
      this.closeConfirm()
      if (callback) await callback()
    },

    async handleDelete(ids) {
      const me = this
      const toast = useToast()
      const entity = me.entityName
      const tid = toast.loading(me.$t(`${entity}.toast.deleting`))

      try {
        await me.store.deleteByIds(ids)
        toast.update(
          tid,
          me.$t(`${entity}.toast.deleteSuccess`, { count: ids.length }),
          'success',
        )
        me.getGridRef()?.deselectIds(ids)
      } catch (err) {
        toast.update(tid, err.message, 'error')
      }
    },

    // ══════════════════════════════════════════════════
    // EXPORT EXCEL
    // ══════════════════════════════════════════════════

    async handleExport() {
      const me = this
      const toast = useToast()
      const tid = toast.loading('Đang xuất Excel...')

      try {
        await me.store.exportExcel(
          me.store.searchKeyword,
          me.store.filters,
          me.store.sortBy,
          me.store.sortDirection,
        )
        toast.update(tid, 'Xuất Excel thành công!', 'success')
      } catch (err) {
        toast.update(tid, 'Xuất Excel thất bại', 'error')
      }
    },

    // ══════════════════════════════════════════════════
    // WARNING POPUP
    // ══════════════════════════════════════════════════

    showWarning(message) {
      this.warningState.message = message
      this.warningState.visible = true
      this.$nextTick(() => this.$refs.warningOverlayRef?.focus())
    },

    closeWarning() {
      this.warningState.visible = false
      this.warningState.message = ''
    },

    // ══════════════════════════════════════════════════
    // HELPER — có thể override
    // ══════════════════════════════════════════════════

    /**
     * Trả về tên field code để hiển thị trong confirm delete.
     * Mặc định: `${entityName}Code` → 'productionShiftCode'
     * Override nếu entity có convention khác.
     */
    getCodeField() {
      return `${this.entityName}Code`
    },
  },

  // ─────────────────────────── LIFECYCLE ───────────────────────────
  created() {
    // Gán store TRƯỚC khi template render → tránh lỗi "Cannot read properties of null"
    this.initStore()
  },

  mounted() {
    // Fetch data + bindEvent SAU khi DOM sẵn sàng
    this.loadData()
    document.addEventListener('click', this.closeMoreMenu)
  },

  unmounted() {
    document.removeEventListener('click', this.closeMoreMenu)
  },
}
