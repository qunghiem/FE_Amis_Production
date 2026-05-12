<!-- form thêm/sửa/nhân bản ca làm việc -->

<template>
  <MsModal
    v-model="localVisible"
    :title="formTitle"
    width="650px"
    :close-on-overlay="false"
    @update:modelValue="(v) => !v && $emit('close')"
  >
    <div class="shift-form">
      <!-- Mã ca + Tên ca -->
      <div class="shift-form__row">
        <MsInput
          ref="codeRef"
          label="Mã ca"
          placeholder="Nhập mã ca"
          v-model="form.productionShiftCode"
          :required="true"
          :error="errors.productionShiftCode"
          maxlength="20"
          @blur="validateField('productionShiftCode')"
        />
        <MsInput
          ref="nameRef"
          label="Tên ca"
          placeholder="Nhập tên ca"
          v-model="form.productionShiftName"
          :required="true"
          :error="errors.productionShiftName"
          maxlength="50"
          @blur="validateField('productionShiftName')"
        />
      </div>

      <!-- Giờ vào ca + Giờ hết ca -->
      <div class="shift-form__row">
        <MsInput
          ref="startRef"
          label="Giờ vào ca"
          type="time"
          v-model="form.startTime"
          :required="true"
          :error="errors.startTime"
          @blur="validateField('startTime')"
        />
        <MsInput
          ref="endRef"
          label="Giờ hết ca"
          type="time"
          v-model="form.endTime"
          :required="true"
          :error="errors.endTime"
          @blur="validateField('endTime')"
        />
      </div>

      <!-- Bắt đầu nghỉ giữa ca + Kết thúc nghỉ giữa ca -->
      <div class="shift-form__row">
        <MsInput
          label="Bắt đầu nghỉ giữa ca"
          type="time"
          v-model="form.breakStartTime"
        />
        <MsInput
          label="Kết thúc nghỉ giữa ca"
          type="time"
          v-model="form.breakEndTime"
        />
      </div>

      <!-- Thời gian làm việc + Thời gian nghỉ (readonly, tự tính) -->
      <div class="shift-form__row">
        <div class="shift-form__computed">
          <label class="ms-input__label">Thời gian làm việc (giờ)</label>
          <div class="shift-form__computed-value">{{ computedWorkHour }}</div>
        </div>
        <div class="shift-form__computed">
          <label class="ms-input__label">Thời gian nghỉ giữa ca (giờ)</label>
          <div class="shift-form__computed-value">{{ computedBreakHour }}</div>
        </div>
      </div>

      <!-- Mô tả -->
      <MsInput
        label="Mô tả"
        type="textarea"
        placeholder="Nhập mô tả"
        v-model="form.description"
      />
    </div>

    <template #footer>
      <MsButton type="cancel" @click="$emit('close')">Huỷ</MsButton>
      <MsButton type="save" :loading="saving" @click="handleSave">Cất</MsButton>
    </template>
  </MsModal>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import MsModal from './ms-modal/MsModal.vue'
import MsButton from './ms-button/MsButton.vue'
import MsInput from './ms-input/MsInput.vue'

const props = defineProps({
  visible: Boolean,
  editingShift: Object, // null = thêm mới, object = sửa/nhân bản
})

const emit = defineEmits(['close', 'saved'])

const localVisible = computed(() => props.visible)
const saving = ref(false)

const formTitle = computed(() => {
  if (!props.editingShift) return 'Thêm ca làm việc'
  // Nếu editingShift không có ID → nhân bản
  if (!props.editingShift.productionShiftID) return 'Nhân bản ca làm việc'
  return 'Sửa ca làm việc'
})

// Form data
const EMPTY_FORM = () => ({
  productionShiftID: null,
  productionShiftCode: '',
  productionShiftName: '',
  startTime: '',
  endTime: '',
  breakStartTime: '',
  breakEndTime: '',
  description: '',
  shiftStatus: 1,
})

const form = ref(EMPTY_FORM())
const errors = ref({})

// Refs cho validate focus
const codeRef = ref(null)
const nameRef = ref(null)
const startRef = ref(null)
const endRef = ref(null)

const fieldRefMap = {
  productionShiftCode: codeRef,
  productionShiftName: nameRef,
  startTime: startRef,
  endTime: endRef,
}

