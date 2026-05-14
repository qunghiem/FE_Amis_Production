<!-- UI bộ Filter cho từng cột trong bảng, hỗ trợ các loại filter khác nhau (string, number, date, status) -->

<template>
  <div class="col-filter" ref="filterRef">
    <!-- Icon lọc -->
    <button
      class="col-filter__trigger"
      :class="{ 'col-filter__trigger--active': hasFilter }"
      @click.stop="toggle"
      :title="'Lọc ' + label"
    >
      <i></i>
    </button>

    <!-- Popover -->
    <teleport to="body">
      <div v-if="open" class="col-filter__popover" :style="popoverStyle" @click.stop>
        <!-- Tên bộ lọc+icon đóng: Lọc mã ca -->
        <div class="col-filter__header">
          <span class="col-filter__title">Lọc {{ label }}</span>
          <button class="col-filter__close" @click="close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="col-filter__body">
          <!-- Operator (ẩn khi là status) -->
          <!-- MỚI -->
          <div
            v-if="filterType !== 'status'"
            class="col-filter__select-wrapper"
            ref="selectWrapperRef"
          >
            <div
              class="col-filter__select-trigger"
              :class="{ 'col-filter__select-trigger--open': operatorDropdownOpen }"
              @click="toggleOperatorDropdown"
            >
              <span>{{ getOperatorLabel(localOperator) }}</span>
              <span
                class="col-filter__select-arrow"
                :class="{ 'col-filter__select-arrow--open': operatorDropdownOpen }"
              ></span>
            </div>
            <div v-if="operatorDropdownOpen" class="col-filter__operator-dropdown">
              <div
                v-for="op in operatorOptions"
                :key="op.value"
                class="col-filter__operator-option"
                :class="{ 'col-filter__operator-option--selected': localOperator === op.value }"
                @click="selectOperator(op.value)"
              >
                <span>{{ op.label }}</span>
                <span class="col-filter__operator-check">
                  <i v-if="localOperator === op.value" class="col-filter__check-icon"></i>
                </span>
              </div>
            </div>
          </div>

          <!-- Status: chọn trạng thái -->
          <select v-if="filterType === 'status'" v-model="localValue" class="col-filter__select">
            <option value="">-- Chọn trạng thái --</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <!-- End Operator (ẩn khi là status) -->

          <!-- Date: input type date -->
          <input
            v-else-if="filterType === 'date'"
            ref="valueInput"
            v-model="localValue"
            class="col-filter__input"
            type="date"
            @keyup.enter="apply"
          />

          <!-- Default: text input -->
          <input
            v-else-if="filterType !== 'status'"
            ref="valueInput"
            v-model="localValue"
            class="col-filter__input"
            :placeholder="'Nhập giá trị lọc'"
            @keyup.enter="apply"
            :type="filterType === 'number' ? 'number' : 'text'"
          />
        </div>

        <div class="col-filter__footer">
          <button class="col-filter__btn col-filter__btn--clear" @click="clearFilter">
            Bỏ lọc
          </button>
          <button class="col-filter__btn col-filter__btn--cancel" @click="close">Huỷ</button>
          <button class="col-filter__btn col-filter__btn--apply" @click="apply">Áp dụng</button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  /** Tên cột hiển thị */
  label: { type: String, required: true },
  /** Tên property gửi về backend */
  property: { type: String, required: true },
  /** Loại filter: 'string' | 'number' | 'date' | 'status' */
  filterType: { type: String, default: 'string' },
  /** Filter hiện tại (nếu có) */
  currentFilter: { type: Object, default: null },
  activeFilterKey: { type: String, default: '' },
})

const emit = defineEmits(['apply', 'clear'])

