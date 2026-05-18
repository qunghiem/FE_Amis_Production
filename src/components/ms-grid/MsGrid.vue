<template>
  <div class="ms-grid">
    <!-- ===== TOOLBAR ===== -->
    <div class="ms-grid__toolbar">
      <!-- Search -->
       <div class="ms-grid__search">
        <span class="ms-grid__search-icon"></span>
        <MsInput
          v-model="localSearch"
          :placeholder="searchPlaceholder || $t('common.search')"
        />
      </div>

      <!-- Khi có checkbox được chọn -->
      <template v-if="selectedCount > 0">
        <span class="ms-grid__selected-count">
          {{ $t('common.selected') }} <b>{{ selectedCount }}</b>
        </span>
        <MsButton type="text-primary" @click="clearSelection">
          {{ $t('common.deselect') }}
        </MsButton>
        <slot
          name="batch-actions"
          :selected-ids="selectedIdList"
          :selected-count="selectedCount"
          :selected-rows="selectedRows"
          :clear-selection="clearSelection"
          :has-rows-matching="hasRowsMatching"
        />
      </template>

      <!-- Khi không chọn: hiện filter tags -->
      <template v-else-if="filters.length > 0">
        <div v-for="(filter, idx) in filters" :key="idx" class="ms-grid__filter-tag">
          <span class="ms-grid__filter-tag-col">{{ getColumnLabel(filter.Property) }}</span>
          <span class="ms-grid__filter-tag-op">{{ getOperatorLabel(filter) }}</span>
          <span class="ms-grid__filter-tag-val">{{ getValueLabel(filter) }}</span>
          <button
            class="ms-grid__filter-tag-remove"
            @click="removeFilter(filter.Property)"
          ></button>
        </div>
        <MsButton type="text" @click="$emit('filter-clear-all')">
          {{ $t('filter.clear') }}
        </MsButton>
      </template>

      <div class="ms-grid__toolbar-spacer"></div>

      <!-- Slot cho nút bổ sung (toolbar-extra) -->
      <slot name="toolbar-extra" />

      <!-- Reload -->
      <button
        v-if="selectedCount === 0"
        class="ms-grid__reload"
        :data-tooltip="$t('common.reload')"
        @click="$emit('reload')"
      >
        <span class="ms-grid__reload-icon"></span>
      </button>

      <!-- Xuất Excel -->
      <button
        class="ms-grid__reload ms-grid__export"
        @click="$emit('export')"
        :data-tooltip="$t('common.exportExcel')"
      >
        <span class="ms-grid__reload-export"></span>
      </button>
    </div>

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="loading" class="ms-grid__skeleton-wrapper">
      <table class="ms-grid__skeleton-table">
        <thead>
          <tr>
            <th v-if="selectable" class="ms-grid__skel-th ms-grid__skel-th--checkbox">
              <input type="checkbox" disabled />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              class="ms-grid__skel-th"
              :style="col.width ? { width: col.width, minWidth: col.width } : {}"
            >
              <div class="ms-grid__skel-th-content">{{ col.label }}</div>
            </th>
            <th v-if="hasActions" class="ms-grid__skel-th ms-grid__skel-th--action"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in pageSize" :key="n" class="ms-grid__skel-row">
            <td v-if="selectable" class="ms-grid__skel-td ms-grid__skel-td--checkbox">
              <input type="checkbox" disabled />
            </td>
            <td v-for="col in columns" :key="col.key" class="ms-grid__skel-td">
              <div
                class="ms-grid__skel-bar"
                :style="{ width: (parseInt(col.width) - 40 || 80) + 'px' }"
              ></div>
            </td>
            <td v-if="hasActions" class="ms-grid__skel-td ms-grid__skel-td--action">
              <div class="ms-grid__skel-bar" style="width: 40px"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===== TABLE ===== -->
    <MsTable
      v-show="!loading"
      :columns="columns"
      :rows="rows"
      :row-key="rowKey"
      :selectable="selectable"
      :all-checked="allPageChecked"
      :is-selected="isSelected"
      :active-row-id="activeRowId"
      :active-filters="filters"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      :empty-text="emptyText || $t('common.noData')"
      @toggle-all="toggleAll"
      @toggle-row="(id) => toggleSelect(id)"
      @row-click="handleRowClick"
      @row-dblclick="(row) => $emit('row-dblclick', row)"
      @filter-apply="(f) => $emit('filter-apply', f)"
      @filter-clear="(prop) => $emit('filter-clear', prop)"
      @sort-change="(s) => $emit('sort-change', s)"
    >
      <!-- Forward cell-xxx slots -->
      <template v-for="col in columns" :key="col.key" #[`cell-${col.key}`]="slotData">
        <slot :name="`cell-${col.key}`" v-bind="slotData">
          {{ slotData.value ?? '-' }}
        </slot>
      </template>

      <!-- Forward actions slot -->
      <template v-if="hasActions" #actions="{ row }">
        <slot name="actions" :row="row" />
      </template>

      <!-- Forward empty slot -->
      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
    </MsTable>

    <!-- ===== PAGINATION FOOTER ===== -->
    <div class="ms-grid__footer">
      <span
        >{{ $t('common.total') }}: <b>{{ total }}</b></span
      >
      <div class="ms-grid__pagination">
        <span>{{ $t('common.rowsPerPage') }}</span>
        <MsPageSizeSelect
          :model-value="pageSize"
          :options="pageSizeOptions"
          @update:model-value="handlePageSizeChange"
        />
        <span class="ms-grid__pagination-range">{{ pageStart }} - {{ pageEnd }}</span>

        <button
          class="ms-grid__pagination-btn"
          :disabled="isFirstPage"
          :title="$t('common.firstPage')"
          @click="$emit('update:page', 1)"
        >
          <span class="ms-grid__btn-icon ms-grid__btn-icon--first-page"></span>
        </button>
        <button
          class="ms-grid__pagination-btn"
          :disabled="isFirstPage"
          @click="$emit('update:page', page - 1)"
        >
          <span class="ms-grid__btn-icon ms-grid__btn-icon--chevron-left"></span>
        </button>
        <button
          class="ms-grid__pagination-btn"
          :disabled="isLastPage"
          @click="$emit('update:page', page + 1)"
        >
          <span class="ms-grid__btn-icon ms-grid__btn-icon--chevron-right"></span>
        </button>
        <button
          class="ms-grid__pagination-btn"
          :disabled="isLastPage"
          :title="$t('common.lastPage')"
          @click="$emit('update:page', totalPages)"
        >
          <span class="ms-grid__btn-icon ms-grid__btn-icon--last-page"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
