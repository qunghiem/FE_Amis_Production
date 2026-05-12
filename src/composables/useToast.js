// toast notification

import { ref } from 'vue'

const toasts = ref([])
let idCounter = 0

export function useToast() {
  function show(message, type = 'success', duration = 3000) {
    const id = ++idCounter
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  function remove(id) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function success(msg) { return show(msg, 'success') }
  function error(msg) { return show(msg, 'error') }
  function loading(msg) { return show(msg, 'loading', 0) }
  function warning(msg) { return show(msg, 'warning') }

  function update(id, msg, type, duration = 3000) {
    const t = toasts.value.find((t) => t.id === id)
    if (t) { t.message = msg; t.type = type }
    if (duration > 0) setTimeout(() => remove(id), duration)
  }

  return { toasts, show, remove, success, error, loading, warning, update }
}
