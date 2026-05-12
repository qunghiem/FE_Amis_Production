<template>
  <main class="layout__content">
    <!-- Title header -->
    <div class="shift-page__header">
      <h1 class="shift-page__title">Ca làm việc</h1>
      <div class="shift-page__actions">
        <button class="btn btn--primary" @click="openAddModal">
          <span class="btn-icon btn-icon--plus"></span>
          Thêm
        </button>
      </div>
    </div>

    <!-- Content container -->
    <div class="shift-page__content">
      <!-- Thanh bar khi chọn nhiều -->
      <div v-if="store.selectedCount > 0" class="shift-page__selected-bar">
        <span class="selected-bar__count"
          >Đã chọn: <b>{{ store.selectedCount }}</b></span
        >
        <MsButton type="text" @click="store.unselectAll()">Bỏ chọn</MsButton>
        <div class="selected-bar__separator"></div>
        <MsButton v-if="store.hasInactiveInSelected" type="danger-outline" @click="handleBatchToggle(1)"
          >Sử dụng</MsButton
        >
        <MsButton v-if="store.hasActiveInSelected" type="danger-outline" @click="handleBatchToggle(0)"
          >Ngừng sử dụng</MsButton
        >
        <MsButton type="danger-outline" @click="openBatchDeleteConfirm">Xóa</MsButton>
      </div>

      <!-- Search bar -->
      <div v-else class="shift-page__toolbar">
        <div class="shift-page__search">
          <span class="shift-page__search-icon"></span>
          <input
            type="text"
            class="shift-page__search-input"
            placeholder="Tìm kiếm"
            v-model="store.searchKeyword"
          />
        </div>
        <button
          class="shift-page__reload"
          @click="store.fetchPage()"
          data-tooltip="Lấy lại dữ liệu"
        >
          <span class="btn-icon btn-icon--reload"></span>
        </button>
      </div>

      <!-- Table -->
      <MsTable
  :columns="COLUMNS"
  :rows="store.pageData"
  row-key="productionShiftID"
  :selectable="true"
  :all-checked="allPageChecked"
  :is-selected="store.isSelected"
  :active-row-id="activeRowId"
  :active-filters="store.filters"
  empty-text="Chưa có ca làm việc nào"
  @toggle-all="toggleAll"
  @toggle-row="(id) => store.toggleSelect(id)"
  @row-click="(row) => activeRowId = activeRowId === row.productionShiftID ? null : row.productionShiftID"
  @filter-apply="handleFilterApply"
  @filter-clear="handleFilterClear"