const open = ref(false) // trạng thái mở/đóng của Bộ lọc
const filterRef = ref(null) // ref tới element gốc để tính toán vị trí popover
const valueInput = ref(null) // ref tới input để focus khi mở
const localOperator = ref('contains') // operator tạm thời khi chỉnh sửa trong Bộ lọc
const localValue = ref('') // value tạm thời khi chỉnh sửa trong Bộ lọc
const popoverStyle = ref({}) // style động để position popover dưới icon lọc
const operatorDropdownOpen = ref(false)
const selectWrapperRef = ref(null)
//toán tử theo từng loại Filter
const STRING_OPS = [
  { value: 'contains', label: 'Chứa' },
  { value: 'not_equals', label: 'Khác' },
  { value: 'not_contains', label: 'Không chứa' },
  { value: 'starts_with', label: 'Bắt đầu với' },
  { value: 'ends_with', label: 'Kết thúc với' },
]

const NUMBER_OPS = [
  { value: 'equals', label: 'Bằng' },
  { value: 'not_equals', label: 'Khác' },
  { value: 'less_than', label: 'Nhỏ hơn' },
  { value: 'less_than_or_equal', label: 'Nhỏ hơn hoặc bằng' },
  { value: 'greater_than', label: 'Lớn hơn' },
]

const DATE_OPS = [
  { value: 'equals', label: 'Bằng' },
  { value: 'not_equals', label: 'Khác' },
  { value: 'less_than', label: 'Nhỏ hơn' },
  { value: 'less_than_or_equal', label: 'Nhỏ hơn hoặc bằng' },
  { value: 'greater_than', label: 'Lớn hơn' },
]

// Status không cần operator, chỉ chọn giá trị
const statusOptions = [
  { value: '1', label: 'Đang sử dụng' },
  { value: '0', label: 'Ngừng sử dụng' },
]

// Lấy danh sách operator phù hợp theo loại filter
const operatorOptions = computed(() => {
  if (props.filterType === 'number') return NUMBER_OPS
  if (props.filterType === 'date') return DATE_OPS
  if (props.filterType === 'status') return [] // không dùng
  return STRING_OPS
})

// Kiểm tra xem có filter đang áp dụng cho cột này không
const hasFilter = computed(() => !!props.currentFilter)

// Khi mở, sync với filter hiện tại
watch(open, (v) => {
  if (v && props.currentFilter) {
    localOperator.value = props.currentFilter.Operator || getDefaultOperator()
    localValue.value = props.currentFilter.Value || ''
  } else if (v) {
    localOperator.value = getDefaultOperator()
    localValue.value = ''
  }
  if (!v) {
    operatorDropdownOpen.value = false
  }
})

// ★ Đóng khi filter khác được mở
watch(
  () => props.activeFilterKey,
  (newKey) => {
    if (newKey && newKey !== props.property && open.value) {
      close()
    }
  },
)

// Lấy operator mặc định theo loại filter
function getDefaultOperator() {
  if (props.filterType === 'string') return 'contains'
  if (props.filterType === 'status') return 'equals'
  return 'equals'
}

// Khi click vào icon lọc
function toggle() {
  if (open.value) {
    close()
    return
  }
  open.value = true
  emit('filter-opened', props.property) // ★ báo parent
  nextTick(() => {
    positionPopover()
    if (props.filterType !== 'status') {
      valueInput.value?.focus()
    }
  })
}

function getOperatorLabel(value) {
  const allOps = [...STRING_OPS, ...NUMBER_OPS, ...DATE_OPS]
  return allOps.find((o) => o.value === value)?.label || value
}

function toggleOperatorDropdown() {
  operatorDropdownOpen.value = !operatorDropdownOpen.value
}

function selectOperator(value) {
  localOperator.value = value
  operatorDropdownOpen.value = false
}

// Đóng bộ lọc
function close() {
  open.value = false
  operatorDropdownOpen.value = false
}

// Khi click Áp dụng lọc
function apply() {
  // Nếu lọc cột trạng thái, luôn luôn là equals(bằng)
  const operator = props.filterType === 'status' ? 'equals' : localOperator.value

  // Nếu không có giá trị nào được nhập thì không áp dụng lọc, tránh gửi những filter có value rỗng về backend
  if (!localValue.value && localValue.value !== '0' && localValue.value !== 0) return

  emit('apply', {
    Property: props.property, // tên cột cần lọc
    Operator: operator, // toán tử
    Value: String(localValue.value).trim(), // giá trị lọc
  })
  close()
}

