<!-- input tái sử dụng -->

<template>
  <div class="ms-input__wrapper">
    <label v-if="label" class="ms-input__label">
      {{ label }}
      <span v-if="required" class="ms-input__require">*</span>
    </label>

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
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'blur'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const fieldRef = ref(null)
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
.ms-input__require { color: #dc2626; }

.ms-input__field {
  width: 100%;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 13px;
  color: #1f2937;
  background-color: #fff;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.ms-input__field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 155, 113, 0.1);
}
.ms-input__field::placeholder { color: #9ca3af; }

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
