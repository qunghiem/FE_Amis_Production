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
      <!-- Toolbar: Search luôn hiển thị -->
      <div class="shift-page__toolbar">
        <div class="shift-page__search">
          <span class="shift-page__search-icon"></span>
          <input
            type="text"
            class="shift-page__search-input"
            placeholder="Tìm kiếm"
            v-model="store.searchKeyword"
          />
        </div>

        <!-- Khi có checkbox được chọn -->
        <template v-if="store.selectedCount > 0">
          <span class="selected-bar__count"
            >Đã chọn <b>{{ store.selectedCount }}</b></span
          >
          <MsButton type="text-primary" @click="store.unselectAll()">Bỏ chọn</MsButton>
          <div class="selected-bar__separator"></div>
          <MsButton
            v-if="store.hasInactiveInSelected"
            type="primary-outline"
            @click="handleBatchToggle(1)"
          >
            <span
              class="dropdown-icon dropdown-icon--toggle"
              style="background-color: var(--primary)"
            ></span>
            Sử dụng
          </MsButton>
          <MsButton
            v-if="store.hasActiveInSelected"
            type="danger-outline"
            @click="handleBatchToggle(0)"
          >
            <span
              class="dropdown-icon dropdown-icon--toggle"
              style="background-color: #dc2626"
            ></span>
            Ngừng sử dụng
          </MsButton>
          <MsButton type="danger-outline" @click="openBatchDeleteConfirm">Xóa</MsButton>
        </template>

        <!-- Khi không chọn: hiện filter tags -->
        <template v-else-if="store.filters.length > 0">
          <div v-for="(filter, idx) in store.filters" :key="idx" class="filter-bar__tag">
            <span class="filter-bar__tag-col">{{ getColumnLabel(filter.Property) }}</span>
            <span class="filter-bar__tag-op">{{ getOperatorLabel(filter) }}</span>
            <span class="filter-bar__tag-val">{{ getValueLabel(filter) }}</span>
            <button class="filter-bar__tag-remove" @click="removeFilter(filter.Property)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <MsButton type="text" @click="clearAllFilters">Bỏ lọc</MsButton>
        </template>

        <div class="shift-page__toolbar-spacer"></div>

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
        :sort-by="store.sortBy"
        :sort-direction="store.sortDirection"
        empty-text="Chưa có ca làm việc nào"
        @toggle-all="toggleAll"
        @toggle-row="(id) => store.toggleSelect(id)"
        @row-click="
          (row) =>
            (activeRowId = activeRowId === row.productionShiftID ? null : row.productionShiftID)
        "
        @filter-apply="handleFilterApply"
        @filter-clear="handleFilterClear"
        @sort-change="handleSortChange"
        @row-dblclick="(row) => openEditModal(row.productionShiftID)"
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
            {{ row.shiftStatus === 1 ? 'Đang sử dụng' : 'Ngừng sử dụng' }}
          </span>
        </template>

        <!-- Action: Sửa + More -->
        <template #actions="{ row }">
          <!-- Nút Sửa -->
          <button class="action-btn" title="Sửa" @click.stop="openEditModal(row.productionShiftID)">
            <span class="action-icon action-icon--edit"></span>
          </button>

          <!-- Nút More -->
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

  <!-- ===== TELEPORT: More dropdown ra body ===== -->
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

  <!-- ===== WARNING POPUP ===== -->
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
    width: '250px',
    filterable: true,
    filterType: 'string',
  },
  { key: 'startTimeDisplay', label: 'Giờ vào ca', width: '130px', sortKey: 'startTime' },
  { key: 'endTimeDisplay', label: 'Giờ hết ca', width: '130px', sortKey: 'endTime' },
  {
    key: 'breakStartTimeDisplay',
    label: 'Bắt đầu nghỉ giữa ca',
    width: '165px',
    sortKey: 'breakStartTime',
  },
  {
    key: 'breakEndTimeDisplay',
    label: 'Kết thúc nghỉ giữa ca',
    width: '165px',
    sortKey: 'breakEndTime',
  },
  {
    key: 'workHour',
    label: 'Thời gian làm việc (giờ)',
    width: '230px',
    align: 'right',
    filterable: true,
    filterType: 'number',
  },
  {
    key: 'breakHour',
    label: 'Thời gian nghỉ giữa ca (giờ)',
    width: '230px',
    align: 'right',
    filterable: true,
    filterType: 'number',
  },
  {
    key: 'shiftStatus',
    label: 'Trạng thái',
    width: '140px',
    filterable: true,
    filterType: 'status',
  },
  {
    key: 'createdBy',
    label: 'Người tạo',
    width: '150px',
    filterable: true,
    filterType: 'string',
  },
  {
    key: 'createdDateDisplay',
    label: 'Ngày tạo',
    width: '150px',
    filterable: true,
    filterType: 'date',
    filterKey: 'CreatedDate',
    sortKey: 'createdDate',
  },

  {
    key: 'modifiedBy',
    label: 'Người sửa',
    width: '150px',
    filterable: true,
    filterType: 'string',
  },
  {
    key: 'modifiedDateDisplay',
    label: 'Ngày sửa',
    width: '150px',
    filterable: true,
    filterType: 'date',
    filterKey: 'ModifiedDate',
    sortKey: 'modifiedDate',
  },
]