>
        <!-- Thời gian làm việc -->
        <template #cell-workHour="{ row }">
          <span :class="{ 'text-orange': row.workHour < 0 }">
            {{ row.workHour != null ? row.workHour : '-' }}
          </span>
        </template>

        <!-- Thời gian nghỉ -->
        <template #cell-breakHour="{ row }">
          {{ row.breakHour != null ? row.breakHour : 0 }}
        </template>

        <!-- Trạng thái -->
        <template #cell-shiftStatus="{ row }">
          <span :class="row.shiftStatus === 1 ? 'status--active' : 'status--inactive'">
            {{ row.shiftStatus === 1 ? 'Sử dụng' : 'Ngừng sử dụng' }}
          </span>
        </template>

        <!-- Action: Sửa + More -->
        <template #actions="{ row }">
          <!-- Nút Sửa -->
          <button class="action-btn" title="Sửa" @click.stop="openEditModal(row.productionShiftID)">
            <span class="action-icon action-icon--edit"></span>
          </button>

          <!-- Nút More — chỉ toggle, dropdown được teleport ra body -->
          <button
            class="action-btn"
            title="Thêm tùy chọn"
            @click.stop="toggleMoreMenu(row.productionShiftID, $event)"
          >
            <span class="action-icon action-icon--more"></span>
          </button>
        </template>
      </MsTable>

      <!-- Loading -->
      <div v-if="store.loading" class="shift-page__loading">
        <div class="spinner"></div>
      </div>

      <!-- Footer pagination -->
      <div class="shift-page__footer">
        <span
          >Tổng số: <b>{{ store.pageInfo.total }}</b></span
        >
        <div class="shift-page__pagination">
          <span>Số dòng/trang</span>
          <select
            :value="store.pageSize"
            @change="(e) => store.setPageSize(Number(e.target.value))"
          >
            <option v-for="n in [10, 20, 50, 100]" :key="n" :value="n">{{ n }}</option>
          </select>
          <span class="pagination__range"
            >{{ store.pageInfo.start }} - {{ store.pageInfo.end }}</span
          >
          <button class="pagination__btn" :disabled="store.isFirstPage" @click="store.prevPage()">
            <span class="btn-icon btn-icon--chevron-left"></span>
          </button>
          <button class="pagination__btn" :disabled="store.isLastPage" @click="store.nextPage()">
            <span class="btn-icon btn-icon--chevron-right"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="shift-page__error">
      ⚠️ {{ store.error }}
      <button @click="store.fetchPage()">Thử lại</button>
    </div>
  </main>

  <!-- ===== TELEPORT: More dropdown ra body để không bị overflow clip ===== -->
  <teleport to="body">
    <div
      v-if="moreMenuId !== null"
      class="action-more__dropdown"
      :style="{
        position: 'fixed',
        top: moreMenuPos.top + 'px',
        left: moreMenuPos.left + 'px',
        zIndex: 99999,
      }"
      @click.stop
    >
      <!-- Lấy row từ store để hiển thị đúng trạng thái -->
      <template v-if="moreMenuRow">
        <div class="action-more__item" @click="handleDuplicate(moreMenuId)">
          <span class="dropdown-icon dropdown-icon--clone"></span>
          Nhân bản
        </div>
        <div class="action-more__item" @click="handleToggleSingle(moreMenuRow)">
          <span class="dropdown-icon dropdown-icon--toggle"></span>
          {{ moreMenuRow.shiftStatus === 1 ? 'Ngừng sử dụng' : 'Sử dụng' }}
        </div>
        <div
          class="action-more__item action-more__item--danger"
          @click="openDeleteConfirm(moreMenuId)"
        >
          <span class="dropdown-icon dropdown-icon--delete"></span>
          Xóa
        </div>
      </template>
    </div>
  </teleport>

  <!-- Form thêm/sửa/nhân bản -->
  <ShiftForm
  ref="shiftFormRef"
  :visible="formVisible"
  :editingShift="editingShift"
  @close="closeModal"
  @saved="handleSaved"
/>

  <!-- Confirm xóa -->
  <ConfirmModal
    :visible="confirmState.visible"
    :title="confirmState.title"
    :message="confirmState.message"
    type="danger"
    confirm-text="Xóa"
    @confirm="onConfirm"
    @cancel="closeConfirm"
  />

  <!-- ===== WARNING POPUP: Cảnh báo trùng mã ===== -->
  <teleport to="body">
    <div v-if="warningState.visible" class="warning-overlay" @click.self="closeWarning">
      <div class="warning-dialog">
        <div class="warning-dialog__header">
          <div class="warning-dialog__title-row">
            <span class="warning-dialog__icon">⚠</span>
            <span class="warning-dialog__title">Cảnh báo!</span>
          </div>
          <button class="warning-dialog__close" @click="closeWarning">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="warning-dialog__body">
          <p v-html="warningState.message"></p>
        </div>
        <div class="warning-dialog__footer">
          <button class="warning-dialog__btn" @click="closeWarning">Đóng</button>
        </div>
      </div>
    </div>
  </teleport>

  <!-- Detail modal -->
  <MsModal
    v-model="detailVisible"
    title="Chi tiết ca làm việc"
    width="500px"
    :close-on-overlay="true"
  >
    <div v-if="detailShift" class="shift-detail">
      <div class="detail-row">
        <span class="detail-label">Mã ca:</span> {{ detailShift.productionShiftCode }}
      </div>
      <div class="detail-row">
        <span class="detail-label">Tên ca:</span> {{ detailShift.productionShiftName }}
      </div>
      <div class="detail-row">
        <span class="detail-label">Giờ vào ca:</span> {{ detailShift.startTimeDisplay }}
      </div>
      <div class="detail-row">
        <span class="detail-label">Giờ hết ca:</span> {{ detailShift.endTimeDisplay }}
      </div>
      <div class="detail-row">
        <span class="detail-label">Bắt đầu nghỉ:</span> {{ detailShift.breakStartTimeDisplay }}
      </div>
      <div class="detail-row">
        <span class="detail-label">Kết thúc nghỉ:</span> {{ detailShift.breakEndTimeDisplay }}
      </div>
      <div class="detail-row">
        <span class="detail-label">Thời gian làm việc:</span> {{ detailShift.workHour }} giờ
      </div>
      <div class="detail-row">
        <span class="detail-label">Thời gian nghỉ:</span> {{ detailShift.breakHour }} giờ
      </div>
      <div class="detail-row">
        <span class="detail-label">Trạng thái:</span>
        <span :class="detailShift.shiftStatus === 1 ? 'status--active' : 'status--inactive'">
          {{ detailShift.shiftStatus === 1 ? 'Sử dụng' : 'Ngừng sử dụng' }}
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Mô tả:</span> {{ detailShift.description || '-' }}
      </div>
      <div class="detail-row">
        <span class="detail-label">Người tạo:</span> {{ detailShift.createdBy || '-' }}
      </div>
      <div class="detail-row">
        <span class="detail-label">Ngày tạo:</span> {{ detailShift.createdDateDisplay || '-' }}
      </div>
      <div class="detail-row">
        <span class="detail-label">Người sửa:</span> {{ detailShift.modifiedBy || '-' }}
      </div>
      <div class="detail-row">
        <span class="detail-label">Ngày sửa:</span> {{ detailShift.modifiedDateDisplay || '-' }}
      </div>
    </div>

    <template #footer>
      <MsButton type="outline" @click="handleDuplicateFromDetail">Nhân bản</MsButton>
      <MsButton type="outline" @click="editFromDetail">Sửa</MsButton>
      <MsButton type="danger-outline" @click="deleteFromDetail">Xóa</MsButton>
    </template>
  </MsModal>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useShiftStore } from '@/stores/shiftStore'
