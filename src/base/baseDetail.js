/**
 * baseDetail.js — Options API base cho các form chi tiết (Add / Edit / Duplicate)
 *
 * ===== CÁCH DÙNG =====
 *
 * // ShiftForm.vue
 * import baseDetail from '@/mixins/baseDetail'
 * export default {
 *   extends: baseDetail,
 *   data() {
 *     return {
 *       entityName: 'shift',
 *       // Khai báo cấu hình fields
 *       fieldConfig: {
 *         productionShiftCode: { required: true, maxLength: 20 },
 *         productionShiftName: { required: true, maxLength: 50 },
 *         startTime:           { required: true },
 *         endTime:             { required: true },
 *         breakStartTime:      {},
 *         breakEndTime:        {},
 *         description:         {},
 *         shiftStatus:         { default: 1 },
 *       },
 *       // Map từ keyword lỗi server → field name
 *       errorFieldMap: [
 *         { keywords: ['Mã ca'], field: 'productionShiftCode' },
 *         { keywords: ['Tên ca'], field: 'productionShiftName' },
 *       ],
 *     }
 *   },
 *   computed: {
 *     // Custom computed nếu cần
 *     computedWorkHour() { ... },
 *   },
 * }
 *
 * ===== TÍNH NĂNG BASE =====
 * - Form data management (auto generate EMPTY_FORM từ fieldConfig)
 * - Validation (required, maxLength — tự động từ fieldConfig)
 * - isDirty check → confirm thoát khi có thay đổi
 * - Save / Save and Add
 * - Server error mapping (errorFieldMap)
 * - Keyboard shortcuts: Esc, Ctrl+S, Ctrl+Shift+S
 * - Warning validate popup
 * - Confirm exit popup
 * - Focus first error field
 */