// ===== Map tên operator → label tiếng Việt =====
const OPERATOR_LABELS = {
  contains: 'Chứa',
  not_contains: 'Không chứa',
  not_equals: 'Khác',
  equals: 'Bằng',
  starts_with: 'Bắt đầu với',
  ends_with: 'Kết thúc với',
  less_than: 'Nhỏ hơn',
  less_than_or_equal: 'Nhỏ hơn hoặc bằng',
  greater_than: 'Lớn hơn',
}

// ===== Map property → tên cột hiển thị =====
function getColumnLabel(property) {
  const col = COLUMNS.find((c) => c.key === property || c.filterKey === property)
  return col?.label || property
}

// ===== Lấy label operator cho filter tag =====
function getOperatorLabel(filter) {
  const col = COLUMNS.find((c) => c.key === filter.Property || c.filterKey === filter.Property)
  // Status không hiển thị operator
  if (col?.filterType === 'status') return ''
  return OPERATOR_LABELS[filter.Operator] || filter.Operator
}

// ===== Lấy label giá trị cho filter tag =====
function getValueLabel(filter) {
  const col = COLUMNS.find((c) => c.key === filter.Property || c.filterKey === filter.Property)
  if (col?.filterType === 'status') {
    return filter.Value === '1' || filter.Value === 1 ? 'Đang sử dụng' : 'Ngừng sử dụng'
  }
  return filter.Value
}

// ===== State =====
const formVisible = ref(false) // true nếu modal thêm/sửa đang mở, false nếu đóng
const editingShift = ref(null) // chứa ca làm việc đang được sửa hoặc nhân bản, nếu null thì đang ở trạng thái thêm mới
const moreMenuId = ref(null) // id của ca làm việc đang được mở menu More, nếu null thì không có menu nào được mở
const moreMenuPos = reactive({ top: 0, left: 0 }) // vị trí của menu More đang mở, dùng để đặt dropdown ở đúng vị trí
// computed để lấy ra dữ liệu ca làm việc đang được mở menu More dựa vào moreMenuId
const moreMenuRow = computed(() =>
  moreMenuId.value !== null ? store.getById(moreMenuId.value) : null,
)

// lưu trạng thái của confirm modal để khi cần xác nhận xóa thì set trạng thái này với nội dung phù hợp rồi mở modal, sau khi người dùng xác nhận hoặc hủy thì reset lại trạng thái
const confirmState = reactive({
  visible: false,
  title: '',
  message: '',
  //
  onConfirm: null,
})

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

// khi click vào chọn tất cả ô
function toggleAll(e) {
  // Lấy ra list id của tất cả ca làm việc đang hiển thị trên trang
  const ids = store.pageData.map((s) => s.productionShiftID)
  // nếu vừa tích thì thêm tất cả id vào selectedIdList, nếu vừa bỏ tích thì xóa tất cả id đó khỏi selectedIdList
  e.target.checked ? store.selectAll(ids) : store.unselectAll()
}

// ===== Filter =====

// Apply filter khi click Áp dụng trong MsColumnFilter
function handleFilterApply(filter) {
  // tìm xem trong ds bộ lọc đã có filter cho cột này chưa
  const idx = store.filters.findIndex((f) => f.Property === filter.Property)
  // nếu đã tồn tại: thay thế bằng filter mới,
  if (idx >= 0) {
    store.filters.splice(idx, 1, filter)
  } else {
    // nếu chưa có thì thêm mới
    store.filters.push(filter)
  }
  store.resetPage()
  store.fetchPage()
}