import { useToast } from '@/composables/useToast'
import MsTable from '@/components/ms-table/MsTable.vue'
import MsButton from '@/components/ms-button/MsButton.vue'
import MsModal from '@/components/ms-modal/MsModal.vue'
import ShiftForm from '@/components/ShiftForm.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { ApiError } from '@/services/api'

const shiftFormRef = ref(null)
const store = useShiftStore()
const toast = useToast()
// Row được click highlight xanh — khác với checkbox selected
const activeRowId = ref(null)
// ===== Columns config =====
const COLUMNS = [
  {
    key: 'productionShiftCode',
    label: 'Mã ca',
    width: '120px',
    filterable: true,
    filterType: 'string',
  },
  {
    key: 'productionShiftName',
    label: 'Tên ca',
    width: '150px',
    filterable: true,
    filterType: 'string',
  },
  { key: 'startTimeDisplay', label: 'Giờ vào ca', width: '110px' },
  { key: 'endTimeDisplay', label: 'Giờ hết ca', width: '110px' },
  { key: 'breakStartTimeDisplay', label: 'Bắt đầu nghỉ giữa ca', width: '160px' },
  { key: 'breakEndTimeDisplay', label: 'Kết thúc nghỉ giữa ca', width: '160px' },
  {
    key: 'workHour',
    label: 'Thời gian làm việc (giờ)',
    width: '180px',
    align: 'right',
    filterable: true,
    filterType: 'number',
  },
  {
    key: 'breakHour',
    label: 'Thời gian nghỉ giữa ca (giờ)',
    width: '200px',
    align: 'right',
    filterable: true,
    filterType: 'number',
  },
  {
    key: 'shiftStatus',
    label: 'Trạng thái',
    width: '140px',
    filterable: true,
    filterType: 'number',
  },
  { key: 'createdBy', label: 'Người tạo', width: '150px', filterable: true, filterType: 'string' },
  { key: 'createdDateDisplay', label: 'Ngày tạo', width: '150px' },
  { key: 'modifiedBy', label: 'Người sửa', width: '150px', filterable: true, filterType: 'string' },
  {
    key: 'modifiedDateDisplay',
    label: 'Ngày sửa',
    width: '150px',
    filterable: true,
    filterType: 'date',
  },
]

// ===== State =====
const formVisible = ref(false)
const editingShift = ref(null)
// More menu — dùng teleport nên cần lưu vị trí
const moreMenuId = ref(null)
const moreMenuPos = reactive({ top: 0, left: 0 })
// Row tương ứng với menu đang mở (để hiển thị label trạng thái đúng)
const moreMenuRow = computed(() =>
  moreMenuId.value !== null ? store.getById(moreMenuId.value) : null,
)

