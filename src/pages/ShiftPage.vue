<template>
  <main class="layout__content">
    <!-- Title header -->
    <div class="shift-page__header">
      <h1 class="shift-page__title">{{ $t('shift.pageTitle') }}</h1>
      <div class="shift-page__actions">
        <button class="btn btn--primary" @click="openAddModal">
          <span class="btn-icon btn-icon--plus"></span>
          {{ $t('shift.add') }}
        </button>
      </div>
    </div>

    <!-- Content container -->
    <div class="shift-page__content">
      <!-- Toolbar -->
      <div class="shift-page__toolbar">
        <div class="shift-page__search">
          <span class="shift-page__search-icon"></span>
          <input
            type="text"
            class="shift-page__search-input"
            :placeholder="$t('common.search')"
            v-model="store.searchKeyword"
          />
        </div>

        <!-- Khi có checkbox được chọn -->
        <template v-if="store.selectedCount > 0">
          <span class="selected-bar__count"
            >{{ $t('common.selected') }} <b>{{ store.selectedCount }}</b></span
          >
          <MsButton type="text-primary" @click="store.unselectAll()">{{
            $t('common.deselect')
          }}</MsButton>
          <MsButton
            v-if="store.hasInactiveInSelected"
            type="primary-outline"
            @click="handleBatchToggle(1)"
          >
            <span
              class="dropdown-icon dropdown-icon--toggle"
              style="background-color: var(--primary)"
            ></span>
            {{ $t('shift.actions.use') }}
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
            {{ $t('shift.actions.stopUse') }}
          </MsButton>
          <MsButton type="danger-outline" @click="openBatchDeleteConfirm">{{
            $t('shift.actions.delete')
          }}</MsButton>
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
          <MsButton type="text" @click="clearAllFilters">{{ $t('filter.clear') }}</MsButton>
        </template>

        <div class="shift-page__toolbar-spacer"></div>

        <button
          class="shift-page__reload"
          @click="store.fetchPage()"
          :data-tooltip="$t('common.reload')"
        >
          <span class="btn-icon btn-icon--reload"></span>
        </button>
      </div>

      <!-- Skeleton loading -->
      <div v-if="store.loading" class="shift-page__skeleton-wrapper">
        <table class="skeleton-table">
          <thead>
            <tr>
              <th class="skeleton-th skeleton-th--checkbox"><input type="checkbox" disabled /></th>
              <th
                v-for="col in COLUMNS"
                :key="col.key"
                class="skeleton-th"
                :style="col.width ? { width: col.width, minWidth: col.width } : {}"
              >
                <div class="skeleton-th__content">{{ col.label }}</div>
              </th>
              <th class="skeleton-th skeleton-th--action"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in store.pageSize" :key="n" class="skeleton-row">
              <td class="skeleton-td skeleton-td--checkbox"><input type="checkbox" disabled /></td>
              <td v-for="col in COLUMNS" :key="col.key" class="skeleton-td">
                <div
                  class="skeleton-bar"
                  :style="{ width: (parseInt(col.width) - 40 || 80) + 'px' }"
                ></div>
              </td>
              <td class="skeleton-td skeleton-td--action">
                <div class="skeleton-bar" style="width: 40px"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table -->
      <MsTable
        v-show="!store.loading"
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
        :empty-text="$t('shift.empty')"
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
        <template #cell-workHour="{ row }">
          <span :class="{ 'text-orange': row.workHour < 0 }">
            {{ row.workHour != null ? row.workHour : '-' }}
          </span>
        </template>

        <template #cell-breakHour="{ row }">
          {{ row.breakHour != null ? row.breakHour : 0 }}
        </template>

        <template #cell-shiftStatus="{ row }">
          <span :class="row.shiftStatus === 1 ? 'status--active' : 'status--inactive'">
            {{ row.shiftStatus === 1 ? $t('shift.status.active') : $t('shift.status.inactive') }}
          </span>
        </template>

        <template #actions="{ row }">
          <button
            class="action-btn"
            :title="$t('shift.actions.edit')"
            @click.stop="openEditModal(row.productionShiftID)"
          >
            <span class="action-icon action-icon--edit"></span>
          </button>
          <button
            class="action-btn"
            :title="$t('shift.actions.moreOptions')"
            @click.stop="toggleMoreMenu(row.productionShiftID, $event)"
          >
            <span class="action-icon action-icon--more"></span>
          </button>
        </template>
      </MsTable>

      <!-- Footer pagination -->
      <div class="shift-page__footer">
        <span
          >{{ $t('common.total') }}: <b>{{ store.pageInfo.total }}</b></span
        >
        <div class="shift-page__pagination">
          <span>{{ $t('common.rowsPerPage') }}</span>
          <select
            :value="store.pageSize"
            @change="(e) => store.setPageSize(Number(e.target.value))"
          >
            <option v-for="n in [10, 20, 50, 100]" :key="n" :value="n">{{ n }}</option>
          </select>
          <span class="pagination__range"
            >{{ store.pageInfo.start }} - {{ store.pageInfo.end }}</span
          >
          <button
            class="pagination__btn"
            :disabled="store.isFirstPage"
            @click="store.goToFirstPage()"
            :title="$t('common.firstPage')"
          >
            <span class="btn-icon btn-icon--first-page"></span>
          </button>
          <button class="pagination__btn" :disabled="store.isFirstPage" @click="store.prevPage()">
            <span class="btn-icon btn-icon--chevron-left"></span>
          </button>
          <button class="pagination__btn" :disabled="store.isLastPage" @click="store.nextPage()">
            <span class="btn-icon btn-icon--chevron-right"></span>
          </button>
          <button
            class="pagination__btn"
            :disabled="store.isLastPage"
            @click="store.goToLastPage()"
            :title="$t('common.lastPage')"
          >
            <span class="btn-icon btn-icon--last-page"></span>
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

  <!-- ===== More dropdown ===== -->
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
          {{ $t('shift.actions.duplicate') }}
        </div>
        <div class="action-more__item" @click="handleToggleSingle(moreMenuRow)">
          <span class="dropdown-icon dropdown-icon--toggle"></span>
          {{
            moreMenuRow.shiftStatus === 1 ? $t('shift.actions.stopUse') : $t('shift.actions.use')
          }}
        </div>
        <div
          class="action-more__item action-more__item--danger"
          @click="openDeleteConfirm(moreMenuId)"
        >
          <span class="dropdown-icon dropdown-icon--delete"></span>
          {{ $t('shift.actions.delete') }}
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
    :confirm-text="$t('common.delete')"
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
            <span class="warning-dialog__title">{{ $t('dialog.warning') }}</span>
          </div>
          <button class="warning-dialog__close" @click="closeWarning">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="warning-dialog__body">
          <p v-html="warningState.message"></p>
        </div>
        <div class="warning-dialog__footer">
          <button class="warning-dialog__btn" @click="closeWarning">
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useShiftStore } from '@/stores/shiftStore'
import { useToast } from '@/composables/useToast'
import MsTable from '@/components/ms-table/MsTable.vue'
import MsButton from '@/components/ms-button/MsButton.vue'
import ShiftForm from '@/components/ShiftForm.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { ApiError } from '@/services/api'