export default {
  // ─────────────────── PROPS ───────────────────
  props: {
    /** Hiển thị form hay không */
    visible: { type: Boolean, default: false },
    /** Dữ liệu bản ghi đang sửa / nhân bản. null = thêm mới */
    editingItem: { type: Object, default: null },
  },

  emits: ['close', 'saved'],

  // ─────────────────── DATA ───────────────────
  data() {
    return {
      // ══════ Cấu hình — PHẢI override ở component con ══════

      /** Tên entity dùng cho i18n, vd: 'shift' */
      entityName: '',

      /** Tên field ID, vd: 'productionShiftID' */
      idField: 'id',

      /**
       * Cấu hình các field trong form.
       * Key = field name, value = { required, maxLength, default }
       *
       * Ví dụ:
       * {
       *   productionShiftCode: { required: true, maxLength: 20 },
       *   productionShiftName: { required: true, maxLength: 50 },
       *   startTime: { required: true },
       *   description: {},
       *   shiftStatus: { default: 1 },
       * }
       */
      fieldConfig: {},

      /**
       * Map từ keyword trong lỗi server → field name.
       * Dùng để auto highlight field bị lỗi khi server trả validate error.
       *
       * Ví dụ:
       * [
       *   { keywords: ['Mã ca'], field: 'productionShiftCode' },
       *   { keywords: ['Tên ca'], field: 'productionShiftName' },
       * ]
       */
      errorFieldMap: [],

      /**
       * Map field name → ref name dùng để focus.
       * Mặc định sẽ tự generate từ fieldConfig (field → field + 'Ref').
       * Override nếu cần custom.
       *
       * Ví dụ: { productionShiftCode: 'codeRef', startTime: 'startRef' }
       */
      fieldRefMap: {},

      // ══════ Internal state ══════
      form: {},
      errors: {},
      saving: false,
      initialForm: null,

      // ══════ Warning validate popup ══════
      warnValidate: { visible: false, message: '' },

      // ══════ Confirm exit popup ══════
      confirmExit: { visible: false },
    }
  },

  // ─────────────────── COMPUTED ───────────────────
  computed: {
    /** Form đang hiện hay không (proxy cho prop visible) */
    localVisible() {
      return this.visible
    },

    /** Đang ở chế độ Edit (có ID) hay Add/Duplicate */
    isEditing() {
      return !!this.editingItem?.[this.idField]
    },

    /** Tiêu đề form: Thêm / Sửa / Nhân bản */
    formTitle() {
      const entity = this.entityName
      if (!this.editingItem) return this.$t(`${entity}.addTitle`)
      if (!this.editingItem[this.idField]) return this.$t(`${entity}.duplicateTitle`)
      return this.$t(`${entity}.editTitle`)
    },

    /** Kiểm tra form có thay đổi so với ban đầu không */
    isDirty() {
      if (!this.initialForm) return false
      const trackFields = Object.keys(this.fieldConfig)
      return trackFields.some((key) => this.form[key] !== this.initialForm[key])
    },

    /**
     * Danh sách field bắt buộc (lấy từ fieldConfig).
     * Dùng internal, ít khi cần override.
     */
    requiredFields() {
      return Object.entries(this.fieldConfig)
        .filter(([, cfg]) => cfg.required)
        .map(([key]) => key)
    },
  },

  // ─────────────────── WATCH ───────────────────
  watch: {
    visible(v) {
      if (!v) return
      this.errors = {}
      this.saving = false
      this.populateForm()
      this.$nextTick(() => {
        this.initialForm = { ...this.form }
        this.focusFirstField()
      })
    },

    // Auto clear error khi user nhập lại — dùng deep watch trên form
    form: {
      deep: true,
      handler(newForm) {
        for (const key of Object.keys(newForm)) {
          const val = newForm[key]
          if (val !== undefined && val !== null && val !== '' && this.errors[key]) {
            this.errors[key] = ''
          }
        }
      },
    },
  },

  // ─────────────────── METHODS ───────────────────
  methods: {
    // ══════════════════════════════════════════════════
    // FORM DATA
    // ══════════════════════════════════════════════════

    /**
     * Tạo object form rỗng từ fieldConfig.
     * Override nếu entity có default phức tạp hơn.
     */
    createEmptyForm() {
      const empty = {}
      for (const [key, cfg] of Object.entries(this.fieldConfig)) {
        if (cfg.default !== undefined) {
          empty[key] = cfg.default
        } else {
          empty[key] = ''
        }
      }
      // Luôn có ID field
      empty[this.idField] = null
      return empty
    },

    /**
     * Populate form từ editingItem hoặc tạo form rỗng.
     * Override nếu cần transform data trước khi đổ vào form
     * (vd: formatTimeForInput).
     */
    populateForm() {
      if (this.editingItem) {
        const f = this.createEmptyForm()
        // Copy dữ liệu từ editingItem vào form
        for (const key of Object.keys(f)) {
          if (this.editingItem[key] !== undefined) {
            f[key] = this.editingItem[key]
          }
        }
        this.form = f
      } else {
        this.form = this.createEmptyForm()
      }
    },

    /**
     * Reset form về trạng thái rỗng (dùng cho Save and Add).
     */
    resetForm() {
      this.form = this.createEmptyForm()
      this.errors = {}
      this.saving = false
      this.$nextTick(() => {
        this.initialForm = { ...this.form }
        this.focusFirstField()
      })
    },

    // ══════════════════════════════════════════════════
    // VALIDATION
    // ══════════════════════════════════════════════════

    /**
     * Validate 1 field cụ thể.
     * Tự động check required + maxLength từ fieldConfig.
     * Override để thêm logic validate custom (vd: so sánh thời gian).
     */
    validateField(field) {
      const cfg = this.fieldConfig[field]
      if (!cfg) return

      const val = this.form[field]
      const entity = this.entityName
      // Dùng i18nKey nếu có, không thì dùng tên field
      const key = cfg.i18nKey || field

      // Required check
      if (cfg.required) {
        const isEmpty = val === undefined || val === null || String(val).trim() === ''
        if (isEmpty) {
          this.errors[field] = this.$t(`${entity}.validation.${key}Required`)
          return
        }
      }

      // Max length check
      if (cfg.maxLength && typeof val === 'string' && val.length > cfg.maxLength) {
        this.errors[field] = this.$t(`${entity}.validation.${key}MaxLength`)
        return
      }

      // Clear error
      this.errors[field] = ''
    },

    /**
     * Validate tất cả required fields.
     * @returns {boolean} true nếu hợp lệ
     */
    validate() {
      this.requiredFields.forEach((field) => this.validateField(field))
      return Object.values(this.errors).every((e) => !e)
    },

    /**
     * Focus vào field lỗi đầu tiên.
     */
    focusFirstError() {
      const firstKey = this.requiredFields.find((k) => this.errors[k])
      if (!firstKey) return

      this.$nextTick(() => {
        const refName = this.fieldRefMap[firstKey] || (firstKey + 'Ref')
        const refEl = this.$refs[refName]
        if (refEl?.focus) refEl.focus()
      })
    },

    /**
     * Focus vào field đầu tiên khi mở form.
     * Override nếu field đầu tiên không phải required field đầu.
     */
    focusFirstField() {
      const firstField = Object.keys(this.fieldConfig)[0]
      if (!firstField) return
      const refName = this.fieldRefMap[firstField] || (firstField + 'Ref')
      this.$refs[refName]?.focus()
    },

    // ══════════════════════════════════════════════════
    // SAVE
    // ══════════════════════════════════════════════════

    /**
     * Chuẩn bị data trước khi emit 'saved'.
     * Override để thêm computed fields (workHour, breakHour, ...).
     * @returns {Object} data gửi lên parent
     */
    prepareSaveData(action) {
      return {
        ...this.form,
        _action: action, // 'save' | 'save-and-add'
      }
    },

    async handleSave() {
      if (!this.validate()) {
        const firstError = Object.values(this.errors).find((e) => e)
        if (firstError) this.showWarnValidate(firstError)
        this.focusFirstError()
        return
      }
      if (this.saving) return
      this.saving = true
      this.$emit('saved', this.prepareSaveData('save'))
    },

    async handleSaveAndAdd() {
      if (!this.validate()) {
        const firstError = Object.values(this.errors).find((e) => e)
        if (firstError) this.showWarnValidate(firstError)
        this.focusFirstError()
        return
      }
      if (this.saving) return
      this.saving = true
      this.$emit('saved', this.prepareSaveData('save-and-add'))
    },

    // ══════════════════════════════════════════════════
    // SERVER ERRORS
    // ══════════════════════════════════════════════════

    /**
     * Map lỗi từ server vào errors object.
     * Gọi từ component cha: formRef.setServerErrors([...])
     *
     * @param {string[]} serverErrors - Mảng message lỗi từ server
     * @returns {string[]} Các lỗi chưa map được
     */
    setServerErrors(serverErrors) {
      this.saving = false
      const unmapped = []

      for (const msg of serverErrors) {
        let matched = false
        for (const rule of this.errorFieldMap) {
          if (rule.keywords.some((kw) => msg.includes(kw))) {
            this.errors[rule.field] = msg
            matched = true
            break
          }
        }
        if (!matched) unmapped.push(msg)
      }

      this.focusFirstError()
      return unmapped
    },

    /**
     * Reset trạng thái saving (khi save thất bại).
     */
    resetSaving() {
      this.saving = false
    },

    // ══════════════════════════════════════════════════
    // CLOSE / EXIT
    // ══════════════════════════════════════════════════

    /**
     * Xử lý khi user muốn đóng form.
     * Nếu dirty → hiện confirm exit, ngược lại đóng luôn.
     */
    handleClose() {
      if (this.isDirty) {
        this.confirmExit.visible = true
      } else {
        this.$emit('close')
      }
    },

    cancelExit() {
      this.confirmExit.visible = false
    },

    forceClose() {
      this.confirmExit.visible = false
      this.$emit('close')
    },

    // ══════════════════════════════════════════════════
    // WARNING VALIDATE POPUP
    // ══════════════════════════════════════════════════

    showWarnValidate(msg) {
      this.warnValidate.message = msg
      this.warnValidate.visible = true
      this.$nextTick(() => this.$refs.warnOverlayRef?.focus())
    },

    closeWarnValidate() {
      this.warnValidate.visible = false
      this.warnValidate.message = ''
    },

    // ══════════════════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ══════════════════════════════════════════════════

    onKeydown(e) {
      if (!this.visible) return

      // Warning popup đang mở → chỉ xử lý Esc
      if (this.warnValidate.visible) {
        if (e.key === 'Escape') this.closeWarnValidate()
        return
      }

      // Confirm exit đang mở → chỉ xử lý Esc
      if (this.confirmExit.visible) {
        if (e.key === 'Escape') this.cancelExit()
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        this.handleClose()
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        this.handleSaveAndAdd()
      } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        this.handleSave()
      }
    },
  },

  // ─────────────────── LIFECYCLE ───────────────────
  mounted() {
    document.addEventListener('keydown', this.onKeydown)
  },

  unmounted() {
    document.removeEventListener('keydown', this.onKeydown)
  },

  // ─────────────────── EXPOSE (cho Options API dùng $refs) ───────────────────
  expose: ['setServerErrors', 'resetSaving', 'resetForm'],
}
