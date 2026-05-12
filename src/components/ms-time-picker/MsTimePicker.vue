<!-- Time picker với dropdown chọn giờ theo bước 30 phút -->

<template>
  <div class="ms-time-picker" ref="pickerRef">
    <div
      class="ms-time-picker__input"
      :class="{ 'ms-time-picker--invalid': error, 'ms-time-picker--focus': dropdownOpen }"
      @click="toggleDropdown"
    >
      <input
        ref="inputRef"
        type="text"
        class="ms-time-picker__value"
        :placeholder="placeholder"
        v-model="displayValue"
        @input="onManualInput"
        @focus="dropdownOpen = true"
        @blur="onBlur"
        @keydown.down.prevent="moveHighlight(1)"
        @keydown.up.prevent="moveHighlight(-1)"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.escape="dropdownOpen = false"
        maxlength="5"
      />
      <span class="ms-time-picker__icon"></span>
    </div>

    <!-- Dropdown -->
    <teleport to="body">
      <div
        v-if="dropdownOpen"
        class="ms-time-picker__dropdown"
        :style="dropdownStyle"
        ref="dropdownRef"
      >
        <div
          v-for="(time, idx) in timeOptions"
          :key="time"
          class="ms-time-picker__option"
          :class="{
            'ms-time-picker__option--selected': time === modelValue,
            'ms-time-picker__option--highlighted': idx === highlightedIndex,
          }"
          @mousedown.prevent="selectTime(time)"
        >
          {{ time }}
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'HH:MM' },
  error: { type: String, default: '' },
  step: { type: Number, default: 30 }, // phút
})

const emit = defineEmits(['update:modelValue', 'blur'])

const pickerRef = ref(null)
const inputRef = ref(null)
const dropdownRef = ref(null)
const dropdownOpen = ref(false)
const highlightedIndex = ref(-1)
const dropdownStyle = ref({})

// Tạo danh sách thời gian theo step
const timeOptions = computed(() => {
  const options = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += props.step) {
      options.push(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      )
    }
  }
  return options
})

const displayValue = computed({
  get: () => props.modelValue || '',
  set: (v) => emit('update:modelValue', v),
})

function onManualInput(e) {
  let val = e.target.value.replace(/[^\d:]/g, '')
  // Auto thêm dấu : sau 2 số
  if (val.length === 2 && !val.includes(':')) {
    val = val + ':'
  }
  emit('update:modelValue', val)
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    nextTick(() => {
      positionDropdown()
      scrollToSelected()
    })
  }
}

function selectTime(time) {
  emit('update:modelValue', time)
  dropdownOpen.value = false
}

function onBlur(e) {
  // Delay đóng để cho phép click vào dropdown
  setTimeout(() => {
    if (!dropdownRef.value?.contains(document.activeElement)) {
      dropdownOpen.value = false
    }
    emit('blur', e)
  }, 150)
}

function moveHighlight(dir) {
  if (!dropdownOpen.value) {
    dropdownOpen.value = true
    nextTick(positionDropdown)
    return
  }
  let idx = highlightedIndex.value + dir
  if (idx < 0) idx = timeOptions.value.length - 1
  if (idx >= timeOptions.value.length) idx = 0
  highlightedIndex.value = idx
  scrollToHighlighted()
}

function selectHighlighted() {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < timeOptions.value.length) {
    selectTime(timeOptions.value[highlightedIndex.value])
  }
}

function scrollToSelected() {
  if (!dropdownRef.value) return
  const idx = timeOptions.value.indexOf(props.modelValue)
  if (idx >= 0) {
    highlightedIndex.value = idx
    const el = dropdownRef.value.children[idx]
    if (el) el.scrollIntoView({ block: 'center' })
  }
}

function scrollToHighlighted() {
  if (!dropdownRef.value) return
  const el = dropdownRef.value.children[highlightedIndex.value]
  if (el) el.scrollIntoView({ block: 'nearest' })
}

function positionDropdown() {
  if (!pickerRef.value) return
  const rect = pickerRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const dropdownHeight = 240

  if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
    // Hiển thị phía trên
    dropdownStyle.value = {
      position: 'fixed',
      bottom: (window.innerHeight - rect.top + 4) + 'px',
      left: rect.left + 'px',
      width: rect.width + 'px',
      zIndex: 10000,
    }
  } else {
    dropdownStyle.value = {
      position: 'fixed',
      top: (rect.bottom + 4) + 'px',
      left: rect.left + 'px',
      width: rect.width + 'px',
      zIndex: 10000,
    }
  }
}

// Đóng dropdown khi click ra ngoài
function onDocClick(e) {
  if (
    dropdownOpen.value &&
    pickerRef.value &&
    !pickerRef.value.contains(e.target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(e.target)
  ) {
    dropdownOpen.value = false
  }
}

watch(dropdownOpen, (v) => {
  if (v) nextTick(() => { positionDropdown(); scrollToSelected() })
})

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))

defineExpose({ focus: () => inputRef.value?.focus() })
</script>

<style scoped>
.ms-time-picker {
  position: relative;
}

.ms-time-picker__input {
  display: flex;
  align-items: center;
  height: 28px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 10px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  gap: 6px;
  max-width: 122px ;
}

.ms-time-picker__input:hover {
  border-color: #b0b0b0;
}

.ms-time-picker--focus {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 2px rgba(0, 155, 113, 0.1);
}

.ms-time-picker--invalid {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15) !important;
}

.ms-time-picker__value {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  font-family: inherit;
  color: #1f2937;
  background: transparent;
  padding: 0;
  width: 100%;
}

.ms-time-picker__value::placeholder {
  color: #9ca3af;
}

.ms-time-picker__icon {
  width: 16px;
  height: 16px;
  min-width: 16px;
  min-height: 16px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1.5px solid #9ca3af;
  position: relative;
}

/* Vẽ kim đồng hồ bằng CSS */
.ms-time-picker__icon::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5px;
  height: 4px;
  background: #9ca3af;
  border-radius: 1px;
}

.ms-time-picker__icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: left center;
  transform: translateY(-50%);
  width: 4px;
  height: 1.5px;
  background: #9ca3af;
  border-radius: 1px;
}
</style>

<style>
/* Dropdown teleport nên không scoped */
.ms-time-picker__dropdown {
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  max-height: 240px;
  overflow-y: auto;
  scrollbar-width: thin;
      max-width: 122px;
      text-align: center;
}

.ms-time-picker__dropdown::-webkit-scrollbar {
  width: 6px;
}

.ms-time-picker__dropdown::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.ms-time-picker__option {
  padding: 7px 12px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.1s;
}

.ms-time-picker__option:hover,
.ms-time-picker__option--highlighted {
  background-color: #f3f4f6;
}

.ms-time-picker__option--selected {
  background-color: #e0f7ef;
  color: var(--primary);
  font-weight: 500;
}
</style>