const { t } = useI18n()
const shiftFormRef = ref(null)
const store = useShiftStore()
const toast = useToast()
const activeRowId = ref(null)

// ===== Columns config =====
const COLUMNS = computed(() => [
  {
    key: 'productionShiftCode',
    label: t('shift.columns.code'),
    width: '120px',
    filterable: true,
    filterType: 'string',
  },
  {
    key: 'productionShiftName',
    label: t('shift.columns.name'),
    width: '250px',
    filterable: true,
    filterType: 'string',
  },
  {
    key: 'startTimeDisplay',
    label: t('shift.columns.startTime'),
    width: '130px',
    sortKey: 'startTime',
  },
  { key: 'endTimeDisplay', label: t('shift.columns.endTime'), width: '130px', sortKey: 'endTime' },
  {
    key: 'breakStartTimeDisplay',
    label: t('shift.columns.breakStart'),
    width: '165px',
    sortKey: 'breakStartTime',
  },
  {
    key: 'breakEndTimeDisplay',
    label: t('shift.columns.breakEnd'),
    width: '165px',
    sortKey: 'breakEndTime',
  },
  {
    key: 'workHour',
    label: t('shift.columns.workHour'),
    width: '230px',
    align: 'right',
    filterable: true,
    filterType: 'number',
  },
  {
    key: 'breakHour',
    label: t('shift.columns.breakHour'),
    width: '230px',
    align: 'right',
    filterable: true,
    filterType: 'number',
  },
  {
    key: 'shiftStatus',
    label: t('shift.columns.status'),
    width: '140px',
    filterable: true,
    filterType: 'status',
  },
  {
    key: 'createdBy',
    label: t('shift.columns.createdBy'),
    width: '150px',
    filterable: true,
    filterType: 'string',
  },
  {
    key: 'createdDateDisplay',
    label: t('shift.columns.createdDate'),
    width: '150px',
    filterable: true,
    filterType: 'date',
    filterKey: 'CreatedDate',
    sortKey: 'createdDate',
  },
  {
    key: 'modifiedBy',
    label: t('shift.columns.modifiedBy'),
    width: '150px',
    filterable: true,
    filterType: 'string',
  },
  {
    key: 'modifiedDateDisplay',
    label: t('shift.columns.modifiedDate'),
    width: '150px',
    filterable: true,
    filterType: 'date',
    filterKey: 'ModifiedDate',
    sortKey: 'modifiedDate',
  },
])

