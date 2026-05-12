<template>
  <div class="col-filter" ref="filterRef">
    <!-- Trigger icon -->
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
        <div class="col-filter__header">
          <span class="col-filter__title">Lọc {{ label }}</span>
          <button class="col-filter__close" @click="close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="col-filter__body">
          <!-- Operator (ẩn khi là status) -->
          <select v-if="filterType !== 'status'" v-model="localOperator" class="col-filter__select">
            <option v-for="op in operatorOptions" :key="op.value" :value="op.value">
              {{ op.label }}
            </option>
          </select>

          <!-- Status: chọn trạng thái -->
          <select v-if="filterType === 'status'" v-model="localValue" class="col-filter__select">
            <option value="">-- Chọn trạng thái --</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

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
})

const emit = defineEmits(['apply', 'clear'])

const open = ref(false)
const filterRef = ref(null)
const valueInput = ref(null)
const localOperator = ref('contains')
const localValue = ref('')
const popoverStyle = ref({})

// ===== Operator lists theo yêu cầu =====

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

const operatorOptions = computed(() => {
  if (props.filterType === 'number') return NUMBER_OPS
  if (props.filterType === 'date') return DATE_OPS
  if (props.filterType === 'status') return [] // không dùng
  return STRING_OPS
})

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
})

function getDefaultOperator() {
  if (props.filterType === 'string') return 'contains'
  if (props.filterType === 'status') return 'equals'
  return 'equals'
}

function toggle() {
  if (open.value) {
    close()
    return
  }
  open.value = true
  nextTick(() => {
    positionPopover()
    if (props.filterType !== 'status') {
      valueInput.value?.focus()
    }
  })
}

function close() {
  open.value = false
}

function apply() {
  // Status luôn dùng operator 'equals'
  const operator = props.filterType === 'status' ? 'equals' : localOperator.value

  if (!localValue.value && localValue.value !== '0' && localValue.value !== 0) return

  emit('apply', {
    Property: props.property,
    Operator: operator,
    Value: String(localValue.value).trim(),
  })
  close()
}

function clearFilter() {
  localValue.value = ''
  localOperator.value = getDefaultOperator()
  emit('clear', props.property)
  close()
}

function positionPopover() {
  if (!filterRef.value) return
  const rect = filterRef.value.getBoundingClientRect()
  popoverStyle.value = {
    position: 'fixed',
    top: rect.bottom + 6 + 'px',
    left: Math.max(rect.left - 100, 8) + 'px',
    zIndex: 9999,
  }
}

function onClickOutside(e) {
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
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 14px;
  padding: 2px;
  border-radius: 4px;
}
.col-filter__close:hover {
  color: #374151;
  background: #f3f4f6;
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
</style>
