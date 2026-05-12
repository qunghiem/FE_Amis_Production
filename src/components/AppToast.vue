<!-- hiển thị toast -->

<template>
  <teleport to="body">
    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`">
          <span v-if="toast.type === 'loading'" class="toast-spinner"></span>
          <span v-else-if="toast.type === 'success'">✅</span>
          <span v-else-if="toast.type === 'warning'">⚠️</span>
          <span v-else>❌</span>
          {{ toast.message }}
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toast {
  min-width: 260px;
  padding: 12px 18px;
  border-radius: 8px;
  background: #1e2633;
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
.toast--success { background: #166534; }
.toast--error { background: #991b1b; }
.toast--loading { background: #1e40af; }
.toast--warning { background: #92400e; }

.toast-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(16px); }
.toast-leave-to { opacity: 0; transform: translateX(40px); }
</style>
