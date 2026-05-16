/**
 * Options API base cho các form chi tiết (Add / Edit / Duplicate)
 * // ShiftForm.vue
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
  // PROPS
  props: {
    /** Ẩn hiện form */
    visible: { type: Boolean, default: false },
    /** Dữ liệu bản ghi đang sửa / nhân bản. null = thêm mới */
    editingItem: { type: Object, default: null },
  },

  // truyền lên cha sư kiện
  emits: ['close', 'saved'],

  // DATA
  data() {
    return {
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

      // Internal state
      form: {}, // chứa dữ liệu người dùng đang nhập
      errors: {}, // Danh sách chứa các thông báo lỗi kiểm tra dữ liệu
      saving: false, // trạng thái đang lưu
      initialForm: null, // dữ liệu lúc vừa mở form

      // Popup validate cảnh báo
      warnValidate: { visible: false, message: '' },

      // Popup xác nhận đóng form
      confirmExit: { visible: false },
    }
  },

  // COMPUTED
  computed: {
    /** Form đang hiện hay không (proxy cho prop visible) */
    localVisible() {
      return this.visible
    },

    /** Đang ở chế độ Edit (có ID) hay Add/Duplicate
     * this.editingItem['productionShiftID']
    */
    isEditing() {
      return !!this.editingItem?.[this.idField]
    },

    /** Tiêu đề form: Thêm / Sửa / Nhân bản */
    formTitle() {
      // lấy tên entity từ i18n
      const entity = this.entityName
      // nếu k có editingItem thì là thêm
      if (!this.editingItem) return this.$t(`${entity}.addTitle`)
        // nếu editingItem k có id thì là nhân bản
      if (!this.editingItem[this.idField]) return this.$t(`${entity}.duplicateTitle`)
      return this.$t(`${entity}.editTitle`)
    },

    /** Kiểm tra form có thay đổi so với ban đầu không */
    isDirty() {
      if (!this.initialForm) return false
      // lấy ra mảng các trường cần kiểm tra
      const trackFields = Object.keys(this.fieldConfig)
      // nếu 1 ông khác thì coi như khác
      return trackFields.some((key) => this.form[key] !== this.initialForm[key])
    },

    /**
     * Danh sách field bắt buộc (lấy từ fieldConfig).
     * entries: biến obj thành mảng chứa các [key, value]
     */
    requiredFields() {
      return Object.entries(this.fieldConfig)
        .filter(([, cfg]) => cfg.required) // giữ lại cặp có required
        .map(([key]) => key) // trả về key: tên trường
    },
  },

  // watch visible
  watch: {
    visible(v) {
      if (!v) return // nếu =f thì đóng form
      this.errors = {} // xóa lỗi cũ
      this.saving = false
      // Nạp dữ liệu vào các ô Input trên Form" khi Form được mở ra
      this.populateForm()
      this.$nextTick(() => {
        // gán lại form dữ liệu gốc
        this.initialForm = { ...this.form }
        //Focus vào field lỗi đầu tiên.
        this.focusFirstField()
      })
    },

    // Tự động tắt viền đỏ và xóa câu thông báo lỗi ngay lập tức khi người dùng vừa gõ chữ vào ô bị nhập sai.
    form: {
      deep: true,
      handler(newForm) {
        // Duyệt qua tất cả các trường đang có trên Form
        for (const key of Object.keys(newForm)) {
          const val = newForm[key]
          // Nếu ô đó ĐÃ CÓ DỮ LIỆU (không trống) VÀ ô đó ĐANG HIỂN THỊ LỖI ĐỎ (this.errors[key] có giá trị)
          if (val !== undefined && val !== null && val !== '' && this.errors[key]) {
            this.errors[key] = ''
          }
        }
      },
    },
  },

  //  METHODS
  methods: {
    // FORM DATA
    /**
     * Tạo object form rỗng từ fieldConfig.
     * fieldConfig: {
        productionShiftCode: { required: true, maxLength: 20, i18nKey: 'code' },
        productionShiftName: { required: true, maxLength: 50, i18nKey: 'name' },
      },
     */
    createEmptyForm() {
      const empty = {}
      // Duyệt qua từng trường trong cấu hình để khởi tạo giá trị ban đầu
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
     * Nạp dữ liệu vào các ô Input trên Form" khi Form được mở ra
     */
    populateForm() {
      // nếu là sửa/ nhân bản
      if (this.editingItem) {
        // tạo form rỗng, chứa đủ field
        const f = this.createEmptyForm()
        // Copy dữ liệu từ editingItem vào form
        for (const key of Object.keys(f)) {
          if (this.editingItem[key] !== undefined) {
            f[key] = this.editingItem[key]
          }
        }
        // gán lại giá trị cho form hiển thị
        this.form = f
      } else { // nếu là thêm
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
        //Focus vào field lỗi đầu tiên.
        this.focusFirstField()
      })
    },

    // VALIDATION
    /**
     * Validate 1 field cụ thể.
     * Tự động check required + maxLength từ fieldConfig.
     * Override để thêm logic validate custom (vd: so sánh thời gian).
     */
    validateField(field) {
      // lấu cấu hình của field
      const cfg = this.fieldConfig[field]
      if (!cfg) return
      // lấy giá trị của field ng dùng vừa gõ
      const val = this.form[field]
      // lấy entity để i18n
      const entity = this.entityName
      // Dùng i18nKey nếu có, không thì dùng tên field
      const key = cfg.i18nKey || field

      // Required check
      if (cfg.required) {
        // nếu chưa nhập, rỗng hoặc khoảng trống
        const isEmpty = val === undefined || val === null || String(val).trim() === ''
        if (isEmpty) {
          // báo lỗi
          this.errors[field] = this.$t(`${entity}.validation.${key}Required`)
          return
        }
      }

      // Max length check
      // nếu giá trị ? maxLength thì lỗi
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
        // lấy DOM trường đầu tiền
        const refName = this.fieldRefMap[firstKey] || firstKey + 'Ref'
        // tiến hành focus
        const refEl = this.$refs[refName]
        if (refEl?.focus) refEl.focus()
      })
    },

    /**
     * Focus vào field đầu tiên khi mở form.
     */
    focusFirstField() {
      const firstField = Object.keys(this.fieldConfig)[0]
      if (!firstField) return
      const refName = this.fieldRefMap[firstField] || firstField + 'Ref'
      this.$refs[refName]?.focus()
    },
    // SAVE
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
      // nếu dính lỗi validate
      if (!this.validate()) {
        // tìm lỗi đầu tiên
        const firstError = Object.values(this.errors).find((e) => e)
        // show cảnh báo
        if (firstError) this.showWarnValidate(firstError)
        // focus vào lỗi đầu
        this.focusFirstError()
        return
      }
      // k lỗi validate

      if (this.saving) return // chống double click
      this.saving = true

      // bắn sự kiện lên cha
      this.$emit('saved', this.prepareSaveData('save'))
    },

    async handleSaveAndAdd() {
      // nếu dính lỗi validate
      if (!this.validate()) {
        // tìm lỗi đầu tiên
        const firstError = Object.values(this.errors).find((e) => e)
        // show cảnh báo
        if (firstError) this.showWarnValidate(firstError)
          // focus vào lỗi đầu
        this.focusFirstError()
        return
      }
      if (this.saving) return
      this.saving = true
      // bắn sự kiện lên cha
      this.$emit('saved', this.prepareSaveData('save-and-add'))
    },
    // SERVER ERRORS
    /**
     * Map lỗi từ server vào errors object.
     * Gọi từ component cha: formRef.setServerErrors([...])
     *
     * @param {string[]} serverErrors - Mảng message lỗi từ server
     * @returns {string[]} Các lỗi chưa map được
     */
    setServerErrors(serverErrors) {
      this.saving = false // chưa lưu
      const unmapped = [] // gom câu lỗi lạ, 500

      // duyệt từng lỗi server trả về
      for (const msg of serverErrors) {
        let matched = false
        // duyệt qua bộ quy tắc lỗi
        for (const rule of this.errorFieldMap) {
          // nếu msg chứa 1 kw trong bộ quy tắc
          if (rule.keywords.some((kw) => msg.includes(kw))) {
            this.errors[rule.field] = msg
            matched = true
            break
          }
        }
        // nếu lỗi k khớp với bộ quy tắc
        if (!matched) unmapped.push(msg)
      }

      // focus ô đầu tiên lỗi
      this.focusFirstError()
      // trả về lỗi lạ
      return unmapped
    },

    /**
     * Reset trạng thái saving (khi save thất bại).
     */
    resetSaving() {
      this.saving = false
    },
    // CLOSE / EXIT
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

    // hủy thoát
    cancelExit() {
      this.confirmExit.visible = false
    },

    // đóng form
    forceClose() {
      this.confirmExit.visible = false
      this.$emit('close')
    },
    // WARNING VALIDATE POPUP
    showWarnValidate(msg) {
      this.warnValidate.message = msg
      this.warnValidate.visible = true
      this.$nextTick(() => this.$refs.warnOverlayRef?.focus())
    },

    // đóng cảnh báo
    closeWarnValidate() {
      this.warnValidate.visible = false
      this.warnValidate.message = ''
    },
    // KEYBOARD SHORTCUTS
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

  // LIFECYCLE
  mounted() {
    document.addEventListener('keydown', this.onKeydown)
  },

  unmounted() {
    document.removeEventListener('keydown', this.onKeydown)
  },

  //EXPOSE (cho Options API dùng $refs) ───────────────────
  expose: ['setServerErrors', 'resetSaving', 'resetForm'],
}