const confirmState = reactive({
  visible: false,
  title: '',
  message: '',
  onConfirm: null,
})

// ===== WARNING STATE: popup cảnh báo trùng mã =====
const warningState = reactive({
  visible: false,
  message: '',
})

function showWarning(message) {
  warningState.message = message
  warningState.visible = true
}

function closeWarning() {
  warningState.visible = false
  warningState.message = ''
}

const detailVisible = ref(false)
const detailShift = ref(null)


// ===== Init =====
onMounted(() => {
  store.init()
  document.addEventListener('click', closeMoreMenu)
})
onUnmounted(() => {
  document.removeEventListener('click', closeMoreMenu)
})

// ===== Select all =====
const allPageChecked = computed(
  () =>
    store.pageData.length > 0 && store.pageData.every((s) => store.isSelected(s.productionShiftID)),
)

function toggleAll(e) {
  const ids = store.pageData.map((s) => s.productionShiftID)
  e.target.checked ? store.selectAll(ids) : store.unselectAll()
}

// ===== Filter =====
function handleFilterApply(filter) {
  const idx = store.filters.findIndex((f) => f.Property === filter.Property)
  if (idx >= 0) {
    store.filters.splice(idx, 1, filter)
  } else {
    store.filters.push(filter)
  }
  store.resetPage()
  store.fetchPage()
}

function handleFilterClear(property) {
  const idx = store.filters.findIndex((f) => f.Property === property)
  if (idx >= 0) store.filters.splice(idx, 1)
  store.resetPage()
  store.fetchPage()
}

// ===== More menu =====
function toggleMoreMenu(id, event) {
  if (moreMenuId.value === id) {
    moreMenuId.value = null
    return
  }
  const btn = event.currentTarget
  const rect = btn.getBoundingClientRect()
  moreMenuPos.top = rect.bottom + 4
  moreMenuPos.left = rect.right - 170
  moreMenuId.value = id
}

function closeMoreMenu() {
  moreMenuId.value = null
}

// ===== CRUD =====
function openAddModal() {
  editingShift.value = null
  formVisible.value = true
}

function openEditModal(id) {
  editingShift.value = store.getById(id)
  formVisible.value = true
}

function closeModal() {
  formVisible.value = false
  editingShift.value = null
}

