<!-- Dropdown chọn số dòng/trang (thay thế select mặc định) -->

<template>
  <div class="page-size-select" ref="wrapperRef">
    <!-- Trigger -->
    <div
      class="page-size-select__trigger"
      :class="{ 'page-size-select__trigger--open': open }"
      @click="toggle"
    >
      <span class="page-size-select__value">{{ modelValue }}</span>
      <span
        class="page-size-select__arrow"
        :class="{ 'page-size-select__arrow--open': open }"
      ></span>
    </div>

    <!-- Dropdown -->
    <teleport to="body">
      <div
        v-if="open"
        ref="dropdownRef"
        class="page-size-select__dropdown"
        :style="dropdownStyle"
        @click.stop
      >
        <div
          v-for="opt in options"
          :key="opt"
          class="page-size-select__option"
          :class="{ 'page-size-select__option--selected': opt === modelValue }"
          @click="selectOption(opt)"
        >
          <span>{{ opt }}</span>
          <span v-if="opt === modelValue" class="page-size-select__check"></span>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  options: { type: Array, default: () => [10, 20, 50, 100] },
})

const emit = defineEmits(['update:modelValue'])

// trạng thái đóng mở
const open = ref(false)
// ref DOM cho wrapper
const wrapperRef = ref(null)
// ref DOM cho dropdown
const dropdownRef = ref(null)
const dropdownStyle = ref({})

// click thay đổi pageSize
function toggle() {
  // đang đóng thì mở đang mở thì đóng
  open.value = !open.value
  // nếu đang mở
  if (open.value) {
    nextTick(positionDropdown) // tính vị trí hiển thị dropdown
  }
}

function selectOption(val) {
  emit('update:modelValue', val)
  open.value = false
}

// tính vị trí hiển thị dropdown
function positionDropdown() {
  if (!wrapperRef.value) return
  // lấy vị trí wrapper
  const rect = wrapperRef.value.getBoundingClientRect()
  // chiều cao còn lại
  const spaceBelow = window.innerHeight - rect.bottom
  // chiều cao menu
  const dropdownHeight = props.options.length * 36 + 8 // estimate

  if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
    dropdownStyle.value = {
      position: 'fixed',
      bottom: (window.innerHeight - rect.top + 4) + 'px',
      left: rect.left + 'px',
      minWidth: rect.width + 'px',
      zIndex: 99999,
    }
  } else {
    dropdownStyle.value = {
      position: 'fixed',
      top: (rect.bottom + 4) + 'px',
      left: rect.left + 'px',
      minWidth: rect.width + 'px',
      zIndex: 99999,
    }
  }
}

// click ra ngoài để đóng menu
function onClickOutside(e) {
  if (
    open.value && // menu đang mở
    wrapperRef.value && // nút bấm tồn tại
    !wrapperRef.value.contains(e.target) && // vị trí click k nằm trong nút
    dropdownRef.value && // menu tồn tại
    !dropdownRef.value.contains(e.target) // vị trí click k nằm trong menu
  ) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.page-size-select {
  position: relative;
  display: inline-flex;
}

.page-size-select__trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: #1f2937;
  min-width: 56px;
  justify-content: space-between;
  transition: border-color 0.2s;
  height: 28px;
}

.page-size-select__trigger:hover {
  border-color: #b0b0b0;
}

.page-size-select__trigger--open {
  border-color: var(--primary, #009b71);
  box-shadow: 0 0 0 2px rgba(0, 155, 113, 0.1);
}

.page-size-select__value {
  font-weight: 500;
}

.page-size-select__arrow {
  width: 16px;
  height: 16px;
  min-width: 16px;
  min-height: 16px;
  mask-position: -202px -18px;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
  background-color: #4b5563;
  transition: transform 0.2s;
}

.page-size-select__arrow--open {
  transform: rotate(180deg);
}
</style>

<style>
/* Dropdown teleport - global */
.page-size-select__dropdown {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  min-width: 80px;
}

.page-size-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 12px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.1s;
  gap: 15px;
}

.page-size-select__option:hover {
  background-color: #f3f4f6;
}

.page-size-select__option--selected {
  background-color: #e0f7ef;
  color: var(--primary, #009b71);
  font-weight: 500;
}

.page-size-select__option--selected:hover {
  background-color: #d0f0e5;
}

.page-size-select__check {
  display: inline-block;
  width: 12px;
  height: 7px;
  border-left: 2px solid var(--primary, #009b71);
  border-bottom: 2px solid var(--primary, #009b71);
  transform: rotate(-45deg);
  flex-shrink: 0;
}
</style>