// ===== Map operator → label =====
function getColumnLabel(property) {
  const col = COLUMNS.value.find((c) => c.key === property || c.filterKey === property)
  return col?.label || property
}

function getOperatorLabel(filter) {
  const col = COLUMNS.value.find(
    (c) => c.key === filter.Property || c.filterKey === filter.Property,
  )
  if (col?.filterType === 'status') return ''
  return t(`filter.operators.${filter.Operator}`)
}

function getValueLabel(filter) {
  const col = COLUMNS.value.find(
    (c) => c.key === filter.Property || c.filterKey === filter.Property,
  )
  if (col?.filterType === 'status') {
    return filter.Value === '1' || filter.Value === 1
      ? t('shift.status.active')
      : t('shift.status.inactive')
  }
  return filter.Value
}

// ===== State =====
const formVisible = ref(false)
const editingShift = ref(null)
const moreMenuId = ref(null)
const moreMenuPos = reactive({ top: 0, left: 0 })
const moreMenuRow = computed(() =>
  moreMenuId.value !== null ? store.getById(moreMenuId.value) : null,
)

const confirmState = reactive({ visible: false, title: '', message: '', onConfirm: null })
const warningState = reactive({ visible: false, message: '' })

function showWarning(message) {
  warningState.message = message
  warningState.visible = true
}
function closeWarning() {
  warningState.visible = false
  warningState.message = ''
}

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
  if (idx >= 0) store.filters.splice(idx, 1, filter)
  else store.filters.push(filter)
  store.resetPage()
  store.fetchPage()
}

function handleFilterClear(property) {
  const idx = store.filters.findIndex((f) => f.Property === property)
  if (idx >= 0) store.filters.splice(idx, 1)
  store.resetPage()
  store.fetchPage()
}

function removeFilter(property) {
  handleFilterClear(property)
}