// Clear filter khi click vào nút x trong tag filter
function handleFilterClear(property) {
  const idx = store.filters.findIndex((f) => f.Property === property)
  if (idx >= 0) store.filters.splice(idx, 1)
  store.resetPage()
  store.fetchPage()
}

// khi click vào nút x trong tag filter thì gọi hàm handleFilterClear với đúng property cần xóa
function removeFilter(property) {
  handleFilterClear(property)
}

// khi click vào nút Bỏ lọc thì xóa hết tất cả filter
function clearAllFilters() {
  store.filters.splice(0, store.filters.length)
  store.resetPage()
  store.fetchPage()
}

// ===== More menu =====
// Hàm toggle menu More, nhận vào ID của ca làm việc và event click để tính toán vị trí hiển thị dropdown
function toggleMoreMenu(id, event) {
  if (moreMenuId.value === id) {
    moreMenuId.value = null
    return
  }
  // Tính toán vị trí hiển thị dropdown dựa vào vị trí của nút More được click
  const btn = event.currentTarget
  const rect = btn.getBoundingClientRect()
  moreMenuPos.top = rect.bottom + 4
  moreMenuPos.left = rect.right - 170
  moreMenuId.value = id
}

// Hàm đóng menu More
function closeMoreMenu() {
  moreMenuId.value = null
}

// ===== CRUD =====
// Hàm mở modal thêm mới
function openAddModal() {
  // set editingShift về null để form hiểu là đang ở trạng thái thêm mới
  editingShift.value = null
  // mở modal
  formVisible.value = true
}

// Hàm mở modal sửa, nhận vào ID của ca làm việc cần sửa
function openEditModal(id) {
  // Lấy dữ liệu ca làm việc từ store theo ID và gán vào editingShift, sau đó mở modal
  editingShift.value = store.getById(id)
  // mở model
  formVisible.value = true
}

function closeModal() {
  formVisible.value = false
  editingShift.value = null
}

// ===== Sort =====
function handleSortChange({ sortBy: newSortBy, sortDirection: newDir }) {
  store.sortBy = newSortBy
  store.sortDirection = newDir
  store.resetPage()
  store.fetchPage()
}

// Hàm xử lý khi form thêm/sửa ca làm việc gọi sự kiện saved, nhận vào dữ liệu ca làm việc đã được thêm hoặc sửa thành công
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
    toast.remove(tid)
    shiftFormRef.value?.resetSaving()

    if (err instanceof ApiError && err.errors?.length > 0) {
      // Hiện thẳng message backend vào modal cảnh báo
      showWarning(err.errors.join('<br>'))
    } else {
      toast.error(err.message)
    }
  }
}

// ===== Duplicate =====
async function handleDuplicate(id) {
  // Đóng menu More đang mở
  moreMenuId.value = null
  try {
    // Gọi API nhân bản ca làm việc, API sẽ trả về dữ liệu ca làm việc mới được tạo ra sau khi nhân bản,
    const duplicated = await store.duplicateShift(id)
    // sau đó gán dữ liệu đó vào editingShift
    editingShift.value = { ...duplicated, productionShiftID: null }
    // mở modal
    formVisible.value = true
  } catch (err) {
    toast.update(err.message)
  }
}

// ===== Toggle status =====
async function handleToggleSingle(row) {
  // Đóng menu More đang mở
  moreMenuId.value = null

  // Xác định trạng thái mới: nếu đang là 1 (Sử dụng) thì chuyển thành 0 (Ngừng sử dụng), ngược lại nếu đang là 0 thì chuyển thành 1
  const newStatus = row.shiftStatus === 1 ? 0 : 1

  try {
    // Gọi API để chuyển trạng thái của ca làm việc, chỉ cần truyền vào một mảng chứa một phần tử là ID của ca làm việc cần chuyển trạng thái và trạng thái mới
    await store.toggleStatus([row.productionShiftID], newStatus)
  } catch (err) {
    toast.error(err.message)
  }
}

// Toggle status hàng loạt
async function handleBatchToggle(status) {
  // lấy ra list id checked
  const ids = store.selectedIdList
  try {
    await store.toggleStatus(ids, status)
  } catch (err) {
    toast.error(err.message)
  }
}

// mở model sửa
// function editFromDetail() {
//   detailVisible.value = false
//   if (detailShift.value) {
//     openEditModal(detailShift.value.productionShiftID)
//   }
// }

// // Hàm xóa từ modal chi tiết
// function deleteFromDetail() {
//   detailVisible.value = false
//   if (detailShift.value) {
//     openDeleteConfirm(detailShift.value.productionShiftID)
//   }
// }