// Xóa bộ lọc khi click Bỏ lọc
function clearFilter() {
  localValue.value = ''
  localOperator.value = getDefaultOperator()
  emit('clear', props.property)
  close()
}

// Tính toán vị trí của popover dựa trên vị trí của icon lọc
function positionPopover() {
  if (!filterRef.value) return
  // hàm trả về kích thước và vị trí của element so với viewport
  const rect = filterRef.value.getBoundingClientRect()

  // set style vị trí cho popover để nó hiển thị ngay dưới icon lọc, căn trái với icon, và có khoảng cách 6px
  popoverStyle.value = {
    position: 'fixed',
    top: rect.bottom + 6 + 'px',
    left: Math.max(rect.left - 100, 8) + 'px',
    zIndex: 9999,
  }
}

// Đóng popover khi click ra ngoài
function onClickOutside(e) {
  if (
    operatorDropdownOpen.value &&
    selectWrapperRef.value &&
    !selectWrapperRef.value.contains(e.target)
  ) {
    operatorDropdownOpen.value = false
  }
  // Nếu đang mở và click ra ngoài filterRef thì đóng popover, nhưng nếu click vào popover thì không đóng
  if (open.value && filterRef.value && !filterRef.value.contains(e.target)) {
    const popover = document.querySelector('.col-filter__popover')
    if (popover && popover.contains(e.target)) return
    close()
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.col-filter {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  position: relative;
}

.col-filter__trigger {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  transition: background-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  min-width: 16px;
  min-height: 16px;
}
.col-filter__trigger i {
  display: block;
  width: 16px;
  height: 16px;
  min-width: 16px;
  min-height: 16px;
  -webkit-mask-repeat: no-repeat;
  mask-position: -544px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
  background-color: #4b5563;
  transition: background-color 0.15s;
}

.col-filter__trigger:hover {
  color: var(--primary);
}
.col-filter__trigger--active i {
  mask-position: -720px 0px;
}
</style>

<style>
/* Popover styles (không scoped vì dùng teleport) */
.col-filter__popover {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.14);
  width: 280px;
  padding: 0;
  font-family: inherit;
}

.col-filter__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 10px;
}
.col-filter__title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
.col-filter__close {
  border: none;
  cursor: pointer;
  border-radius: 4px;
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  mask-position: -96px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}

.col-filter__body {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col-filter__select,
.col-filter__input {
  width: 100%;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 13px;
  color: #1f2937;
  background: #fff;
  outline: none;
  font-family: inherit;
}
.col-filter__select:focus,
.col-filter__input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 155, 113, 0.1);
}

.col-filter__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 16px;
}

.col-filter__btn {
  padding: 7px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  font-weight: 500;
}
.col-filter__btn--clear {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  margin-right: auto;
}
.col-filter__btn--clear:hover {
  background: #f3f4f6;
}

.col-filter__btn--cancel {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
}
.col-filter__btn--cancel:hover {
  background: #f3f4f6;
}

.col-filter__btn--apply {
  background: var(--primary);
  border: none;
  color: #fff;
}
.col-filter__btn--apply:hover {
  background: var(--primary-hover);
}

/* ===== Custom Operator Dropdown ===== */
.col-filter__select-wrapper {
  position: relative;
}

.col-filter__select-trigger {
  width: 100%;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 13px;
  color: #1f2937;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.col-filter__select-trigger--open {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 155, 113, 0.1);
}

.col-filter__select-arrow {
  mask-position: -202px -18px;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  position: relative;
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}

.col-filter__select-arrow--open {
  transform: rotate(180deg);
}

.col-filter__operator-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  z-index: 10000;
  padding: 4px 0;
}

.col-filter__operator-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.col-filter__operator-option:hover {
  background-color: #f3f4f6;
}

.col-filter__operator-option--selected {
  font-weight: 500;
  color: #009b71;
  background-color: #d0fbe7;
      display: flex;
    justify-content: space-between;
}

.col-filter__operator-check {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.col-filter__check-icon {
  display: block;
  width: 12px;
  height: 7px;
  border-left: 2px solid var(--primary, #009b71);
  border-bottom: 2px solid var(--primary, #009b71);
  transform: rotate(-45deg);
}
</style>
