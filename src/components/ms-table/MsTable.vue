<template>
  <div class="ms-table__wrapper">
    <table class="ms-table">
      <thead>
        <tr>
          <th v-if="selectable" class="ms-table__th ms-table__checkbox">
            <input type="checkbox" :checked="allChecked" @change="$emit('toggle-all', $event)" />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            class="ms-table__th"
            :style="col.width ? { width: col.width, minWidth: col.width } : {}"
            :class="{ 'ms-table__th--right': col.align === 'right' }"
          >
            <div class="ms-table__th-content">
              <!-- Tên cột -->
              <span>{{ col.label }}</span>
              <MsColumnFilter
                v-if="col.filterable"
                :label="col.label"
                :property="col.filterKey || col.key"
                :filter-type="col.filterType || 'string'"
                :current-filter="getFilterForCol(col.filterKey || col.key)"
                @apply="(f) => $emit('filter-apply', f)"
                @clear="(prop) => $emit('filter-clear', prop)"
              />
            </div>
          </th>
          <!-- <th v-if="$slots.actions" class="ms-table__th ms-table__th--action"></th> -->
        </tr>
      </thead>

      <tbody>
        <tr v-if="!rows.length">
          <td :colspan="totalCols" class="ms-table__empty">
            <slot name="empty">{{ emptyText }}</slot>
          </td>
        </tr>

        <tr
          v-for="(row, rowIndex) in rows"
          :key="row[rowKey] ?? rowIndex"
          class="ms-table__row"
          :class="{
            'ms-table__row--selected': isSelected(row[rowKey]),
            'ms-table__row--active': row[rowKey] === activeRowId && !isSelected(row[rowKey]),
          }"
          @click="$emit('row-click', row)"
        >
          <td v-if="selectable" class="ms-table__td ms-table__checkbox">
            <input
              type="checkbox"
              :checked="isSelected(row[rowKey])"
              @change="$emit('toggle-row', row[rowKey], $event)"
              @click.stop
            />
          </td>

          <td
            v-for="col in columns"
            :key="col.key"
            class="ms-table__td"
            :class="{ 'ms-table__td--right': col.align === 'right' }"
            :title="col.showTitle ? String(row[col.key] ?? '') : undefined"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] ?? '-' }}
            </slot>
          </td>

          <td v-if="$slots.actions" class="ms-table__td ms-table__col-action">
            <div class="ms-table__action-inner">
              <slot name="actions" :row="row" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MsColumnFilter from './MsColumnFilter.vue'

const props = defineProps({
  columns: { type: Array, required: true }, // đối tượng định nghĩa bảng [{ key, label, width, align, filterable, filterType }]
  rows: { type: Array, default: () => [] }, // [{ id, name, ... }]

  rowKey: { type: String, default: 'id' }, // tên trường làm key cho mỗi row, dùng để xác định row nào được chọn, mặc định là 'id'
  selectable: { type: Boolean, default: false }, // có cho phép chọn nhiều dòng hay không, nếu true sẽ hiển thị checkbox ở đầu mỗi dòng và checkbox chọn tất cả ở header
  allChecked: { type: Boolean, default: false }, // trạng thái của checkbox chọn tất cả, true nếu tất cả các dòng đều được chọn, false nếu có ít nhất một dòng chưa được chọn
  isSelected: { type: Function, default: () => false }, // hàm nhận vào id của một dòng và trả về true nếu dòng đó đang được chọn, false nếu không được chọn
  activeRowId: { type: [String, Number, null], default: null }, // id của dòng đang được hover hoặc active, dùng để highlight dòng đó, chỉ áp dụng khi dòng đó không được chọn
  emptyText: { type: String, default: 'Không có dữ liệu' }, // text hiển thị khi không có dòng nào trong bảng
  activeFilters: { type: Array, default: () => [] }, // [{ Property, Operator, Value }] - mảng các bộ lọc đang được áp dụng trên bảng, mỗi bộ lọc gồm tên cột cần lọc, toán tử và giá trị lọc
})

defineEmits(['toggle-all', 'toggle-row', 'row-click', 'filter-apply', 'filter-clear'])

const totalCols = computed(() => {
  let count = props.columns.length
  if (props.selectable) count++
  return count + 1
})

function getFilterForCol(key) {
  return props.activeFilters.find((f) => f.Property === key) || null
}
</script>

<style scoped>
.ms-table__wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: visible;
  position: relative;
}
.ms-table {
  border-collapse: collapse;
  font-size: 13px;
  width: max-content;
  min-width: 100%;
}

.ms-table__th {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #f0f0f0;
  text-align: left;
  padding: 10px 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f3f4f6 !important;
  white-space: nowrap;
}
.ms-table__th:last-child {
  border-right: 0;
}
.ms-table__th--right {
  text-align: right;
}

.ms-table__th-content {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: space-between;
  cursor: pointer;
  border-right: 1px solid #D1D5DB;
  padding: 0 15px;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
  background-color: #fff;
  border: 1.5px solid #D1D5DB;
  border-radius: 2px;
  appearance: none;
}

.ms-table__th--action {
  width: 72px;
  min-width: 72px;
  position: sticky;
  right: 0;
  background-color: #f9fafb;
  border-left: 1px solid #e5e7eb;
  z-index: 11;
}

.ms-table__td {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ms-table__td--right {
  text-align: right;
}

.ms-table__row:hover {
  background: #e5e7eb;
  cursor: pointer;
}
.ms-table__row--selected {
  background-color: var(--primary-selected-bg, #a4f6d3);
}
.ms-table__row--selected:hover {
  background-color: var(--primary-selected-bg, #a4f6d3);
}

.ms-table__checkbox {
  position: sticky;
  left: 0;
  z-index: 9;
  background: #fff;
  text-align: center;
  width: 40px;
  min-width: 40px;
}

.ms-table__row:hover .ms-table__checkbox {
  background: #e5e7eb;
}
.ms-table__row--selected:hover .ms-table__checkbox,
.ms-table__row--selected:hover .ms-table__col-action {
  background-color: var(--primary-selected-bg, #a4f6d3);
}

.ms-table__row--selected .ms-table__checkbox {
  background-color: var(--primary-selected-bg);
}

.ms-table__col-action {
  position: sticky;
  right: 0;
  z-index: 9;
  background: #fff;
  padding: 4px 6px;
  width: 72px;
  min-width: 72px;
}

.ms-table__action-inner {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ms-table__row:hover .ms-table__col-action {
  background: none;
}

.ms-table__empty {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
  font-size: 14px;
}

.ms-table__row--selected .ms-table__checkbox,
.ms-table__row--selected .ms-table__col-action {
  background-color: var(--primary-selected-bg, #a4f6d3);
}

.ms-table__row--active {
  background-color: #a4f6d3;
}
.ms-table__row--active:hover {
  background-color: #a4f6d3;
}
.ms-table__row--active .ms-table__checkbox {
  background-color: #a4f6d3;
}
.ms-table__row--active .ms-table__col-action {
  background-color: #a4f6d3;
}

input[type="checkbox"]:checked {
  background-color: var(--primary, #009b71);
  border-color: var(--primary, #009b71);
  position: relative;
}
input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  width: 9px;
  height: 5.33px;
  top: -1.5px;
  left: -1px;
  border-width: 0 0 1.5px 1.5px;
  border-style: solid;
  border-color: #fff;
  transform: rotate(-45deg) translateY(5px);
}
</style>
