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
      <!-- Mã ca — full width -->
      <div class="sf-row sf-row--full">
        <label class="sf-label"> Mã ca <span class="sf-required">*</span> </label>
        <div
  class="sf-control"
  :data-error-tooltip="errors.productionShiftCode || undefined"
>
  <input
    ref="codeRef"
    class="sf-input"
    :class="{ 'sf-input--invalid': errors.productionShiftCode }"
    v-model="form.productionShiftCode"
    maxlength="20"
    @blur="validateField('productionShiftCode')"
  />
</div>
      </div>

      <!-- Tên ca — full width -->
      <div class="sf-row sf-row--full">
        <label class="sf-label"> Tên ca <span class="sf-required">*</span> </label>
        <div
  class="sf-control"
  :data-error-tooltip="errors.productionShiftName || undefined"
>
  <input
    ref="nameRef"
    class="sf-input"
    :class="{ 'sf-input--invalid': errors.productionShiftName }"
    v-model="form.productionShiftName"
    maxlength="50"
    @blur="validateField('productionShiftName')"
  />
</div>
      </div>

      <!-- Giờ vào ca + Giờ hết ca -->
      <div class="sf-row sf-row--half">
        <label class="sf-label"> Giờ vào ca <span class="sf-required">*</span> </label>
        <div
  class="sf-control"
  :data-error-tooltip="errors.startTime || undefined"
>
  <MsTimePicker
    ref="startRef"
    v-model="form.startTime"
    :error="errors.startTime"
    @blur="validateField('startTime')"
  />
</div>

        <label class="sf-label"> Giờ hết ca <span class="sf-required">*</span> </label>
        <div
  class="sf-control"
  :data-error-tooltip="errors.endTime || undefined"
>
  <MsTimePicker
    ref="endRef"
    v-model="form.endTime"
    :error="errors.endTime"
    @blur="validateField('endTime')"
  />
</div>
      </div>

      <!-- Bắt đầu nghỉ + Kết thúc nghỉ -->
      <div class="sf-row sf-row--half">
        <label class="sf-label">Bắt đầu nghỉ giữa ca</label>
        <div
  class="sf-control"
  :data-error-tooltip="errors.breakStartTime || undefined"
>
  <MsTimePicker v-model="form.breakStartTime" :error="errors.breakStartTime" />
</div>
        <label class="sf-label">Kết thúc nghỉ giữa ca</label>
        <div
  class="sf-control"
  :data-error-tooltip="errors.breakEndTime || undefined"
>
  <MsTimePicker v-model="form.breakEndTime" :error="errors.breakEndTime" />
</div>
      </div>

      <!-- Thời gian làm việc + Thời gian nghỉ -->
      <div class="sf-row sf-row--half">
        <label class="sf-label">Thời gian làm việc (giờ)</label>
        <div class="sf-control">
          <div class="sf-readonly">{{ computedWorkHour }}</div>
        </div>

        <label class="sf-label">Thời gian nghỉ giữa ca (giờ)</label>
        <div class="sf-control">
          <div class="sf-readonly">{{ computedBreakHour }}</div>
        </div>
      </div>

      <!-- Mô tả — full width -->
      <div class="sf-row sf-row--full">
        <label class="sf-label sf-label--top">Mô tả</label>
        <div class="sf-control">
          <textarea
            class="sf-input sf-textarea"
            v-model="form.description"
            placeholder="Nhập mô tả"
          ></textarea>
        </div>
      </div>

      <!-- Trạng thái — chỉ hiển thị khi Sửa -->
      <div v-if="isEditing" class="sf-row sf-row--full">
        <label class="sf-label">Trạng thái</label>
        <div class="sf-control sf-radio-group">
          <label class="sf-radio">
            <input type="radio" v-model="form.shiftStatus" :value="1" />
            <span class="sf-radio__dot"></span>
            Đang sử dụng
          </label>
          <label class="sf-radio">
            <input type="radio" v-model="form.shiftStatus" :value="0" />
            <span class="sf-radio__dot"></span>
            Ngừng sử dụng
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <MsButton type="cancel" @click="$emit('close')">Huỷ</MsButton>
      <MsButton type="save-and-add" :loading="saving" @click="handleSaveAndAdd">
        Lưu và Thêm
      </MsButton>
      <MsButton type="save" :loading="saving" @click="handleSave">Lưu</MsButton>
    </template>
  </MsModal>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import MsModal from './ms-modal/MsModal.vue'
import MsButton from './ms-button/MsButton.vue'
import MsTimePicker from './ms-time-picker/MsTimePicker.vue'

