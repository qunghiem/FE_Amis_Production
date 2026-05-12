<!-- popup xác nhận xóa -->


<template>
  <MsModal
    v-model="localVisible"
    :title="title"
    width="420px"
    :close-on-overlay="true"
    @update:modelValue="(v) => !v && $emit('cancel')"
  >
    <div class="confirm-modal__body">
      <div class="confirm-modal__icon" :class="`confirm-modal__icon--${type}`">
        <i :class="iconClass"></i>
      </div>
      <p class="confirm-modal__message">{{ message }}</p>
    </div>

    <template #footer>
      <MsButton type="cancel" @click="$emit('cancel')">{{ cancelText }}</MsButton>
      <MsButton :type="confirmBtnType" @click="$emit('confirm')">{{ confirmText }}</MsButton>
    </template>
  </MsModal>
</template>

<script setup>
import { computed } from 'vue'
import MsModal from './ms-modal/MsModal.vue'
import MsButton from './ms-button/MsButton.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: 'Xác nhận' },
  message: { type: String, default: 'Bạn có chắc muốn thực hiện thao tác này?' },
  type: { type: String, default: 'danger' },
  confirmText: { type: String, default: 'Xác nhận' },
  cancelText: { type: String, default: 'Huỷ' },
})

defineEmits(['confirm', 'cancel'])

const localVisible = computed(() => props.visible)

const iconClass = computed(() => {
  const map = {
    danger: 'fa-solid fa-triangle-exclamation',
    warning: 'fa-solid fa-circle-exclamation',
    info: 'fa-solid fa-circle-info',
  }
  return map[props.type] ?? map.danger
})

const confirmBtnType = computed(() => props.type === 'danger' ? 'danger-confirm' : 'save')
</script>

<style scoped>
.confirm-modal__body {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 8px 0 4px; text-align: center;
}
.confirm-modal__icon {
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.confirm-modal__icon--danger { background-color: #fef2f2; color: #dc2626; }
.confirm-modal__icon--warning { background-color: #fffbeb; color: #d97706; }
.confirm-modal__icon--info { background-color: #eff6ff; color: #2563eb; }
.confirm-modal__message {
  font-size: 14px; color: #374151; line-height: 1.6; max-width: 320px;
}
</style>