import MsTable from '@/components/ms-table/MsTable.vue'
import MsButton from '@/components/ms-button/MsButton.vue'
import MsInput from '@/components/ms-input/MsInput.vue'
import MsPageSizeSelect from '@/components/ms-page-size-select/MsPageSizeSelect.vue'

const { t } = useI18n()
const slots = useSlots()

// ──────────────────────── PROPS ────────────────────────
const props = defineProps({
  /** Mảng định nghĩa cột: { key, label, width, align, filterable, filterType, filterKey, filterOptions, sortKey } */
  columns: { type: Array, required: true },
  /** Dữ liệu các dòng hiển thị trên trang hiện tại */
  rows: { type: Array, default: () => [] },
  /** Tên trường làm key cho mỗi row (mặc định 'id') */
  rowKey: { type: String, default: 'id' },
  /** Tổng số bản ghi (dùng để tính phân trang) */
  total: { type: Number, default: 0 },
  /** Trạng thái đang tải */
  loading: { type: Boolean, default: false },
  /** Cho phép chọn dòng bằng checkbox */
  selectable: { type: Boolean, default: true },

  // ── Pagination ──
  /** Trang hiện tại (bắt đầu từ 1) */
  page: { type: Number, default: 1 },
  /** Số dòng trên mỗi trang */
  pageSize: { type: Number, default: 10 },
  /** Danh sách lựa chọn số dòng/trang */
  pageSizeOptions: { type: Array, default: () => [10, 20, 50, 100] },

  // ── Search ──
  /** Từ khóa tìm kiếm, dùng v-model:search */
  search: { type: String, default: '' },
  /** Placeholder cho ô tìm kiếm */
  searchPlaceholder: { type: String, default: '' },

  // ── Sort ──
  /** Trường đang sắp xếp */
  sortBy: { type: String, default: '' },
  /** Hướng sắp xếp: ASC | DESC */
  sortDirection: { type: String, default: 'ASC' },

  // ── Filter ──
  /** Mảng bộ lọc đang áp dụng: [{ Property, Operator, Value }] */
  filters: { type: Array, default: () => [] },

  // ── UI ──
  /** Text hiển thị khi bảng rỗng */
  emptyText: { type: String, default: '' },
})

//  EMITS
const emit = defineEmits([
  'update:page',
  'update:page-size',
  'update:search',
  'sort-change',
  'filter-apply',
  'filter-clear',
  'filter-clear-all',
  'reload',
  'row-click',
  'row-dblclick',
  'selection-change',
  'export',
])

// SEARCH
// đọc và set dữ liệu
const localSearch = computed({
  get: () => props.search,
  set: (v) => emit('update:search', v),
})

