<!-- button tái sử dụng -->


<template>
  <button :class="btnClass" :disabled="disabled || loading" v-bind="$attrs">
    <span v-if="loading" class="ms-btn__spinner"></span>
    <i v-if="icon && positionIcon === 'left' && !loading" :class="['ms-btn__icon', icon]"></i>
    <span class="ms-btn__content"><slot></slot></span>
    <i v-if="icon && positionIcon === 'right' && !loading" :class="['ms-btn__icon', icon]"></i>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'primary' },
  icon: { type: String, default: null },
  positionIcon: { type: String, default: 'left' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const btnClass = computed(() => [
  'ms-btn',
  `ms-btn--${props.type}`,
  `ms-btn--${props.size}`,
  { 'ms-btn--loading': props.loading },
])
</script>

<style scoped>
.ms-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.15s, background-color 0.15s, border-color 0.15s;
  user-select: none;
  gap: 6px;
}
.ms-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

/* Sizes */
/* .ms-btn--small { font-size: 13px; padding: 0 10px; height: 30px; }
.ms-btn--medium { font-size: 14px; padding: 6px 16px; height: 36px; }
.ms-btn--large { font-size: 14px; padding: 8px 20px; height: 40px; } */

/* Types */
.ms-btn--primary {
  background-color: var(--primary);
  color: #fff;
  border: none;
}
.ms-btn--primary:hover:not(:disabled) { background-color: var(--primary-hover); }

.ms-btn--outline {
  background-color: #fff;
  color: var(--text-main);
  border: 1px solid var(--border-color);
}
.ms-btn--outline:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }

.ms-btn--danger-outline {
  background-color: #fff;
  color: #dc2626;
  border: 1px solid #dc2626;
}
.ms-btn--danger-outline:hover:not(:disabled) { background-color: #dc2626; color: #fff; }

.ms-btn--save {
  background-color: var(--primary);
  color: #fff;
  border: none;
  font-size: 14px;
  padding: 8px 20px;
  height: auto;
}
.ms-btn--save:hover:not(:disabled) { background-color: var(--primary-hover); }

.ms-btn--cancel {
  background-color: transparent;
  color: #374151;
  border: 1px solid var(--border-color);
  font-size: 14px;
  padding: 8px 16px;
  height: auto;
}
.ms-btn--cancel:hover:not(:disabled) { background-color: #f3f4f6; }

.ms-btn--danger-confirm {
  background-color: #dc2626;
  color: #fff;
  border: none;
}
.ms-btn--danger-confirm:hover:not(:disabled) { background-color: #b91c1c; }

.ms-btn--text {
  background: none;
  color: var(--primary);
  border: none;
  padding: 0;
  font-weight: 400;
}
.ms-btn--text:hover:not(:disabled) { text-decoration: underline; }

.ms-btn--icon-only {
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  position: relative;
}
.ms-btn--icon-only:hover:not(:disabled) { color: var(--primary); background-color: #f3f4f6; border-radius: 4px; }

.btn-icon-edit {
  mask-position: -271px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}

.btn-icon-more {
      mask-position: -288px 0px;
  -webkit-mask-image: url(hhttps://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.ms-btn--icon-danger {
  background: none;
  border: none;
  color: #dc2626;
  padding: 4px;
  height: auto;
  width: 28px;
  min-width: 28px;
}
.ms-btn--icon-danger:hover:not(:disabled) { color: #fff; background-color: #dc2626; border-radius: 4px; }

/* Disabled & Loading */
.ms-btn:disabled { opacity: 0.45; cursor: not-allowed; pointer-events: none; }
.ms-btn--loading { cursor: not-allowed; pointer-events: none; opacity: 0.75; }

.ms-btn__spinner {
  width: 13px; height: 13px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: ms-spin 0.65s linear infinite;
}
@keyframes ms-spin { to { transform: rotate(360deg); } }

.ms-btn__icon { display: inline-flex; align-items: center; font-size: 14px; }
.ms-btn__content { display: inline-flex; align-items: center; }
</style>
