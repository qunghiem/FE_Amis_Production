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
  // Khai báo các trạng thái dùng chung
  data() {
    return {
      // Cấu hình entity — PHẢI override ở component con
      /** Tên entity dùng cho i18n key, vd: 'shift' → $t('shift.toast.adding') */
      entityName: '',

      /** Trường làm row key trong grid, vd: 'productionShiftID' */
      rowKey: 'id',

      // Store state
      store: null,

      // ẩn/hiện cái Form nhập liệu
      formVisible: false,
      // Lưu thông tin của dòng dữ liệu đang được sửa
      editingItem: null,

      //More menu (dropdown 3 chấm)
      moreMenuId: null,
      // vị trí
      moreMenuPos: { top: 0, left: 0 },

      // Quản lý Popup xác nhận
      confirmState: {
        visible: false,
        title: '',
        message: '',
        onConfirm: null,
      },

      // Quản lý Popup cảnh báo lỗi
      warningState: {
        visible: false,
        message: '',
      },
    }
  },

  //  COMPUTED
  computed: {
    /**
     * Cấu hình columns cho MsGrid.
     * PHẢI override ở component con, trả về mảng [{ key, label, width, ... }]
     */
    columns() {
      return []
    },

    /** Lấy dữ liệu của dòng đang mở More Menu dựa trên moreMenuId */
    moreMenuRow() {
      if (this.moreMenuId === null || !this.store) return null
      return this.store.getById(this.moreMenuId)
    },
  },

  // METHODS
  methods: {
    // STORE — override ở component con
    /**
     * Trả về Pinia store instance.
     * PHẢI override ở component con.
     * Ép buộc component con phải khai báo Store muốn dùng
     * @returns {Object} Pinia store
     */
    getStore() {
      throw new Error('[baseList] getStore() chưa được override.')
    },

    /** Gán store vào biến data để dễ truy cập trong template */
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

    // SORT / FILTER / SEARCH

    /** Xử lý khi người dùng click vào header của Grid để sắp xếp */
    handleSortChange({ sortBy, sortDirection }) {
      // lấy cột cần sắp xếp
      this.store.sortBy = sortBy
      // tăng dần/ giảm dần
      this.store.sortDirection = sortDirection
      // về trang 1
      this.store.resetPage()
      // load lại data
      this.store.fetchPage()
    },

    /** Xử lý khi áp dụng một bộ lọc (Thêm mới hoặc cập nhật filter cũ)*/
    handleFilterApply(filter) {
      // kiểm tra đã có bộ lọc cho cột đó chưa, k có trả về -1
      const idx = this.store.filters.findIndex((f) => f.Property === filter.Property)
      // nếu có thì xóa giá trị cũ, và thêm lọc mới vào
      if (idx >= 0) this.store.filters.splice(idx, 1, filter)
      else this.store.filters.push(filter)
      this.store.resetPage()
      this.store.fetchPage()
    },

    /** Xóa bỏ 1 điều kiện lọc cụ thể */
    handleFilterClear(property) {
      const idx = this.store.filters.findIndex((f) => f.Property === property)
      if (idx >= 0) this.store.filters.splice(idx, 1)
      this.store.resetPage()
      this.store.fetchPage()
    },

    /** Xóa sạch tất cả các bộ lọc đang có */
    clearAllFilters() {
      this.store.filters.splice(0, this.store.filters.length)
      this.store.resetPage()
      this.store.fetchPage()
    },

    // MORE MENU
    /** Tính toán vị trí và hiển thị menu 3 chấm ngay tại dòng được click */
    toggleMoreMenu(id, event) {
      // kiểm tra xem menu đang mở có phải của dòng đó k
      if (this.moreMenuId === id) {
        // nếu phải thì đóng lại
        this.moreMenuId = null
        return
      }
      // nút more
      const btn = event.currentTarget
      // laays tọa độ nút more
      const rect = btn.getBoundingClientRect()
      // set tọa độ cho menu more
      this.moreMenuPos = {
        top: rect.bottom + 4,
        left: rect.right - 170,
      }
      this.moreMenuId = id
    },

    // đóng more menu đang mở
    closeMoreMenu() {
      this.moreMenuId = null
    },

    // FORM — Add / Edit / Close

    // mở form Thêm
    openAddModal() {
      // Xóa sạch dữ liệu cũ để đảm bảo form trống
      this.editingItem = null
      // hiện modal
      this.formVisible = true
    },

    // mở form Sửa
    openEditModal(id) {
      // lấy dữ liệu cái đang được sửa qua ID
      this.editingItem = this.store.getById(id)
      // hiện modal
      this.formVisible = true
    },

    // đóng Form
    closeModal() {
      // ẩn Modal
      this.formVisible = false
      // reset data trên form sửa
      this.editingItem = null
    },

    /**
     * Xử lý khi form emit 'saved'.
     * Override nếu entity có logic save khác (vd: field khác để check isEdit).
     *
     * @param {Object} data - Dữ liệu từ form, có _action = 'save' | 'save-and-add'
     */
    async handleSaved(data) {
      // gán để tránh mất ngữ cảnh this
      const me = this
      // khởi tạo toast
      const toast = useToast()
      // kiểm tra xem có id k, nếu có id thì là đang sửa
      const isEdit = !!data[me.rowKey]
      // kiểm tra xem click Lưu hay "Lưu và Thêm"
      const isSaveAndAdd = data._action === 'save-and-add'
      // tên định danh để i18n
      const entity = me.entityName

      // hiện loading
      const tid = toast.loading(
        isEdit
          ? me.$t(`${entity}.toast.updating`) //đang cập nhật
          : me.$t(`${entity}.toast.adding`), // đang thêm mới
      )

      try {
        // nếu là sửa
        if (isEdit) {
          await me.store.updateShift
            ? await me.store.updateShift(data) // nếu store có method riêng
            : await me.store.update(data)
        } else {
          await me.store.addShift
            ? await me.store.addShift(data)
            : await me.store.add(data)
        }

        // Đổi thông báo Loading thành thông báo Thành công
        toast.update(
          tid,
          isEdit
            ? me.$t(`${entity}.toast.updateSuccess`)
            : me.$t(`${entity}.toast.addSuccess`),
          'success',
        )

        if (isSaveAndAdd) {
          // Xóa sạch dữ liệu trên form để người dùng nhập ca mới
          me.getFormRef()?.resetForm()
        } else {
          me.closeModal()
        }
      } catch (err) {
        toast.remove(tid) // Xóa bỏ cái thông báo loading lúc nãy đi
        me.getFormRef()?.resetSaving() // Tắt trạng thái loading của cái nút Lưu để người dùng bấm lại được
        me.handleSaveError(err) // hiển thị chi tiết lỗi
      }
    },

    /**
     * lấy quyền truy cập vào DOM
     * Override ở component con: return this.$refs.shiftFormRef
     */
    getFormRef() {
      return this.$refs.formRef || null
    },

    /**
     * lấy quyền truy cập vào DOM
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
      // nếu là lỗi user nhập sai
      if (err.name === 'ApiError' && err.errors?.length > 0) {
        // hiện cảnh báo
        this.showWarning(err.errors.join('<br>'))
      } else {
        toast.error(err.message)
      }
    },

    // DUPLICATE
    /**
     * CLick Nhân bản bản ghi.
     * Override nếu entity có logic duplicate khác.
     */
    async handleDuplicate(id) {
      // gán để tránh mất ngữ cảnh this
      const me = this
      const toast = useToast()

      // đóng menu 3 chấm
      me.moreMenuId = null

      try {
        const duplicated = await me.store.duplicateShift
          ? await me.store.duplicateShift(id)
          : await me.store.duplicate(id)

        // Xoá ID để form hiểu là "thêm mới" (nhân bản)
        me.editingItem = { ...duplicated, [me.rowKey]: null }
        // mở form
        me.formVisible = true
      } catch (err) {
        toast.error(err.message)
      }
    },

    // TOGGLE STATUS
    // click chuyển trạng thái 1 row
    async handleToggleSingle(row) {
      // gán để tránh mất ngữ cảnh this
      const me = this
      const toast = useToast()

      // đóng menu 3 chấm
      me.moreMenuId = null

      // set trạng thái mới
      const newStatus = row.shiftStatus === 1 ? 0 : 1

      try {
        // truyền id, newStatus
        await me.store.toggleStatus([row[me.rowKey]], newStatus)

        // gọi tới DOM grid để xóa id đó khỏi tích chọn
        me.getGridRef()?.deselectIds([row[me.rowKey]])
      } catch (err) {
        toast.error(err.message)
      }
    },

    // click chuyển trạng thái hàng loạt
    async handleBatchToggle(selectedIds, status) {
      // gán để tránh mất ngữ cảnh this
      const me = this
      const toast = useToast()

      try {
        // truyền danh sách id, newStatus
        await me.store.toggleStatus(selectedIds, status)
        // gọi tới DOM grid để xóa id đó khỏi tích chọn
        me.getGridRef()?.deselectIds(selectedIds)
      } catch (err) {
        toast.error(err.message)
      }
    },

    // DELETE

    /**
     * Mở confirm xoá 1 bản ghi.
     * Override nếu entity cần message confirm khác.
     */
    openDeleteConfirm(id) {
      // gán để tránh mất ngữ cảnh this
      const me = this
      // đóng menu more
      me.moreMenuId = null
      // lấy entity để i18n
      const entity = me.entityName
      // Lấy ra dữ liệu của bản ghi từ Store bằng ID
      const item = me.store.getById(id)
      // lấy ra tên mã ca để gắn vào thông báo
      const codeField = me.getCodeField()

      me.confirmState = {
        visible: true,
        title: me.$t(`${entity}.confirm.deleteTitle`),
        message: me.$t(`${entity}.confirm.deleteSingle`, {
          code: item?.[codeField] || '',
        }),
        onConfirm: () => me.handleDelete([id]), // xóa
      }
    },

    // xóa hàng loạt bản ghi theo ID
    openBatchDeleteConfirm(ids) {
      // gán để tránh mất ngữ cảnh this
      const me = this
      // lấy entity để i18n
      const entity = me.entityName

      me.confirmState = {
        visible: true,
        title: me.$t(`${entity}.confirm.deleteTitle`),
        message: me.$t(`${entity}.confirm.deleteBatch`, { count: ids.length }),
        onConfirm: () => me.handleDelete([...ids]), // xóa
      }
    },

    // đóng Form Xác nhận
    closeConfirm() {
      // đóng modal
      this.confirmState.visible = false
      // xóa hành động gọi handleDelete cũ
      this.confirmState.onConfirm = null
    },

    // khi click Đồng ý ở form xác nhận
    async onConfirm() {
      // lấy hành động handleDelete
      const callback = this.confirmState.onConfirm
      // Đóng Pop-up xác nhận ngay lập tức
      this.closeConfirm()
      // thực thi hành động
      if (callback) await callback()
    },

    // xóa bản ghi theo ID
    async handleDelete(ids) {
      // gán để tránh mất ngữ cảnh this
      const me = this
      const toast = useToast()
      // lấy entity để i18n
      const entity = me.entityName
      const tid = toast.loading(me.$t(`${entity}.toast.deleting`))

      try {
        await me.store.deleteByIds(ids)
        toast.update(
          tid,
          me.$t(`${entity}.toast.deleteSuccess`, { count: ids.length }),
          'success',
        )
        // gọi DOM grid để xóa ID tích chọn
        me.getGridRef()?.deselectIds(ids)
      } catch (err) {
        toast.update(tid, err.message, 'error')
      }
    },

    // EXPORT EXCEL
    async handleExport() {
      // gán để tránh mất ngữ cảnh this
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

    // WARNING POPUP
    showWarning(message) {
      this.warningState.message = message
      this.warningState.visible = true
      // Đợi
      // render xong giao diện Pop-up thì tự động focus bàn phím vào nút/overlay
      // Giúp người dùng có thể nhấn Enter hoặc Space để đóng nhanh Pop-up bằng bàn phím
      this.$nextTick(() => this.$refs.warningOverlayRef?.focus())
    },

    // đóng modal cảnh báo
    closeWarning() {
      this.warningState.visible = false
      this.warningState.message = ''
    },

    /**
     * Trả về tên field code để hiển thị trong confirm delete.
     * Mặc định: `${entityName}Code` → 'productionShiftCode'
     * Override nếu entity có convention khác.
     */
    getCodeField() {
      return `${this.entityName}Code`
    },
  },

  // LIFECYCLE
  // chạy sau khi kế thừa data, method
  created() {
    // Gán store TRƯỚC khi template render
    this.initStore()
  },

  // chạy sau created()
  mounted() {
    // Fetch data + bindEvent SAU khi DOM sẵn sàng
    this.loadData()
    // add sự kiện click ra ngoài đóng menu more
    document.addEventListener('click', this.closeMoreMenu)
  },

  // chạy khi đóng trang
  unmounted() {
    // xóa sự kiện đã add khi mounted
    document.removeEventListener('click', this.closeMoreMenu)
  },
}
