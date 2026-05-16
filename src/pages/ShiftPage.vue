

<template>
  <main class="layout__content">
    <!-- ===== PAGE HEADER ===== -->
    <div class="shift-page__header">
      <h1 class="shift-page__title">{{ $t('shift.pageTitle') }}</h1>
      <div class="shift-page__actions">
        <button class="btn btn--primary" @click="openAddModal">
          <span class="btn-icon btn-icon--plus"></span>
          {{ $t('shift.add') }}
        </button>

      </div>
    </div>

    <!-- ===== GRID ===== -->
    <MsGrid
      ref="gridRef"
      :columns="columns"
      :rows="store.pageData"
      :total="store.pageInfo.total"
      :loading="store.loading"
      row-key="productionShiftID"
      v-model:search="store.searchKeyword"
      :page="store.currentPage"
      :page-size="store.pageSize"
      :sort-by="store.sortBy"
      :sort-direction="store.sortDirection"
      :filters="store.filters"
      :empty-text="$t('shift.empty')"
      @update:page="(p) => (store.currentPage = p)"
      @update:page-size="(s) => store.setPageSize(s)"
      @sort-change="handleSortChange"
      @filter-apply="handleFilterApply"
      @filter-clear="handleFilterClear"
      @filter-clear-all="clearAllFilters"
      @reload="store.fetchPage()"
      @export="handleExport"
      @row-dblclick="(row) => openEditModal(row.productionShiftID)"
    >
      <!-- Batch actions khi có checkbox được chọn -->
      <template #batch-actions="{ selectedIds, hasRowsMatching }">
        <MsButton
          v-if="hasRowsMatching((r) => r.shiftStatus === 0)"
          type="primary-outline"
          @click="handleBatchToggle(selectedIds, 1)"
        >
          <span
            class="dropdown-icon dropdown-icon--toggle"
            style="background-color: var(--primary)"
          ></span>
          {{ $t('shift.actions.use') }}
        </MsButton>
        <MsButton
          v-if="hasRowsMatching((r) => r.shiftStatus === 1)"
          type="danger-outline"
          @click="handleBatchToggle(selectedIds, 0)"
        >
          <span
            class="dropdown-icon dropdown-icon--toggle"
            style="background-color: #dc2626"
          ></span>
          {{ $t('shift.actions.stopUse') }}
        </MsButton>
        <MsButton type="danger-outline" @click="openBatchDeleteConfirm(selectedIds)">
          {{ $t('shift.actions.delete') }}
        </MsButton>
      </template>

      <!-- Custom cell: Thời gian làm việc -->
      <template #cell-workHour="{ row }">
        <span :class="{ 'text-orange': row.workHour < 0 }">
          {{ row.workHour != null ? row.workHour : '-' }}
        </span>
      </template>

      <!-- Custom cell: Thời gian nghỉ -->
      <template #cell-breakHour="{ row }">
        {{ row.breakHour != null ? row.breakHour : 0 }}
      </template>

      <!-- Custom cell: Trạng thái -->
      <template #cell-shiftStatus="{ row }">
        <span :class="row.shiftStatus === 1 ? 'status--active' : 'status--inactive'">
          {{ row.shiftStatus === 1 ? $t('shift.status.active') : $t('shift.status.inactive') }}
        </span>
      </template>

      <!-- Row actions -->
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
    </MsGrid>

    <!-- Error -->
    <div v-if="store.error" class="shift-page__error">
      {{ store.error }}
      <button @click="store.fetchPage()">{{ $t('common.reload') }}</button>
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
          <span class="dropdown-icon dropdown-icon--toggle icon-stop--use"></span>
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
    :editingItem="editingItem"
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
    <div
      v-if="warningState.visible"
      class="warning-overlay"
      tabindex="-1"
      ref="warningOverlayRef"
      @click.self="closeWarning"
      @keydown.esc.stop="closeWarning"
    >
      <div class="warning-dialog">
        <div class="warning-dialog__header">
          <div class="warning-dialog__title-row">
            <span class="warning-dialog__icon"></span>
            <span class="warning-dialog__title">{{ $t('dialog.warning') }}</span>
          </div>
          <button class="warning-dialog__close" @click="closeWarning">&times;</button>
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

