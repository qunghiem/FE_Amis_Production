<!-- hiển thị toast -->

<template>
  <teleport to="body">
    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`">
          <!-- Icon -->
          <span v-if="toast.type === 'loading'" class="toast-spinner"></span>
          <span v-else class="toast-icon" :class="`toast-icon--${toast.type}`"></span>

          <!-- Message -->
          <span class="toast-msg">{{ toast.message }}</span>

          <!-- Nút đóng -->
          <button class="toast-close" @click="remove(toast.id)">&times;</button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
const { toasts, remove } = useToast()
</script>

<style scoped>
/* ===== CONTAINER — top center ===== */
.toast-container {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* ===== TOAST ===== */
.toast {
  min-width: 300px;
  max-width: 500px;
  padding: 12px 16px;
  border-radius: 6px;
  background: #fff;
  color: #111827;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border-left: 4px solid #d1d5db;
}

/* Viền trái theo loại */
.toast--success { border-left-color: #009b71; }
.toast--error   { border-left-color: #dc2626; }
.toast--loading { border-left-color: #2563eb; }
.toast--warning { border-left-color: #d97706; }

/* ===== ICON ===== */
.toast-icon {
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* SVG check bằng CSS */
.toast-icon--success {
  background-color: #009b71;
  position: relative;
}
.toast-icon--success::after {
  content: '';
  width: 10px;
  height: 5px;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(-45deg);
  position: absolute;
  top: 5px;
}

.toast-icon--error {
  background-color: #dc2626;
  position: relative;
}
.toast-icon--error::after {
  content: '✕';
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.toast-icon--warning {
  background-color: #d97706;
  position: relative;
}
.toast-icon--warning::after {
  content: '!';
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

/* ===== MESSAGE ===== */
.toast-msg {
  flex: 1;
  line-height: 1.4;
}

/* ===== NÚT ĐÓNG ===== */
.toast-close {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 18px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.15s;
}
.toast-close:hover {
  color: #111827;
}

/* ===== SPINNER (loading) ===== */
.toast-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #93c5fd;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== TRANSITION ===== */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