const props = defineProps({
  visible: Boolean,
  editingShift: Object,
})

const emit = defineEmits(['close', 'saved'])

const localVisible = computed(() => props.visible)
const saving = ref(false)

/** true khi đang sửa bản ghi đã tồn tại (có productionShiftID) */
const isEditing = computed(() => !!props.editingShift?.productionShiftID)

// Tính tiêu đề form dựa vào trạng thái: Thêm mới, Sửa, Nhân bản
const formTitle = computed(() => {
  if (!props.editingShift) return 'Thêm Ca làm việc'
  if (!props.editingShift.productionShiftID) return 'Nhân bản Ca làm việc'
  return 'Sửa Ca làm việc'
})

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
  createdDate: null,
  createdBy: null,
})

const ERROR_FIELD_MAP = [
  { keywords: ['Mã ca'], field: 'productionShiftCode' },
  { keywords: ['Tên ca'], field: 'productionShiftName' },
  { keywords: ['Giờ vào ca'], field: 'startTime' },
  { keywords: ['Giờ hết ca'], field: 'endTime' },
  { keywords: ['Giờ bắt đầu nghỉ', 'Bắt đầu nghỉ'], field: 'breakStartTime' },
  { keywords: ['Giờ kết thúc nghỉ', 'Kết thúc nghỉ'], field: 'breakEndTime' },
]

const form = ref(EMPTY_FORM())
const errors = ref({})

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

function formatTimeForInput(ts) {
  if (!ts) return ''
  const parts = ts.split(':')
  return `${parts[0]}:${parts[1]}`
}
// watch để reset form mỗi khi mở modal, nếu props.editingShift có dữ liệu thì set form bằng dữ liệu đó để phục vụ cho sửa hoặc nhân bản, nếu không có thì set form về trạng thái trống để phục vụ cho thêm mới
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
        createdDate: props.editingShift.createdDate || null,
        createdBy: props.editingShift.createdBy || null,
      }
    } else {
      form.value = EMPTY_FORM()
    }
  },
)

watch(
  () => form.value.productionShiftCode,
  (v) => {
    if (v?.trim()) errors.value.productionShiftCode = ''
  },
)
watch(
  () => form.value.productionShiftName,
  (v) => {
    if (v?.trim()) errors.value.productionShiftName = ''
  },
)
watch(
  () => form.value.startTime,
  (v) => {
    if (v) errors.value.startTime = ''
  },
)
watch(
  () => form.value.endTime,
  (v) => {
    if (v) errors.value.endTime = ''
  },
)

