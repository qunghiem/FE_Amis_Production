<!-- input tái sử dụng -->

<template>
  <div class="ms-input__wrapper">
    <!-- Label -->
    <label v-if="label" class="ms-input__label">
      {{ label }}
      <span v-if="required" class="ms-input__require">*</span>
    </label>

    <!-- // Control -->
    <div class="ms-input__control">
      <!-- Select -->
      <select
        ref="fieldRef"
        v-if="type === 'select'"
        v-model="model"
        :class="['ms-input__field', { 'ms-input--invalid': error }]"
        v-bind="$attrs"
        @blur="emit('blur', $event)"
      >
        <slot></slot>
      </select>

      <!-- Textarea -->
      <textarea
        ref="fieldRef"
        v-else-if="type === 'textarea'"
        v-model="model"
        :placeholder="placeholder"
        :class="['ms-input__field', 'ms-input__textarea', { 'ms-input--invalid': error }]"
        v-bind="$attrs"
        @blur="emit('blur', $event)"
      ></textarea>

      <!-- Input -->
      <input
        ref="fieldRef"
        v-else
        v-model="model"
        :placeholder="placeholder"
        :class="['ms-input__field', { 'ms-input--invalid': error }]"
        v-bind="$attrs"
        :type="type"
        @blur="emit('blur', $event)"
      />
    </div>

    <div v-if="error" class="ms-input__error">{{ error }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number], default: '' }, // Giá trị của input, dùng v-model để bind dữ liệu 2 chiều
  type: { type: String, default: 'text' }, // 'text', 'textarea', 'select', 'number', 'password'
  label: { type: String, default: '' }, // Nhãn hiển thị trên input
  placeholder: { type: String, default: '' }, // Placeholder khi chưa nhập gì
  required: { type: Boolean, default: false }, // Cho phép input là bắt buộc
  error: { type: String, default: '' }, // Thông báo lỗi, nếu có thì sẽ hiển thị và input sẽ có viền đỏ
})

const emit = defineEmits(['update:modelValue', 'blur'])

// Tạo computed property để dễ dàng sử dụng v-model
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// tạo ref để có thể focus vào input khi cần thiết, đồng thời expose method focus ra bên ngoài để component cha có thể gọi được (ví dụ: focus vào input khi mở modal)
const fieldRef = ref(null)
// expose method focus để component cha có thể gọi được, ví dụ: focus vào input khi mở modal
defineExpose({ focus: () => fieldRef.value?.focus() })
</script>

<style scoped>
.ms-input__wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ms-input__label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}
.ms-input__require {
  color: #dc2626;
}

.ms-input__field {
  width: 100%;
  height: 28px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 13px;
  color: #1f2937;
  background-color: #fff;
  outline: none;
  font-family: inherit;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.ms-input__field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 155, 113, 0.1);
}
.ms-input__field::placeholder {
  color: #9ca3af;
}

.ms-input__textarea {
  height: 80px;
  padding: 8px 10px;
  resize: vertical;
}

.ms-input--invalid {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15) !important;
}
.ms-input__error {
  font-size: 12px;
  color: #dc2626;
  min-height: 16px;
}
</style>