//PAGINATION
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const isFirstPage = computed(() => props.page <= 1)
const isLastPage = computed(() => props.page >= totalPages.value)
const pageStart = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const pageEnd = computed(() => Math.min(props.page * props.pageSize, props.total))

// khi thay đổi page size
function handlePageSizeChange(newSize) {
  emit('update:page-size', newSize)
}

// SELECTION
const selectedIds = ref(new Set()) // danh sách ID đang chọn

const selectedCount = computed(() => selectedIds.value.size) // số lượng ID đang tích chọn
const selectedIdList = computed(() => Array.from(selectedIds.value)) // danh sách ID đang chọn

// Chỉ trả về các row đang hiển thị VÀ được chọn
const selectedRows = computed(() =>
  props.rows.filter((r) => selectedIds.value.has(r[props.rowKey])),
)

// ô checkall có được tích chọn k
const allPageChecked = computed(
  () => props.rows.length > 0 && props.rows.every((r) => selectedIds.value.has(r[props.rowKey])),
)

// kiểm tra dóng đó có đang được chọn k
function isSelected(id) {
  return selectedIds.value.has(id)
}

// Toggle tích chọn 1 row
function toggleSelect(id) {
  const s = new Set(selectedIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selectedIds.value = s
  // emitSelectionChange()
}

// click tích ô chọn tất cả
function toggleAll(e) {
  // lấy tất cả id trên trang hiện tại
  const ids = props.rows.map((r) => r[props.rowKey])
  // nếu là tích chọn
  if (e.target.checked) {
    const s = new Set(selectedIds.value)
    ids.forEach((id) => s.add(id))
    selectedIds.value = s
  } else { // nếu là bỏ tích chọn
    selectedIds.value = new Set()
  }
  // emitSelectionChange()
}

// bỏ chọn tất cả
function clearSelection() {
  selectedIds.value = new Set()
  // emitSelectionChange()
}

/**
 * Xóa các ID đã cho khỏi selection (ví dụ sau khi xóa / toggle status)
 * Gọi từ component cha: gridRef.value.deselectIds([...])
 */
function deselectIds(ids) {
  const s = new Set(selectedIds.value)
  ids.forEach((id) => s.delete(id))
  selectedIds.value = s
  // emitSelectionChange()
}

// function emitSelectionChange() {
//   emit('selection-change', {
//     ids: selectedIdList.value,
//     count: selectedCount.value,
//   })
// }

/**
 * Kiểm tra trong các row đang chọn (trên trang hiện tại) có row nào thỏa điều kiện không: đang sử dụng, ngưng sd
 * Dùng trong slot batch-actions:
 *   v-if="hasRowsMatching(r => r.shiftStatus === 1)"
 */
function hasRowsMatching(predicate) {
  return props.rows.some((r) => selectedIds.value.has(r[props.rowKey]) && predicate(r))
}

//  ACTIVE ROW
const activeRowId = ref(null) //lưu id dòng đang được active

// click vào dòng thì sáng lên click lại thì tắt
function handleRowClick(row) {
  // lấy id của bản ghi
  const id = row[props.rowKey]
  // Nếu ID của dòng vừa click trùng với ID đang lưu trong activeRowId thì tắt
  activeRowId.value = activeRowId.value === id ? null : id
  // emit('row-click', row)
}

//  HAS ACTIONS SLOT
const hasActions = computed(() => !!slots.actions)

// get ra label để hiện lên thanh bar khi có lọc
function getColumnLabel(property) {
  const col = props.columns.find((c) => c.key === property || c.filterKey === property)
  return col?.label || property
}

// get ra toán tử để hiện lên thanh bar khi có lọc
function getOperatorLabel(filter) {
  const col = props.columns.find(
    (c) => c.key === filter.Property || c.filterKey === filter.Property,
  )
  if (col?.filterType === 'status') return ''
  return t(`filter.operators.${filter.Operator}`)
}

// get ra giá trị để hiện lên thanh bar khi có lọc
function getValueLabel(filter) {
  // tìm xem bộ lọc thuộc côt nào
  const col = props.columns.find(
    (c) => c.key === filter.Property || c.filterKey === filter.Property,
  )
  // nếu là lọc cột trạng thái
  if (col?.filterType === 'status' && col.filterOptions) {
    // kiểm tra xem giá trị lọc trùng với lựa chọn nào trong filterOptions
    const opt = col.filterOptions.find((o) => String(o.value) === String(filter.Value))
    return opt?.label || filter.Value // trả về label
  }
  // nếu k thuộc status thì hiện luôn cái user nhập
  return filter.Value
}

// xóa lọc theo cột nào đó
function removeFilter(property) {
  emit('filter-clear', property)
}

// EXPOSE để cha có thể thò tay xuống lấy được
defineExpose({
  /** Bỏ chọn tất cả */
  clearSelection,
  /** Bỏ chọn các ID cụ thể (sau khi xóa / toggle) */
  deselectIds,
  /** Danh sách ID đang chọn */
  selectedIdList,
  /** Số lượng đang chọn */
  selectedCount,
  /** Các row đang chọn trên trang hiện tại */
  selectedRows,
  /** Kiểm tra có row chọn nào thỏa điều kiện */
  hasRowsMatching,
})
</script>

<style scoped>
/* ===== GRID CONTAINER ===== */
.ms-grid {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* ===== TOOLBAR ===== */
.ms-grid__toolbar {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ms-grid__toolbar-spacer {
  flex: 1;
}

/* Search */
.ms-grid__search {
  position: relative;
  flex-shrink: 0;
}

.ms-grid__search-icon {
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

/* Selected count */
.ms-grid__selected-count {
  font-size: 13px;
  color: #374151;
}

/* Filter tags */
.ms-grid__filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #111827;
  white-space: nowrap;
  background: #f3f4f6;
  padding: 0 8px;
}

.ms-grid__filter-tag-col {
  color: #374151;
}

.ms-grid__filter-tag-op {
  color: var(--primary);
  font-weight: 500;
}

.ms-grid__filter-tag-val {
  color: #111827;
  font-weight: 500;
}

.ms-grid__filter-tag-remove {
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

/* Reload */
.ms-grid__reload {
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

.ms-grid__reload:hover {
  border: 1px solid #d1d5db;
  color: var(--primary);
  background-color: #f3f4f6;
}

.ms-grid__reload-icon {
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  mask-position: -112px 0px;
  position: relative;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
  display: inline-block;
}

.ms-grid__reload-export {
  mask-position: -976px 0px;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  position: relative;
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}
/* ===== SKELETON ===== */
.ms-grid__skeleton-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: visible;
}

.ms-grid__skeleton-table {
  border-collapse: collapse;
  font-size: 13px;
  width: max-content;
  min-width: 100%;
}

.ms-grid__skel-th {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  padding: 10px 0;
  background-color: #f3f4f6;
  white-space: nowrap;
}

.ms-grid__skel-th-content {
  padding: 0 15px;
  border-left: 1px solid #d1d5db;
}

.ms-grid__skel-th--checkbox {
  text-align: center;
  width: 40px;
  min-width: 40px;
}

.ms-grid__skel-th--action {
  width: 72px;
  min-width: 72px;
}

.ms-grid__skel-td {
  padding: 8px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.ms-grid__skel-td--checkbox {
  text-align: center;
  width: 40px;
}

.ms-grid__skel-td--action {
  width: 72px;
}

.ms-grid__skel-bar {
  height: 14px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: ms-grid-shimmer 1.5s ease-in-out infinite;
  border-radius: 3px;
}

@keyframes ms-grid-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ===== PAGINATION FOOTER ===== */
.ms-grid__footer {
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

.ms-grid__pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ms-grid__pagination-range {
  min-width: 50px;
  text-align: center;
  font-weight: 600;
}

.ms-grid__pagination-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #fafafa;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.ms-grid__pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Pagination icons */
.ms-grid__btn-icon {
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

.ms-grid__btn-icon--first-page {
  mask-position: -143px 0px;
  background-color: #9ca3af;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}

.ms-grid__btn-icon--last-page {
  mask-position: -160px 0px;
  background-color: #4b5563;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}

.ms-grid__btn-icon--chevron-left {
  mask-position: -48px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}

.ms-grid__btn-icon--chevron-right {
  mask-position: -64px 0px;
  -webkit-mask-image: url(https://demoqtsxcdn.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.0.0.36);
}

/* Skeleton checkbox (reuse global checkbox style) */
.ms-grid__skel-th--checkbox input[type='checkbox'],
.ms-grid__skel-td--checkbox input[type='checkbox'] {
  width: 16px;
  height: 16px;
  background-color: #fff;
  border: 1.5px solid #d1d5db;
  border-radius: 2px;
  appearance: none;
}

.ms-grid__search :deep(.ms-input__wrapper) {
  gap: 0;
}
.ms-grid__search :deep(.ms-input__field) {
  padding: 5px 0px 5px 36px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  background-color: #fff;
  font-family: inherit;
  height: 28px;
}
.ms-grid__search :deep(.ms-input__field:hover) {
  border-color: #9ca3af;
}
.ms-grid__search :deep(.ms-input__field:focus) {
  border-color: var(--primary);
}
</style>
