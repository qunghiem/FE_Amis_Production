<!-- form thêm/sửa/nhân bản ca làm việc -->

<template>
  <MsModal
    v-model="localVisible"
    :title="formTitle"
    width="650px"
    :close-on-overlay="false"
    @update:modelValue="(v) => !v && handleClose()"
  >
    <div class="shift-form">
      <!-- Mã ca — full width -->
      <div class="sf-row sf-row--full">
        <label class="sf-label">
          {{ $t('shift.form.code') }} <span class="sf-required">*</span>
        </label>
        <div class="sf-control" :data-error-tooltip="errors.productionShiftCode || undefined">
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
        <label class="sf-label">
          {{ $t('shift.form.name') }} <span class="sf-required">*</span>
        </label>
        <div class="sf-control" :data-error-tooltip="errors.productionShiftName || undefined">
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
        <label class="sf-label">
          {{ $t('shift.form.startTime') }} <span class="sf-required">*</span>
        </label>
        <div class="sf-control" :data-error-tooltip="errors.startTime || undefined">
          <MsTimePicker
            ref="startRef"
            v-model="form.startTime"
            :error="errors.startTime"
            @blur="validateField('startTime')"
          />
        </div>

        <label class="sf-label">
          {{ $t('shift.form.endTime') }} <span class="sf-required">*</span>
        </label>
        <div class="sf-control" :data-error-tooltip="errors.endTime || undefined">
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
        <label class="sf-label">{{ $t('shift.form.breakStart') }}</label>
        <div class="sf-control" :data-error-tooltip="errors.breakStartTime || undefined">
          <MsTimePicker v-model="form.breakStartTime" :error="errors.breakStartTime" />
        </div>
        <label class="sf-label">{{ $t('shift.form.breakEnd') }}</label>
        <div class="sf-control" :data-error-tooltip="errors.breakEndTime || undefined">
          <MsTimePicker v-model="form.breakEndTime" :error="errors.breakEndTime" />
        </div>
      </div>

      <!-- Thời gian làm việc + Thời gian nghỉ -->
      <div class="sf-row sf-row--half">
        <label class="sf-label">{{ $t('shift.form.workHour') }}</label>
        <div class="sf-control">
          <div class="sf-readonly">{{ computedWorkHour }}</div>
        </div>

        <label class="sf-label">{{ $t('shift.form.breakHour') }}</label>
        <div class="sf-control">
          <div class="sf-readonly">{{ computedBreakHour }}</div>
        </div>
      </div>

      <!-- Mô tả — full width -->
      <div class="sf-row sf-row--full">
        <label class="sf-label sf-label--top">{{ $t('shift.form.description') }}</label>
        <div class="sf-control">
          <textarea
            class="sf-input sf-textarea"
            v-model="form.description"
            :placeholder="$t('shift.form.descriptionPlaceholder')"
          ></textarea>
        </div>
      </div>

      <!-- Trạng thái — chỉ hiển thị khi Sửa -->
      <div v-if="isEditing" class="sf-row sf-row--full">
        <label class="sf-label">{{ $t('shift.form.status') }}</label>
        <div class="sf-control sf-radio-group">
          <label class="sf-radio">
            <input type="radio" v-model="form.shiftStatus" :value="1" />
            <span class="sf-radio__dot"></span>
            {{ $t('shift.status.active') }}
          </label>
          <label class="sf-radio">
            <input type="radio" v-model="form.shiftStatus" :value="0" />
            <span class="sf-radio__dot"></span>
            {{ $t('shift.status.inactive') }}
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <MsButton type="cancel" @click="handleClose">{{ $t('common.cancel') }}</MsButton>
      <div class="sf-btn-tip" :data-shortcut="$t('shortcut.ctrlShiftS')">
        <MsButton type="save-and-add" :loading="saving" @click="handleSaveAndAdd">
          {{ $t('common.saveAndAdd') }}
        </MsButton>
      </div>
      <div class="sf-btn-tip" :data-shortcut="$t('shortcut.ctrlS')">
        <MsButton type="save" :loading="saving" @click="handleSave">{{
          $t('common.save')
        }}</MsButton>
      </div>
    </template>
  </MsModal>

  <!-- ===== CẢNH BÁO VALIDATE ===== -->
  <teleport to="body">
    <div v-if="warnValidate.visible" class="sf-overlay" @click.self="closeWarnValidate" @keydown.esc.stop="closeWarnValidate" tabindex="-1" ref="warnOverlayRef">
      <div class="sf-dialog">
        <div class="sf-dialog__header">
          <div class="sf-dialog__title-row">
            <span class="sf-dialog__icon sf-dialog__icon--warn">⚠</span>
            <span class="sf-dialog__title">{{ $t('dialog.warning') }}</span>
          </div>
          <button class="sf-dialog__close" @click="closeWarnValidate">&times;</button>
        </div>
        <div class="sf-dialog__body">{{ warnValidate.message }}</div>
        <div class="sf-dialog__footer">
          <MsButton type="save" @click="closeWarnValidate">{{ $t('common.close') }}</MsButton>
        </div>
      </div>
    </div>
  </teleport>

  <!-- ===== XÁC NHẬN THOÁT ===== -->
  <teleport to="body">
    <div v-if="confirmExit.visible" class="sf-overlay" @click.self="cancelExit">
      <div class="sf-dialog">
        <div class="sf-dialog__header">
          <div class="sf-dialog__title-row">
            <span class="sf-dialog__icon sf-dialog__icon--info">ℹ</span>
            <span class="sf-dialog__title">{{ $t('dialog.exitTitle') }}</span>
          </div>
          <button class="sf-dialog__close" @click="cancelExit">&times;</button>
        </div>
        <div class="sf-dialog__body">
          {{ $t('dialog.exitMessage') }}
        </div>
        <div class="sf-dialog__footer">
          <MsButton type="cancel" @click="cancelExit">{{ $t('common.cancel') }}</MsButton>
          <MsButton type="save" @click="forceClose">{{ $t('common.agree') }}</MsButton>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, computed, nextTick, reactive, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