function clearAllFilters() {
  store.filters.splice(0, store.filters.length)
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

// ===== Sort =====
function handleSortChange({ sortBy: newSortBy, sortDirection: newDir }) {
  store.sortBy = newSortBy
  store.sortDirection = newDir
  store.resetPage()
  store.fetchPage()
}

async function handleSaved(data) {
  const isEdit = !!data.productionShiftID
  const isSaveAndAdd = data._action === 'save-and-add'
  const tid = toast.loading(isEdit ? t('shift.toast.updating') : t('shift.toast.adding'))

  try {
    isEdit ? await store.updateShift(data) : await store.addShift(data)
    toast.update(
      tid,
      isEdit ? t('shift.toast.updateSuccess') : t('shift.toast.addSuccess'),
      'success',
    )
    if (isSaveAndAdd) shiftFormRef.value?.resetForm()
    else closeModal()
  } catch (err) {
    toast.remove(tid)
    shiftFormRef.value?.resetSaving()
    if (err instanceof ApiError && err.errors?.length > 0) {
      showWarning(err.errors.join('<br>'))
    } else {
      toast.error(err.message)
    }
  }
}

// ===== Duplicate =====
async function handleDuplicate(id) {
  moreMenuId.value = null
  try {
    const duplicated = await store.duplicateShift(id)
    editingShift.value = { ...duplicated, productionShiftID: null }
    formVisible.value = true
  } catch (err) {
    toast.update(err.message)
  }
}

// ===== Toggle status =====
async function handleToggleSingle(row) {
  moreMenuId.value = null
  const newStatus = row.shiftStatus === 1 ? 0 : 1
  try {
    await store.toggleStatus([row.productionShiftID], newStatus)
  } catch (err) {
    toast.error(err.message)
  }
}

async function handleBatchToggle(status) {
  const ids = store.selectedIdList
  try {
    await store.toggleStatus(ids, status)
  } catch (err) {
    toast.error(err.message)
  }
}

// ===== Delete =====
function openDeleteConfirm(id) {
  moreMenuId.value = null
  const shift = store.getById(id)
  confirmState.title = t('shift.confirm.deleteTitle')
  confirmState.message = t('shift.confirm.deleteSingle', { code: shift?.productionShiftCode || '' })
  confirmState.onConfirm = () => handleDelete([id])
  confirmState.visible = true
}

function openBatchDeleteConfirm() {
  confirmState.title = t('shift.confirm.deleteTitle')
  confirmState.message = t('shift.confirm.deleteBatch', { count: store.selectedIdList.length })
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
  const tid = toast.loading(t('shift.toast.deleting'))
  try {
    await store.deleteByIds(ids)
    toast.update(tid, t('shift.toast.deleteSuccess', { count: ids.length }), 'success')
  } catch (err) {
    toast.update(tid, err.message, 'error')
  }
}
</script>

<style scoped>
/* Giữ nguyên toàn bộ CSS gốc */
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
.selected-bar__count {
  font-size: 13px;
  color: #374151;
}
.selected-bar__separator {
  width: 1px;
  height: 20px;
  background: #d1d5db;
}
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
  width: fit-content;
  padding: 5px 8px;
  border-radius: 999px;
}
.text-orange {
  color: #ea580c;
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
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s;
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
.shift-page__skeleton-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: visible;
}
.skeleton-table {
  border-collapse: collapse;
  font-size: 13px;
  width: max-content;
  min-width: 100%;
}
.skeleton-th {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  padding: 10px 0;
  background-color: #f3f4f6;
  white-space: nowrap;
}
.skeleton-th__content {
  padding: 0 15px;
  border-left: 1px solid #d1d5db;
}
.skeleton-th--checkbox {
  text-align: center;
  width: 40px;
  min-width: 40px;
}
.skeleton-th--action {
  width: 72px;
  min-width: 72px;
}
.skeleton-td {
  padding: 8px 15px;
  border-bottom: 1px solid #f0f0f0;
}
.skeleton-td--checkbox {
  text-align: center;
  width: 40px;
}
.skeleton-td--action {
  width: 72px;
}
.skeleton-bar {
  height: 14px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 3px;
}
@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

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
      margin-right: 5px;
  mask-position: -192px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.dropdown-icon--delete {
  mask-position: -208px 0px;
  background-color: #dc2626 !important;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.btn-icon--first-page {
  mask-position: -143px 0px;
  background-color: #9ca3af;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  position: relative;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
.btn-icon--last-page {
  mask-position: -160px 0px;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  position: relative;
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
</style>
