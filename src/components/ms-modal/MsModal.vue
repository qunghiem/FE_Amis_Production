<!-- modal tái sử dụng: thêm/ sửa/ nhân bản -->

<template>
  <teleport to="body">
    <div v-if="modelValue" class="ms-modal__overlay" @click.self="onOverlayClick">
      <div class="ms-modal__container" :style="{ width }">
        <!-- Header -->
        <div class="ms-modal__header">
          <slot name="header">
            <span class="ms-modal__title">{{ title }}</span>
          </slot>
          <button class="ms-modal__close" @click="$emit('update:modelValue', false)">
          </button>
        </div>

        <!-- Body -->
        <div class="ms-modal__body">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="ms-modal__footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
const props = defineProps({
  // Giá trị boolean để điều khiển hiển thị modal, dùng v-model để bind dữ liệu 2 chiều
  modelValue: { type: Boolean, default: false },
  width: { type: String, default: '600px' },
  closeOnOverlay: { type: Boolean, default: true },// Có cho phép đóng modal khi click vào overlay hay không
  title: { type: String, default: '' }, // Thêm/Sửa/ Nhân bản
})

const emit = defineEmits(['update:modelValue'])

//
function onOverlayClick() {
  if (props.closeOnOverlay) emit('update:modelValue', false)
}
</script>

<style scoped>
.ms-modal__overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ms-modal__container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  width: 680px !important;
}
.ms-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  flex-shrink: 0;
}
.ms-modal__title {
  font-weight: 700;
  font-size: 24px;
  color: #111827;
}
.ms-modal__close {
    border: none;
    cursor: pointer;
    padding: 4px;
    color: #6b7280;
    display: flex;
    align-items: center;
    border-radius: 4px;
    transition: background 0.15s, color 0.15s;
    height: 20px;
    width: 20px;
    min-height: 20px;
    min-width: 20px;
    position: relative;
    mask-position: -299px -16px;
    -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
    -webkit-mask-repeat: no-repeat;
    background-color: #4b5563;
}
.ms-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.ms-modal__footer {
  padding: 12px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background: #f9fafb;
  flex-shrink: 0;
  align-items: center;
}

.ms-modal__footer .ms-btn__content {
  color: #111827 !important;
}
</style>