// Hàm validate từng field, nhận vào tên field để validate tương ứng, nếu có lỗi thì gán message vào errors, nếu hợp lệ thì xóa lỗi
function validateField(field) {
  switch (field) {
    case 'productionShiftCode':
      if (!form.value.productionShiftCode?.trim())
        errors.value.productionShiftCode = 'Mã ca không được để trống'
      else if (form.value.productionShiftCode.length > 20)
        errors.value.productionShiftCode = 'Mã ca tối đa 20 ký tự'
      else errors.value.productionShiftCode = ''
      break
    case 'productionShiftName':
      if (!form.value.productionShiftName?.trim())
        errors.value.productionShiftName = 'Tên ca không được để trống'
      else if (form.value.productionShiftName.length > 50)
        errors.value.productionShiftName = 'Tên ca tối đa 50 ký tự'
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

// Hàm validate toàn bộ form, trả về true nếu hợp lệ, false nếu có lỗi
function validate() {
  ;['productionShiftCode', 'productionShiftName', 'startTime', 'endTime'].forEach(validateField)
  return Object.values(errors.value).every((e) => !e)
}

// Hàm focus vào field đầu tiên có lỗi để người dùng dễ dàng sửa
function focusFirstError() {
  const ORDER = ['productionShiftCode', 'productionShiftName', 'startTime', 'endTime']
  const firstKey = ORDER.find((k) => errors.value[k])
  if (firstKey) {
    nextTick(() => {
      const refEl = fieldRefMap[firstKey]?.value
      if (refEl?.focus) refEl.focus()
    })
  }
}

// Hàm xử lý khi click Lưu: validate form, nếu hợp lệ thì emit sự kiện 'saved' với payload là dữ liệu form + computed workHour và breakHour

async function handleSave() {
  // Validate form, nếu có lỗi thì focus vào field đầu tiên có lỗi và không tiếp tục
  if (!validate()) {
    focusFirstError()
    return
  }
  // Nếu đang ở trạng thái saving thì không cho phép click lưu nữa để tránh gửi nhiều request
  if (saving.value) return
  saving.value = true
  emit('saved', {
    ...form.value,
    workHour: computedWorkHour.value,
    breakHour: computedBreakHour.value,
    _action: 'save',
  })
}
// Hàm xử lý khi click Lưu và Thêm: tương tự handleSave nhưng có thêm _action: 'save-and-add' để parent biết là sau khi lưu xong thì sẽ mở form mới để thêm tiếp, đồng thời parent sẽ gọi resetForm() để reset form về trạng thái trống
async function handleSaveAndAdd() {
  if (!validate()) {
    focusFirstError()
    return
  }
  if (saving.value) return
  saving.value = true
  emit('saved', {
    ...form.value,
    workHour: computedWorkHour.value,
    breakHour: computedBreakHour.value,
    _action: 'save-and-add',
  })
}

/**
 * Nhận list lỗi từ backend, map vào errors reactive để hiển thị trên form
 * Lỗi nào không map được field → trả về để parent hiện toast
 */
function setServerErrors(serverErrors) {
  saving.value = false
  const unmapped = []

  for (const msg of serverErrors) {
    let matched = false
    for (const rule of ERROR_FIELD_MAP) {
      if (rule.keywords.some((kw) => msg.includes(kw))) {
        errors.value[rule.field] = msg
        matched = true
        break
      }
    }
    if (!matched) unmapped.push(msg)
  }

  // Focus vào field lỗi đầu tiên
  focusFirstError()

  return unmapped // trả về lỗi không map được để parent show toast
}

/** Reset form về trạng thái trống (dùng cho Lưu và Thêm) */
function resetSaving() {
  saving.value = false
}

function resetForm() {
  form.value = EMPTY_FORM()
  errors.value = {}
  saving.value = false
}

defineExpose({ setServerErrors, resetSaving, resetForm })
</script>

<style scoped>
.shift-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== ROW — CSS Grid đều 2 bên ===== */
.sf-row {
  display: grid;
  align-items: start;
  column-gap: 23px;
  row-gap: 4px;
  white-space: nowrap;
  overflow: visible;       /* ← cho tooltip hiện ra */
}

/* Full-width: label trái + input kéo hết phải */
.sf-row--full {
  grid-template-columns: 150px 1fr;
}

/* Chia đôi đều: [label1][input1] [label2][input2]
   Dùng tỉ lệ cố định để 2 bên hoàn toàn đối xứng */
.sf-row--half {
  grid-template-columns: 150px 1fr 175px 1fr;
}

/* ===== LABEL ===== */
.sf-label {
  font-size: 13px;
  color: #262626;
  font-weight: 510;
  line-height: 28px;
}

.sf-label--top {
  line-height: 1.3;
  padding-top: 8px;
}

.sf-required {
  color: #dc2626;
}

/* ===== CONTROL ===== */
.sf-control {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ===== INPUT ===== */
.sf-input {
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

.sf-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 155, 113, 0.1);
}

.sf-input::placeholder {
  color: #9ca3af;
}

.sf-input--invalid {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15) !important;
}

.sf-textarea {
  height: 68px;
  padding: 8px 10px;
  resize: vertical;
  border: 1px solid #d5dfe2;
}

.sf-readonly {
  height: 28px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
  max-width: 122px;
  justify-content: end;
}

/* ===== RADIO GROUP — Trạng thái ===== */
.sf-radio-group {
  flex-direction: row;
  align-items: center;
  gap: 24px;
  height: 28px;
}

.sf-radio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #262626;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.sf-radio input[type='radio'] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.sf-radio__dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.15s;
}

.sf-radio__dot::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
  transition: background 0.15s;
}

.sf-radio input[type='radio']:checked + .sf-radio__dot {
  border-color: #009b71;
}

.sf-radio input[type='radio']:checked + .sf-radio__dot::after {
  background: #009b71;
}

/* ===== ERROR TOOLTIP ===== */
/* ===== ERROR TOOLTIP (giống [data-tooltip] của header) ===== */
.sf-control[data-error-tooltip] {
  position: relative;
}

/* Nội dung tooltip */
.sf-control[data-error-tooltip]::after {
  content: attr(data-error-tooltip);
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);

  padding: 6px 12px;
  background: #111827;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 9999;
  pointer-events: none;

  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
}

/* Mũi tên chỉ lên */
.sf-control[data-error-tooltip]::before {
  content: '';
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);

  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #111827;

  z-index: 9999;
  pointer-events: none;

  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
}

/* Hover hiện tooltip */
.sf-control[data-error-tooltip]:hover::after,
.sf-control[data-error-tooltip]:hover::before {
  opacity: 1;
  visibility: visible;
}
</style>