// Tự tính thời gian làm việc và thời gian nghỉ
const computedBreakHour = computed(() => {
  if (!form.value.breakStartTime || !form.value.breakEndTime) return 0
  let diff = timeToMinutes(form.value.breakEndTime) - timeToMinutes(form.value.breakStartTime)
  if (diff <= 0) diff += 24 * 60
  return +(diff / 60).toFixed(2)
})

const computedWorkHour = computed(() => {
  if (!form.value.startTime || !form.value.endTime) return 0
  let totalMinutes = timeToMinutes(form.value.endTime) - timeToMinutes(form.value.startTime)
  if (totalMinutes <= 0) totalMinutes += 24 * 60
  const workMinutes = totalMinutes - computedBreakHour.value * 60
  return +(workMinutes / 60).toFixed(2)
})

function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const parts = timeStr.split(':')
  return parseInt(parts[0]) * 60 + parseInt(parts[1])
}

/**
 * Format "01:00:00" → "01:00" cho input type=time
 */
function formatTimeForInput(ts) {
  if (!ts) return ''
  const parts = ts.split(':')
  return `${parts[0]}:${parts[1]}`
}

// Watch visible để reset/fill form
watch(
  () => props.visible,
  (v) => {
    if (!v) return
    errors.value = {}
    saving.value = false

    if (props.editingShift) {
      form.value = {
        productionShiftID: props.editingShift.productionShiftID || null,
        productionShiftCode: props.editingShift.productionShiftCode || '',
        productionShiftName: props.editingShift.productionShiftName || '',
        startTime: formatTimeForInput(props.editingShift.startTime),
        endTime: formatTimeForInput(props.editingShift.endTime),
        breakStartTime: formatTimeForInput(props.editingShift.breakStartTime),
        breakEndTime: formatTimeForInput(props.editingShift.breakEndTime),
        description: props.editingShift.description || '',
        shiftStatus: props.editingShift.shiftStatus ?? 1,
      }
    } else {
      form.value = EMPTY_FORM()
    }
  },
)

// Xóa lỗi khi người dùng sửa
watch(() => form.value.productionShiftCode, (v) => { if (v?.trim()) errors.value.productionShiftCode = '' })
watch(() => form.value.productionShiftName, (v) => { if (v?.trim()) errors.value.productionShiftName = '' })
watch(() => form.value.startTime, (v) => { if (v) errors.value.startTime = '' })
watch(() => form.value.endTime, (v) => { if (v) errors.value.endTime = '' })

// Validate
function validateField(field) {
  switch (field) {
    case 'productionShiftCode':
      if (!form.value.productionShiftCode?.trim()) errors.value.productionShiftCode = 'Mã ca không được để trống'
      else if (form.value.productionShiftCode.length > 20) errors.value.productionShiftCode = 'Mã ca tối đa 20 ký tự'
      else errors.value.productionShiftCode = ''
      break
    case 'productionShiftName':
      if (!form.value.productionShiftName?.trim()) errors.value.productionShiftName = 'Tên ca không được để trống'
      else if (form.value.productionShiftName.length > 50) errors.value.productionShiftName = 'Tên ca tối đa 50 ký tự'
      else errors.value.productionShiftName = ''
      break
    case 'startTime':
      errors.value.startTime = form.value.startTime ? '' : 'Giờ vào ca không được để trống'
      break
    case 'endTime':
      errors.value.endTime = form.value.endTime ? '' : 'Giờ hết ca không được để trống'
      break
  }
}

function validate() {
  ;['productionShiftCode', 'productionShiftName', 'startTime', 'endTime'].forEach(validateField)
  return Object.values(errors.value).every((e) => !e)
}

async function handleSave() {
  if (!validate()) {
    const ORDER = ['productionShiftCode', 'productionShiftName', 'startTime', 'endTime']
    const firstKey = ORDER.find((k) => errors.value[k])
    if (firstKey) nextTick(() => fieldRefMap[firstKey]?.value?.focus())
    return
  }
  if (saving.value) return
  saving.value = true

  emit('saved', {
    ...form.value,
    workHour: computedWorkHour.value,
    breakHour: computedBreakHour.value,
  })
}
</script>

<style scoped>
.shift-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.shift-form__row {
  display: flex;
  gap: 16px;
}
.shift-form__row > * {
  flex: 1;
}
.shift-form__computed {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.shift-form__computed-value {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
}
</style>