import MsModal from './ms-modal/MsModal.vue'
import MsButton from './ms-button/MsButton.vue'
import MsTimePicker from './ms-time-picker/MsTimePicker.vue'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  editingShift: Object,
})

const emit = defineEmits(['close', 'saved'])

const localVisible = computed(() => props.visible)
const saving = ref(false)

const isEditing = computed(() => !!props.editingShift?.productionShiftID)

const formTitle = computed(() => {
  if (!props.editingShift) return t('shift.addTitle')
  if (!props.editingShift.productionShiftID) return t('shift.duplicateTitle')
  return t('shift.editTitle')
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

const initialForm = ref(null)

const isDirty = computed(() => {
  if (!initialForm.value) return false
  const c = form.value
  const i = initialForm.value
  return (
    c.productionShiftCode !== i.productionShiftCode ||
    c.productionShiftName !== i.productionShiftName ||
    c.startTime !== i.startTime ||
    c.endTime !== i.endTime ||
    c.breakStartTime !== i.breakStartTime ||
    c.breakEndTime !== i.breakEndTime ||
    c.description !== i.description ||
    c.shiftStatus !== i.shiftStatus
  )
})

const warnValidate = reactive({ visible: false, message: '' })

const warnOverlayRef = ref(null)

function showWarnValidate(msg) {
  warnValidate.message = msg
  warnValidate.visible = true
  nextTick(() => warnOverlayRef.value?.focus())
}

function closeWarnValidate() {
  warnValidate.visible = false
  warnValidate.message = ''
}

const confirmExit = reactive({ visible: false })

// Khi click đóng Modal hoặc nhấn ESC
// nếu form đang dirty/ sửa thì hiện popup xác nhận
// nếu không thì đóng luôn
function handleClose() {
  if (isDirty.value) {
    confirmExit.visible = true
  } else {
    emit('close')
  }
}
function cancelExit() {
  confirmExit.visible = false
}
function forceClose() {
  confirmExit.visible = false
  emit('close')
}

function onKeydown(e) {
  if (!props.visible) return
  if (warnValidate.visible) {
    if (e.key === 'Escape') closeWarnValidate()
    return
  }
  if (confirmExit.visible) {
    if (e.key === 'Escape') cancelExit()
    return
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    handleClose()
  } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
    e.preventDefault()
    handleSaveAndAdd()
  } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 's') {
    e.preventDefault()
    handleSave()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

const computedBreakHour = computed(() => {
  if (!form.value.breakStartTime || !form.value.breakEndTime) return 0
  let diff = timeToMinutes(form.value.breakEndTime) - timeToMinutes(form.value.breakStartTime)
  if (diff <= 0) diff += 24 * 60
  return Math.ceil(diff / 60)
})

const computedWorkHour = computed(() => {
  if (!form.value.startTime || !form.value.endTime) return 0
  let totalMinutes = timeToMinutes(form.value.endTime) - timeToMinutes(form.value.startTime)
  if (totalMinutes <= 0) totalMinutes += 24 * 60
  const workMinutes = totalMinutes - computedBreakHour.value * 60
  return Math.ceil(workMinutes / 60)
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
    nextTick(() => {
      initialForm.value = { ...form.value }
      codeRef.value?.focus()
    })
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
watch(
  () => form.value.breakStartTime,
  (v) => {
    if (v) errors.value.breakStartTime = ''
  },
)
watch(
  () => form.value.breakEndTime,
  (v) => {
    if (v) errors.value.breakEndTime = ''
  },
)

function validateField(field) {
  switch (field) {
    case 'productionShiftCode':
      if (!form.value.productionShiftCode?.trim())
        errors.value.productionShiftCode = t('shift.validation.codeRequired')
      else if (form.value.productionShiftCode.length > 20)
        errors.value.productionShiftCode = t('shift.validation.codeMaxLength')
      else errors.value.productionShiftCode = ''
      break
    case 'productionShiftName':
      if (!form.value.productionShiftName?.trim())
        errors.value.productionShiftName = t('shift.validation.nameRequired')
      else if (form.value.productionShiftName.length > 50)
        errors.value.productionShiftName = t('shift.validation.nameMaxLength')
      else errors.value.productionShiftName = ''
      break
    case 'startTime':
      errors.value.startTime = form.value.startTime ? '' : t('shift.validation.startTimeRequired')
      break
    case 'endTime':
      errors.value.endTime = form.value.endTime ? '' : t('shift.validation.endTimeRequired')
      break
  }
}

function validate() {
  ;['productionShiftCode', 'productionShiftName', 'startTime', 'endTime'].forEach(validateField)
  return Object.values(errors.value).every((e) => !e)
}

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

async function handleSave() {
  if (!validate()) {
    const firstError = Object.values(errors.value).find((e) => e)
    if (firstError) showWarnValidate(firstError)
    focusFirstError()
    return
  }
  if (saving.value) return
  saving.value = true
  emit('saved', {
    ...form.value,
    workHour: computedWorkHour.value,
    breakHour: computedBreakHour.value,
    _action: 'save',
  })
}

async function handleSaveAndAdd() {
  if (!validate()) {
    const firstError = Object.values(errors.value).find((e) => e)
    if (firstError) showWarnValidate(firstError)
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
  focusFirstError()
  return unmapped
}

function resetSaving() {
  saving.value = false
}

function resetForm() {
  form.value = EMPTY_FORM()
  errors.value = {}
  saving.value = false
  nextTick(() => {
    initialForm.value = { ...form.value }
    codeRef.value?.focus()
  })
}

defineExpose({ setServerErrors, resetSaving, resetForm })
</script>

<style scoped>
/* Giữ nguyên toàn bộ CSS gốc */
.shift-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sf-row {
  display: grid;
  align-items: start;
  column-gap: 23px;
  row-gap: 4px;
  white-space: nowrap;
  overflow: visible;
}
.sf-row--full {
  grid-template-columns: 150px 1fr;
}
.sf-row--half {
  grid-template-columns: 150px 1fr 175px 1fr;
}
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
.sf-control {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
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
.sf-control[data-error-tooltip] {
  position: relative;
}
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
.sf-control[data-error-tooltip]:hover::after,
.sf-control[data-error-tooltip]:hover::before {
  opacity: 1;
  visibility: visible;
}
.sf-btn-tip {
  position: relative;
  display: inline-flex;
}
.sf-btn-tip::after {
  content: attr(data-shortcut);
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  background: #111827;
  color: #fff;
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
.sf-btn-tip::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #111827;
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
}
.sf-btn-tip:hover::after,
.sf-btn-tip:hover::before {
  opacity: 1;
  visibility: visible;
}
.sf-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  background-color: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sf-dialog {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  width: 420px;
  max-width: 90vw;
  overflow: hidden;
}
.sf-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
}
.sf-dialog__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sf-dialog__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.sf-dialog__icon--warn {
  mask-position: -188px -169px;
  background-color: #ea580c !important;
  color: #ea580c !important;
  width: 16px;
  height: 14px;
  min-height: 20px;
  min-width: 20px;
  position: relative;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.0.0.36);
  background: url(https://demoqtsxcdn.misacdn.net/assets/pas.ic_warning-10482646.svg?v=10.0.0.36);
}
.sf-dialog__icon--info {
  mask-position: -218px -167px;
  background-color: #2563eb;
  height: 20px;
  width: 20px;
  min-height: 20px;
  min-width: 20px;
  position: relative;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.0.0.36);
  -webkit-mask-repeat: no-repeat;
}
.sf-dialog__title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}
.sf-dialog__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 20px;
  padding: 4px 8px;
  border-radius: 4px;
  line-height: 1;
}
.sf-dialog__close:hover {
  background: #f3f4f6;
  color: #111;
}
.sf-dialog__body {
  padding: 0 20px 16px;
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}
.sf-dialog__footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  gap: 8px;
}
</style>