<script>
import baseList from '@/base/baseList'
import { useShiftStore } from '@/stores/shiftStore'
import MsGrid from '@/components/ms-grid/MsGrid.vue'
import MsButton from '@/components/ms-button/MsButton.vue'
import ShiftForm from '@/components/ShiftForm.vue' // form kế thừa baseDetail
import ConfirmModal from '@/components/ConfirmModal.vue'

export default {
  name: 'ShiftPage',

  // Kế thừa toàn bộ logic base
  extends: baseList,

  components: { MsGrid, MsButton, ShiftForm, ConfirmModal },

  data() {
    return {
      // Config riêng cho Shift
      entityName: 'shift',
      rowKey: 'productionShiftID',
    }
  },

  computed: {
    // ★ Override columns — phần DUY NHẤT khác nhau giữa các entity
    columns() {
      return [
        {
          key: 'productionShiftCode',
          label: this.$t('shift.columns.code'),
          width: '120px',
          filterable: true,
          filterType: 'string',
        },
        {
          key: 'productionShiftName',
          label: this.$t('shift.columns.name'),
          width: '250px',
          filterable: true,
          filterType: 'string',
        },
        {
          key: 'startTimeDisplay',
          label: this.$t('shift.columns.startTime'),
          width: '130px',
          sortKey: 'startTime',
        },
        {
          key: 'endTimeDisplay',
          label: this.$t('shift.columns.endTime'),
          width: '130px',
          sortKey: 'endTime',
        },
        {
          key: 'breakStartTimeDisplay',
          label: this.$t('shift.columns.breakStart'),
          width: '165px',
          sortKey: 'breakStartTime',
        },
        {
          key: 'breakEndTimeDisplay',
          label: this.$t('shift.columns.breakEnd'),
          width: '165px',
          sortKey: 'breakEndTime',
        },
        {
          key: 'workHour',
          label: this.$t('shift.columns.workHour'),
          width: '230px',
          align: 'right',
          filterable: true,
          filterType: 'number',
        },
        {
          key: 'breakHour',
          label: this.$t('shift.columns.breakHour'),
          width: '230px',
          align: 'right',
          filterable: true,
          filterType: 'number',
        },
        {
          key: 'shiftStatus',
          label: this.$t('shift.columns.status'),
          width: '140px',
          filterable: true,
          filterType: 'status',
          filterOptions: [
            { value: '1', label: this.$t('shift.status.active') },
            { value: '0', label: this.$t('shift.status.inactive') },
          ],
        },
        {
          key: 'createdBy',
          label: this.$t('shift.columns.createdBy'),
          width: '150px',
          filterable: true,
          filterType: 'string',
        },
        {
          key: 'createdDateDisplay',
          label: this.$t('shift.columns.createdDate'),
          width: '150px',
          filterable: true,
          filterType: 'date',
          filterKey: 'CreatedDate',
          sortKey: 'createdDate',
        },
      ]
    },
  },

  methods: {
    // ★ Override getStore — trả về Pinia store tương ứng
    getStore() {
      return useShiftStore()
    },

    // ★ Override getCodeField — field hiển thị trong confirm delete
    getCodeField() {
      return 'productionShiftCode'
    },

    getFormRef() {
      return this.$refs.shiftFormRef
    },
  },
}
</script>

<style scoped>
/* ===== PAGE HEADER ===== */
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

/* ===== BUTTON ===== */
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

/* ===== CELL STYLES ===== */
.status--active {
  color: #009b71;
  font-weight: 500;
  background-color: #ebfef6;
  padding: 5px 8px;
  border-radius: 999px;
}

.status--inactive {
  font-weight: 500;
  background-color: #fee2e2;
  color: #dc2626;
  padding: 5px 8px;
  border-radius: 999px;
}

.text-orange {
  color: #ea580c;
}

/* ===== ROW ACTIONS ===== */
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

/* ===== ERROR ===== */
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

/* ===== WARNING DIALOG ===== */
.warning-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  background-color: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
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

<style>
/* ===== MORE DROPDOWN (teleport → global) ===== */
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

.icon-stop--use {
  margin-right: 0 !important;
}
</style>