// // Hàm nhân bản từ modal chi tiết
// async function handleDuplicateFromDetail() {
//   detailVisible.value = false
//   if (detailShift.value) {
//     await handleDuplicate(detailShift.value.productionShiftID)
//   }
// }

// ===== Delete =====
// Xóa đơn
function openDeleteConfirm(id) {
  moreMenuId.value = null
  const shift = store.getById(id)
  confirmState.title = 'Xóa Ca làm việc'
  confirmState.message = `Ca làm việc <b>${shift?.productionShiftCode || ''}</b> sau khi bị xóa sẽ không thể khôi phục. Bạn có muốn tiếp tục xóa không?`
  confirmState.onConfirm = () => handleDelete([id])
  confirmState.visible = true
}

// Xóa nhiều sau khi chọn nhiều
function openBatchDeleteConfirm() {
  confirmState.title = 'Xóa Ca làm việc'
  confirmState.message = `<b>${store.selectedIdList.length}</b> ca làm việc sau khi bị xóa sẽ không thể khôi phục. Bạn có muốn tiếp tục xóa không?`
  confirmState.onConfirm = () => handleDelete(store.selectedIdList)
  confirmState.visible = true
}

// Đóng modal Confirm
function closeConfirm() {
  confirmState.visible = false
  confirmState.onConfirm = null
}

// Hàm xử lý khi người dùng xác nhận xóa
async function onConfirm() {
  const callback = confirmState.onConfirm // gửi hành động vào onConfirm để khi người dùng xác nhận thì hàm onConfirm sẽ gọi callback này, callback này được set khi mở confirm modal với đúng hành động cần thực hiện (xóa đơn nào)
  closeConfirm()
  if (callback) await callback()
}

// Hàm xóa ca làm việc, nhận vào một mảng id (có thể là 1 hoặc nhiều id)
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
  mask-position: -48px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.btn-icon--chevron-right {
  mask-position: -64px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
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
  gap: 10px;
  flex-wrap: wrap;
}
.shift-page__toolbar-spacer {
  flex: 1;
}
.shift-page__search {
  position: relative;
  flex-shrink: 0;
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
  border: 1px solid #d1d5db;
  color: #111827;
  background-color: #fff;
  transition: all 0.2s ease;
  cursor: pointer;
  outline: none;
  border-radius: 4px;
  position: relative;
  font-size: 13px;
  height: 28px;
  font-weight: 500;
  flex-shrink: 0;
}
.shift-page__reload:hover {
  border: 1px solid #d1d5db;
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

/* ===== FILTER TAGS (inline trong toolbar) ===== */
.filter-bar__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #111827;
  white-space: nowrap;
  background: #f3f4f6;
  padding: 0 8px;
}

.filter-bar__tag-col {
  color: #374151;
}

.filter-bar__tag-op {
  color: var(--primary);
  font-weight: 500;
}

.filter-bar__tag-val {
  color: #111827;

  font-weight: 500;
}

.filter-bar__tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 10px;
  border-radius: 50%;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.15s;
  margin-left: 2px;
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  mask-position: -96px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}

.shift-page__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid #e5e7eb;
  background-color: #fafafa;
  font-size: 13px;
  color: #111827;
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
  font-weight: 600;
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

.pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.status--active {
  color: var(--primary);
  font-weight: 500;
  background-color: #ebfef6;
  color: #009b71;
  padding: 5px 8px;
  border-radius: 999px;
}
.status--inactive {
  font-weight: 500;
  background-color: #fee2e2;
  color: #dc2626;
  width: -moz-fit-content;
  width: fit-content;
  padding: 5px 8px;
  border-radius: 999px;
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
  background: #fff;
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

/* ===== WARNING DIALOG ===== */
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
  font-weight: 700;
  flex-shrink: 0;
  mask-position: -188px -169px;
  background-color: #ea580c;
  width: 16px;
  height: 14px;
  min-height: 20px;
  min-width: 20px;
  position: relative;
  -webkit-mask-repeat: no-repeat;
  color: #ea580c;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.0.0.36);
}

.warning-dialog__title {
      font-weight: 600;
    color: #111827;
    font-size: 20px;
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

.warning-dialog__body p {
  font-size: 13px;
    max-height: 400px;
    overflow-y: auto;
    font-weight: 400;
    line-height: 20px;
    max-width: 100%;
    overflow-wrap: anywhere;
}
.warning-dialog__footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
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

<!-- Global styles cho teleported dropdown -->
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
