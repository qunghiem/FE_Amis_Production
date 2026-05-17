<!-- UI bộ Filter cho từng cột trong bảng -->

<template>
  <!-- icon lọc -->
  <div class="col-filter" ref="filterRef">
    <button
      class="col-filter__trigger"
      :class="{ 'col-filter__trigger--active': hasFilter }"
      @click.stop="toggle"
      :title="$t('filter.filterLabel', { label })"
    >
      <i></i>
    </button>
    <!-- bộ lọc -->
    <teleport to="body">
      <div v-if="open" class="col-filter__popover" :style="popoverStyle" @click.stop>
        <div class="col-filter__header">
          <span class="col-filter__title">{{ $t('filter.filterLabel', { label }) }}</span>
          <button class="col-filter__close" @click="close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="col-filter__body">
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

          <select v-if="filterType === 'status'" v-model="localValue" class="col-filter__select">
            <option value="">{{ $t('filter.selectStatus') }}</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <input
            v-else-if="filterType === 'date'"
            ref="valueInput"
            v-model="localValue"
            class="col-filter__input"
            type="date"
            @keyup.enter="apply"
          />

          <input
            v-else-if="filterType !== 'status'"
            ref="valueInput"
            v-model="localValue"
            class="col-filter__input"
            :placeholder="$t('filter.enterValue')"
            @keyup.enter="apply"
            :type="filterType === 'number' ? 'number' : 'text'"
          />
        </div>

        <div class="col-filter__footer">
          <button class="col-filter__btn col-filter__btn--clear" @click="clearFilter">
            {{ $t('filter.clear') }}
          </button>
          <button class="col-filter__btn col-filter__btn--cancel" @click="close">
            {{ $t('common.cancel') }}
          </button>
          <button class="col-filter__btn col-filter__btn--apply" @click="apply">
            {{ $t('filter.apply') }}
          </button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  label: { type: String, required: true }, // tên cột
  property: { type: String, required: true }, // tên trường dữ liệu
  filterType: { type: String, default: 'string' }, // kiểu dữ liệu của cột
  currentFilter: { type: Object, default: null }, // dữ liệu lọc hiện tại
  activeFilterKey: { type: String, default: '' }, // Key định danh xem bộ lọc của cột nào đang được mở trên toàn hệ thống bảng.
})

const emit = defineEmits(['apply', 'clear'])

const open = ref(false) // ẩn hiện bộ lọc
const filterRef = ref(null) // dom của icon lọc
const valueInput = ref(null)
const localOperator = ref('contains') // toán tử đang được chọn
const localValue = ref('') // giá trị đang gõ
const popoverStyle = ref({}) // vị trí
const operatorDropdownOpen = ref(false) // đóng mở menu chọn toán tử
const selectWrapperRef = ref(null)

// toán tử cho kiểu dữ liệu string
const STRING_OPS = computed(() => [
  { value: 'contains', label: t('filter.operators.contains') },
  { value: 'not_equals', label: t('filter.operators.not_equals') },
  { value: 'not_contains', label: t('filter.operators.not_contains') },
  { value: 'starts_with', label: t('filter.operators.starts_with') },
  { value: 'ends_with', label: t('filter.operators.ends_with') },
])

// toán tử cho kiểu dữ liệu number
const NUMBER_OPS = computed(() => [
  { value: 'equals', label: t('filter.operators.equals') },
  { value: 'not_equals', label: t('filter.operators.not_equals') },
  { value: 'less_than', label: t('filter.operators.less_than') },
  { value: 'less_than_or_equal', label: t('filter.operators.less_than_or_equal') },
  { value: 'greater_than', label: t('filter.operators.greater_than') },
])

// toán tử cho kiểu dữ liệu date
const DATE_OPS = computed(() => [
  { value: 'equals', label: t('filter.operators.equals') },
  { value: 'not_equals', label: t('filter.operators.not_equals') },
  { value: 'less_than', label: t('filter.operators.less_than') },
  { value: 'less_than_or_equal', label: t('filter.operators.less_than_or_equal') },
  { value: 'greater_than', label: t('filter.operators.greater_than') },
])