async function handleSaved(data) {
  const isEdit = !!data.productionShiftID
  const isSaveAndAdd = data._action === 'save-and-add'
  const tid = toast.loading(isEdit ? 'Đang cập nhật...' : 'Đang thêm mới...')

  try {
    isEdit ? await store.updateShift(data) : await store.addShift(data)
    toast.update(tid, isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success')

    if (isSaveAndAdd) {
      shiftFormRef.value?.resetForm()
    } else {
      closeModal()
    }
  } catch (err) {
    // Nếu là lỗi validate từ backend (400) → xử lý hiển thị
    if (err instanceof ApiError && err.errors?.length > 0) {
      toast.remove(tid) // Xoá toast loading

      // Kiểm tra có lỗi trùng mã không (chứa "trùng" hoặc "tồn tại")
      const duplicateErrors = err.errors.filter(
        (msg) => msg.includes('trùng') || msg.includes('tồn tại')
      )
      const otherErrors = err.errors.filter(
        (msg) => !msg.includes('trùng') && !msg.includes('tồn tại')
      )

      // Nếu có lỗi trùng mã → hiện popup cảnh báo như design
      if (duplicateErrors.length > 0) {
        const code = data.productionShiftCode || ''
        showWarning(
          `Ca làm việc &lt;<b>${code}</b>&gt; đã tồn tại. Vui lòng kiểm tra lại.`
        )
        // Đồng thời đánh dấu lỗi trên field form
        shiftFormRef.value?.setServerErrors(duplicateErrors)
      }

      // Các lỗi khác (không phải trùng) → hiện trên form như bình thường
      if (otherErrors.length > 0) {
        const unmapped = shiftFormRef.value?.setServerErrors(otherErrors) ?? []
        if (unmapped.length > 0) {
          toast.error(unmapped.join('; '))
        }
      }

      shiftFormRef.value?.resetSaving()
    } else {
      // Lỗi server (500) hoặc lỗi mạng → toast chung
      toast.update(tid, err.message, 'error')
      shiftFormRef.value?.resetSaving()
    }
  }
}

// ===== Detail =====

// ===== Duplicate =====
async function handleDuplicate(id) {
  moreMenuId.value = null
  const tid = toast.loading('Đang nhân bản...')
  try {
    const duplicated = await store.duplicateShift(id)
    toast.update(tid, 'Nhân bản thành công!', 'success')
    editingShift.value = { ...duplicated, productionShiftID: null }
    formVisible.value = true
  } catch (err) {
    toast.update(tid, err.message, 'error')
  }
}

// ===== Toggle status =====
async function handleToggleSingle(row) {
  moreMenuId.value = null
  const newStatus = row.shiftStatus === 1 ? 0 : 1
  const label = newStatus === 1 ? 'Sử dụng' : 'Ngừng sử dụng'
  const tid = toast.loading('Đang chuyển trạng thái...')
  try {
    await store.toggleStatus([row.productionShiftID], newStatus)
    toast.update(tid, `Đã chuyển sang "${label}"`, 'success')
  } catch (err) {
    toast.update(tid, err.message, 'error')
  }
}

async function handleBatchToggle(status) {
  const ids = store.selectedIdList
  const label = status === 1 ? 'Sử dụng' : 'Ngừng sử dụng'
  const tid = toast.loading(`Đang chuyển trạng thái ${ids.length} ca...`)
  try {
    await store.toggleStatus(ids, status)
    toast.update(tid, `Đã chuyển ${ids.length} ca sang "${label}"`, 'success')
  } catch (err) {
    toast.update(tid, err.message, 'error')
  }
}


function editFromDetail() {
  detailVisible.value = false
  if (detailShift.value) {
    openEditModal(detailShift.value.productionShiftID)
  }
}

function deleteFromDetail() {
  detailVisible.value = false
  if (detailShift.value) {
    openDeleteConfirm(detailShift.value.productionShiftID)
  }
}

async function handleDuplicateFromDetail() {
  detailVisible.value = false
  if (detailShift.value) {
    await handleDuplicate(detailShift.value.productionShiftID)
  }
}

// ===== Delete =====
function openDeleteConfirm(id) {
  moreMenuId.value = null
  const shift = store.getById(id)
  confirmState.title = 'Xóa ca làm việc'
  confirmState.message = `Bạn có chắc muốn xóa ca "${shift?.productionShiftCode || ''}"? Thao tác này không thể hoàn tác.`
  confirmState.onConfirm = () => handleDelete([id])
  confirmState.visible = true
}

function openBatchDeleteConfirm() {
  confirmState.title = 'Xóa nhiều ca làm việc'
  confirmState.message = `Bạn có chắc muốn xóa ${store.selectedIdList.length} ca đã chọn? Thao tác này không thể hoàn tác.`
  confirmState.onConfirm = () => handleDelete(store.selectedIdList)
  confirmState.visible = true
}

function closeConfirm() {
  confirmState.visible = false
  confirmState.onConfirm = null
}

async function onConfirm() {
  const callback = confirmState.onConfirm
  closeConfirm()
  if (callback) await callback()
}

async function handleDelete(ids) {
  const tid = toast.loading('Đang xóa...')
  try {
    await store.deleteByIds(ids)
    toast.update(tid, `Xóa thành công ${ids.length} ca!`, 'success')
  } catch (err) {
    toast.update(tid, err.message, 'error')
  }
}
</script>

<style scoped>
.shift-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 45px;
  margin-bottom: 2px;
}
.shift-page__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-main);
}

/* ===== Base mask icon ===== */
.btn-icon {
  -webkit-mask-repeat: no-repeat;
  background-color: currentColor;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}
