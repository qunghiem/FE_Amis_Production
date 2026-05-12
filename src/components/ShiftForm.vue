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
        <label class="sf-label">
          Mã ca <span class="sf-required">*</span>
        </label>
        <div class="sf-control">
          <input
            ref="codeRef"
            class="sf-input"
            :class="{ 'sf-input--invalid': errors.productionShiftCode }"
            v-model="form.productionShiftCode"
            maxlength="20"
            @blur="validateField('productionShiftCode')"
          />
          <div v-if="errors.productionShiftCode" class="sf-error">
            {{ errors.productionShiftCode }}
          </div>
        </div>
      </div>

      <!-- Tên ca — full width -->
      <div class="sf-row sf-row--full">
        <label class="sf-label">
          Tên ca <span class="sf-required">*</span>
        </label>
        <div class="sf-control">
          <input
            ref="nameRef"
            class="sf-input"
            :class="{ 'sf-input--invalid': errors.productionShiftName }"
            v-model="form.productionShiftName"
            maxlength="50"
            @blur="validateField('productionShiftName')"
          />
          <div v-if="errors.productionShiftName" class="sf-error">
            {{ errors.productionShiftName }}
          </div>
        </div>
      </div>

      <!-- Giờ vào ca + Giờ hết ca -->
      <div class="sf-row sf-row--half">
        <label class="sf-label">
          Giờ vào ca <span class="sf-required">*</span>
        </label>
        <div class="sf-control">
          <MsTimePicker
            ref="startRef"
            v-model="form.startTime"
            :error="errors.startTime"
            @blur="validateField('startTime')"
          />
          <div v-if="errors.startTime" class="sf-error">{{ errors.startTime }}</div>
        </div>

        <label class="sf-label">
          Giờ hết ca <span class="sf-required">*</span>
        </label>
        <div class="sf-control">
          <MsTimePicker
            ref="endRef"
            v-model="form.endTime"
            :error="errors.endTime"
            @blur="validateField('endTime')"
          />
          <div v-if="errors.endTime" class="sf-error">{{ errors.endTime }}</div>
        </div>
      </div>

      <!-- Bắt đầu nghỉ + Kết thúc nghỉ -->
      <div class="sf-row sf-row--half">
        <label class="sf-label">Bắt đầu nghỉ giữa ca</label>
        <div class="sf-control">
          <MsTimePicker v-model="form.breakStartTime" />
        </div>

        <label class="sf-label">Kết thúc nghỉ giữa ca</label>
        <div class="sf-control">
          <MsTimePicker v-model="form.breakEndTime" />
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
})

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

watch(() => form.value.productionShiftCode, (v) => { if (v?.trim()) errors.value.productionShiftCode = '' })
watch(() => form.value.productionShiftName, (v) => { if (v?.trim()) errors.value.productionShiftName = '' })
watch(() => form.value.startTime, (v) => { if (v) errors.value.startTime = '' })
watch(() => form.value.endTime, (v) => { if (v) errors.value.endTime = '' })

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
  if (!validate()) { focusFirstError(); return }
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
  if (!validate()) { focusFirstError(); return }
  if (saving.value) return
  saving.value = true
  emit('saved', {
    ...form.value,
    workHour: computedWorkHour.value,
    breakHour: computedBreakHour.value,
    _action: 'save-and-add',
  })
}
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
  column-gap: 10px;
  row-gap: 4px;
}

/* Full-width: label trái + input kéo hết phải */
.sf-row--full {
  grid-template-columns: 130px 1fr;
}

/* Chia đôi đều: [label1][input1] [label2][input2]
   Dùng tỉ lệ cố định để 2 bên hoàn toàn đối xứng */
.sf-row--half {
  grid-template-columns: 130px 1fr 130px 1fr;
}

/* ===== LABEL ===== */
.sf-label {
  font-size: 13px;
  color: #262626;
  font-weight: 500;
  line-height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 13px;
  color: #1f2937;
  background-color: #fff;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
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

.sf-error {
  font-size: 12px;
  color: #dc2626;
}
</style>