// giá trị cho kiểu dữ liệu status
const statusOptions = computed(() => [
  { value: '1', label: t('shift.status.active') },
  { value: '0', label: t('shift.status.inactive') },
])

// dựa vào type để lấy ra toán tử phù hợp
const operatorOptions = computed(() => {
  if (props.filterType === 'number') return NUMBER_OPS.value
  if (props.filterType === 'date') return DATE_OPS.value
  if (props.filterType === 'status') return []
  return STRING_OPS.value
})

// kiểm tra cột có đang lọc k
const hasFilter = computed(() => !!props.currentFilter)

// theo dõi đóng/mở bộ lọc
watch(open, (v) => {
  // nếu cột đã lọc trước đó
  if (v && props.currentFilter) {
    // gán lại
    localOperator.value = props.currentFilter.Operator || getDefaultOperator()
    localValue.value = props.currentFilter.Value || ''
  } else if (v) {
    localOperator.value = getDefaultOperator()
    localValue.value = ''
  }
  if (!v) operatorDropdownOpen.value = false // đóng menu dropdown
})

// chỉ cho phép duy nhất mở 1 bảng lọc tại 1 thời điểm
watch(
  () => props.activeFilterKey,
  (newKey) => {
    // nếu cột vừa mở khác cột hiện tại thì đóng bộ lọc hiện tại
    if (newKey && newKey !== props.property && open.value) close()
  },
)

// lấy toán tử mặc định
function getDefaultOperator() {
  if (props.filterType === 'string') return 'contains'
  if (props.filterType === 'status') return 'equals'
  return 'equals'
}

// click icon phểu để mở/đóng bộ lọc
function toggle() {
  // nếu đang mở thì đóng
  if (open.value) {
    close()
    return
  }
  open.value = true
  // gửi emit lên cha để cha đóng bộ lọc khác
  emit('filter-opened', props.property)
  nextTick(() => {
    positionPopover()
    //  nếu là kiểu date, string => auto focus
    if (props.filterType !== 'status') valueInput.value?.focus()
  })
}

// get tên hiển thị cho toán tử
function getOperatorLabel(value) {
  // gộp các mảng toán tử và lấy ra label
  const allOps = [...STRING_OPS.value, ...NUMBER_OPS.value, ...DATE_OPS.value]
  return allOps.find((o) => o.value === value)?.label || value
}

// đóng  <-> mở
function toggleOperatorDropdown() {
  operatorDropdownOpen.value = !operatorDropdownOpen.value
}

// click chọn toán tử
function selectOperator(value) {
  // set giá trị
  localOperator.value = value
  // đóng menu
  operatorDropdownOpen.value = false
}

// click đóng
function close() {
  // Đóng bảng lọc chính
  open.value = false
  // / Đóng luôn cả menu con chọn toán tử so sánh
  operatorDropdownOpen.value = false
}

// click áp dụng bộ ljc
function apply() {
  const operator = props.filterType === 'status' ? 'equals' : localOperator.value
  if (!localValue.value && localValue.value !== '0' && localValue.value !== 0) return
  emit('apply', {
    Property: props.property,
    Operator: operator,
    Value: String(localValue.value).trim(),
  })
  close()
}

// xóa bộ lọc
function clearFilter() {
  localValue.value = ''
  localOperator.value = getDefaultOperator()
  emit('clear', props.property)
  close()
}

// tính toán vị trí
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

// click ra ngoài
function onClickOutside(e) {
  if (
    operatorDropdownOpen.value &&
    selectWrapperRef.value &&
    !selectWrapperRef.value.contains(e.target)
  ) {
    operatorDropdownOpen.value = false // đóng menu toán tử
  }
  // kiểm tra xem có click vào icon lọc k
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

.col-filter__input {
  height: 28px;
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
  padding: 5px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  font-weight: 550;
}
.col-filter__btn--clear {
  margin-right: auto;
  background-color: #f3f4f6;
    color: #111827;
    border: none;
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
.col-filter__select-wrapper {
  position: relative;
}
.col-filter__select-trigger {
  width: 100%;
  height: 28px;
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
