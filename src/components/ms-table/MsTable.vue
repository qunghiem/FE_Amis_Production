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
              <span>{{ col.label }}</span>
              <MsColumnFilter
                v-if="col.filterable"
                :label="col.label"
                :property="col.key"
                :filter-type="col.filterType || 'string'"
                :current-filter="getFilterForCol(col.key)"
                @apply="(f) => $emit('filter-apply', f)"
                @clear="(prop) => $emit('filter-clear', prop)"
              />
            </div>
          </th>
          <th v-if="$slots.actions" class="ms-table__th ms-table__th--action"></th>
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
          :class="{ 'ms-table__row--selected': isSelected(row[rowKey]) }"
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
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  selectable: { type: Boolean, default: false },
  allChecked: { type: Boolean, default: false },
  isSelected: { type: Function, default: () => false },
  emptyText: { type: String, default: 'Không có dữ liệu' },
  activeFilters: { type: Array, default: () => [] },
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
  overflow: auto;
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
  color: #020305;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #f0f0f0;
  text-align: left;
  padding: 10px 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f9fafb;
  white-space: nowrap;
}
.ms-table__th:last-child { border-right: 0; }
.ms-table__th--right { text-align: right; }

.ms-table__th-content {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: space-between;
  cursor: pointer;
}

/* Action header: vừa 2 icon (28px x2 + gap) */
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
.ms-table__td--right { text-align: right; }

.ms-table__row:hover { background: #f0fdf4; cursor: pointer; }
.ms-table__row--selected { background-color: var(--primary-selected-bg, #a4f6d3); }
.ms-table__row--selected:hover { background-color: var(--primary-selected-bg, #a4f6d3); }

.ms-table__checkbox {
  position: sticky;
  left: 0;
  z-index: 9;
  background: #fff;
  text-align: center;
  width: 40px;
  min-width: 40px;
}
.ms-table__row:hover .ms-table__checkbox { background: #f0fdf4; }
.ms-table__row--selected .ms-table__checkbox { background-color: var(--primary-selected-bg); }

/* Action cell: sticky phải, luôn hiển thị */
.ms-table__col-action {
  position: sticky;
  right: 0;
  z-index: 9;
  background: #fff;
  border-left: 1px solid #f0f0f0;
  padding: 4px 6px;
  width: 72px;
  min-width: 72px;
}

.ms-table__action-inner {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ms-table__row:hover .ms-table__col-action { background: #f0fdf4; }

.ms-table__empty {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
  font-size: 14px;
}
</style>
