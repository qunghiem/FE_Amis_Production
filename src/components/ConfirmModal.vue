<!-- popup xác nhận xóa -->

<template>
  <MsModal
    v-model="localVisible"
    :title="''"
    width="420px"
    :close-on-overlay="true"
    @update:modelValue="(v) => !v && $emit('cancel')"
  >
    <!-- Header custom: icon + title -->
    <template #header>
      <div class="confirm-modal__header">
        <div class="confirm-modal__icon" :class="`confirm-modal__icon--${type}`">
          <i :class="iconClass"></i>
        </div>
        <span class="confirm-modal__title">{{ displayTitle }}</span>
      </div>
    </template>

    <!-- Body -->
    <div class="confirm-modal__body">
      <p class="confirm-modal__message" v-html="displayMessage"></p>
    </div>

    <template #footer>
      <MsButton type="cancel" @click="$emit('cancel')">{{ displayCancelText }}</MsButton>
      <MsButton :type="confirmBtnType" @click="$emit('confirm')">{{ displayConfirmText }}</MsButton>
    </template>
  </MsModal>
</template>

<script setup>
import { computed } from 'vue'
import MsModal from './ms-modal/MsModal.vue'
import MsButton from './ms-button/MsButton.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  type: { type: String, default: 'danger' },
  confirmText: { type: String, default: '' },
  cancelText: { type: String, default: '' },
})

const displayTitle = computed(() => props.title || t('common.confirm'))
const displayMessage = computed(() => props.message || t('common.confirmDefaultMessage'))
const displayConfirmText = computed(() => props.confirmText || t('common.confirm'))
const displayCancelText = computed(() => props.cancelText || t('common.cancel'))

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

const confirmBtnType = computed(() => (props.type === 'danger' ? 'danger-confirm' : 'save'))
</script>

<style scoped>
.confirm-modal__header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.confirm-modal__icon {
  width: 16px;
  height: 14px;
  background-color: #ea580c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.confirm-modal__icon--danger {
  mask-position: -188px -169px;
  background: url(https://demoqtsxcdn.misacdn.net/assets/pas.ic_warning-10482646.svg?v=10.0.0.36);
}
.confirm-modal__icon--warning {
  color: #d97706;
}
.confirm-modal__icon--info {
  color: #2563eb;
}
.confirm-modal__title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}
.confirm-modal__body {
  padding: 0 0 4px;
}
.confirm-modal__message {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}
</style>