.btn-icon--plus {
  mask-position: -80px 0px;
  background-color: #fff;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  position: relative;
  mask-position: -80px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.btn-icon--reload {
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  mask-position: -112px 0px;
  position: relative;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.btn-icon--chevron-left {
  mask-position: -200px -16px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.btn-icon--chevron-right {
  mask-position: -200px -16px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
  transform: scaleX(-1);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  height: 28px;
}
.btn--primary {
  background-color: var(--primary);
  color: #fff;
}
.btn--primary:hover {
  background-color: var(--primary-hover);
}

.shift-page__content {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.shift-page__toolbar {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.shift-page__search {
  position: relative;
  width: 250px;
}
.shift-page__search-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  min-width: 16px;
  mask-position: 0px 0px;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.shift-page__search-input {
  padding: 5px 0px 5px 36px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  column-gap: 4px;
  background-color: #fff;
}
.shift-page__search-input:focus {
  border-color: var(--primary);
}

.shift-page__reload {
      padding: 6px 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #D1D5DB;
    color: #111827;
    background-color: #fff;
        transition: all .2s ease;
    cursor: pointer;
    display: flex;
    outline: none;
    border-radius: 4px;
    position: relative;
    font-size: 13px;
    height: 28px;
    font-weight: 500;
}
.shift-page__reload:hover {
      border: 1px solid #D1D5DB;
  color: var(--primary);
  background-color: #f3f4f6;
}

.shift-page__selected-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background-color: #f0fdf4;
  border-bottom: 1px solid #bbf7d0;
}
.selected-bar__count {
  font-size: 13px;
  color: #374151;
}
.selected-bar__separator {
  width: 1px;
  height: 20px;
  background: #d1d5db;
}

.shift-page__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid #e5e7eb;
  background-color: #fafafa;
  font-size: 13px;
  color: #6b7280;
  flex-shrink: 0;
}
.shift-page__pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}
.shift-page__pagination select {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  font-family: inherit;
}
.pagination__range {
  min-width: 50px;
  text-align: center;
}
.pagination__btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}
.pagination__btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}
.pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.status--active {
  color: var(--primary);
  font-weight: 500;
}
.status--inactive {
  color: #dc2626;
  font-weight: 500;
}
.text-orange {
  color: #ea580c;
}

.shift-page__loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.shift-page__error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 10px 16px;
  font-size: 13px;
  border-radius: 4px;
}
.shift-page__error button {
  margin-left: 12px;
  border: 1px solid #dc2626;
  background: transparent;
  color: #dc2626;
  padding: 2px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
}

/* ===== Action buttons ===== */
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s;
  border-radius: 50%;
}
.action-btn:hover {
  background-color: #f3f4f6;
}
.action-btn:hover .action-icon {
  background-color: var(--primary);
}

/* ===== Action icon (mask-based) ===== */
.action-icon {
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}

.action-icon--edit {
  mask-position: -271px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.action-icon--more {
      mask-position: -288px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}

/* ===== Detail modal ===== */
.shift-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  padding: 4px 0;
  border-bottom: 1px solid #f3f4f6;
}
.detail-label {
  font-weight: 600;
  min-width: 180px;
  color: #6b7280;
  flex-shrink: 0;
}

/* ===== WARNING DIALOG — Popup cảnh báo trùng mã ===== */
.warning-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  background-color: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.warning-dialog {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  width: 420px;
  max-width: 90vw;
  overflow: hidden;
}

.warning-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
}

.warning-dialog__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-dialog__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #fef3c7;
  color: #d97706;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.warning-dialog__title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.warning-dialog__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
.warning-dialog__close:hover {
  background: #f3f4f6;
  color: #111;
}

.warning-dialog__body {
  padding: 0 20px 16px;
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

.warning-dialog__footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.warning-dialog__btn {
  background-color: var(--primary, #009b71);
  color: #fff;
  border: none;
  padding: 7px 24px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 0.15s;
}
.warning-dialog__btn:hover {
  background-color: var(--primary-hover, #007b5d);
}
</style>

<!-- Global styles cho teleported dropdown (không scoped) -->
<style>
.action-more__dropdown {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 170px;
  padding: 4px 0;
}

.action-more__item {
  padding: 8px 16px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.action-more__item:hover {
      background: #f3f4f6;
}

.action-more__item--danger {
  color: #dc2626;
}
.action-more__item--danger:hover {
  background: #fef2f2;
  color: #dc2626;
}
.action-more__item--danger:hover .dropdown-icon {
  background-color: #dc2626;
}

.dropdown-icon {
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}
.dropdown-icon--clone {
      mask-position: -224px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.dropdown-icon--toggle {
  mask-position: -192px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.dropdown-icon--delete {
      mask-position: -208px 0px;
      background-color: #dc2626 !important;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
</style>
