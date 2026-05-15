/**
 * Sidebar config sử dụng i18n key thay vì text cứng.
 * Trong template, dùng $t(item.labelKey) để hiển thị.
 */

export const MENU_CONFIG = [
  {
    labelKey: 'sidebar.overview',
    icon: 'overview',
    to: '/production/dashboard',
  },
  {
    labelKey: 'sidebar.saleOrder',
    icon: 'order',
    to: '/production/sale-order',
  },
  {
    key: 'plan',
    labelKey: 'sidebar.productionPlan',
    icon: 'plan',
    children: [
      { labelKey: 'sidebar.masterPlan', to: '/production/plan/manufacturing-order' },
      { labelKey: 'sidebar.detailPlan', to: '/production/plan/schedule' },
    ],
  },
  {
    key: 'dispatch',
    labelKey: 'sidebar.dispatch',
    icon: 'dispatch',
    children: [
      { labelKey: 'sidebar.workOrder', to: '/production/dispatch/work-order' },
      { labelKey: 'sidebar.progress', to: '/production/dispatch/progress' },
    ],
  },
  {
    key: 'quality',
    labelKey: 'sidebar.quality',
    icon: 'quality',
    children: [
      { labelKey: 'sidebar.inspection', to: '/production/quality/inspection' },
      { labelKey: 'sidebar.defect', to: '/production/quality/defect' },
    ],
  },
  {
    key: 'warehouse',
    labelKey: 'sidebar.warehouse',
    icon: 'warehouse',
    children: [
      { labelKey: 'sidebar.receipt', to: '/production/warehouse/receipt' },
      { labelKey: 'sidebar.issue', to: '/production/warehouse/issue' },
      { labelKey: 'sidebar.inventory', to: '/production/warehouse/inventory' },
    ],
  },
  // {
  //   key: 'task',
  //   labelKey: 'sidebar.task',
  //   icon: 'task',
  //   children: [
  //     { labelKey: 'sidebar.taskAssign', to: '/production/task/assign' },
  //     { labelKey: 'sidebar.taskTracking', to: '/production/task/tracking' },
  //   ],
  // },
  {
    key: 'cost',
    labelKey: 'sidebar.cost',
    icon: 'price',
    children: [
      { labelKey: 'sidebar.costEstimate', to: '/production/cost/estimate' },
      { labelKey: 'sidebar.costActual', to: '/production/cost/actual' },
    ],
  },
  {
    key: 'outsource',
    labelKey: 'sidebar.outsource',
    icon: 'outsource',
    children: [
      { labelKey: 'sidebar.outsourceContract', to: '/production/outsource/contract' },
      { labelKey: 'sidebar.outsourceTracking', to: '/production/outsource/tracking' },
    ],
  },
  // {
  //   labelKey: 'sidebar.trace',
  //   icon: 'trace',
  //   to: '/production/trace',
  // },

  { type: 'divider' },

  {
    labelKey: 'sidebar.report',
    icon: 'report',
    to: '/production/report',
  },

  { type: 'divider' },

  {
    key: 'product',
    labelKey: 'sidebar.product',
    icon: 'product',
    children: [
      { labelKey: 'sidebar.productList', to: '/production/product/list' },
      { labelKey: 'sidebar.material', to: '/production/product/material' },
      { labelKey: 'sidebar.bom', to: '/production/product/bom' },
    ],
  },
  {
    key: 'process',
    labelKey: 'sidebar.process',
    icon: 'process',
    children: [
      { labelKey: 'sidebar.routing', to: '/production/process/routing' },
      { labelKey: 'sidebar.operation', to: '/production/process/operation' },
    ],
  },
  {
    key: 'capacity',
    labelKey: 'sidebar.capacity',
    icon: 'capacity',
    children: [
      { labelKey: 'sidebar.machine', to: '/production/capacity/machine' },
      { labelKey: 'sidebar.workcenter', to: '/production/capacity/workcenter' },
    ],
  },

  {
    type: 'flyout',
    labelKey: 'sidebar.otherCategory',
    icon: 'other',
    activePrefixes: ['/production/dictionary/'],
    columns: [
      {
        titleKey: 'sidebar.flyout.object',
        items: [
          { labelKey: 'sidebar.flyout.customer', to: '/production/dictionary/customer' },
          { labelKey: 'sidebar.flyout.supplier', to: '/production/dictionary/supplier' },
          { labelKey: 'sidebar.flyout.employee', to: '/production/dictionary/employee' },
          { labelKey: 'sidebar.flyout.costObject', to: '/production/dictionary/cost-object' },
        ],
      },
      {
        titleKey: 'sidebar.flyout.workSchedule',
        items: [
          { labelKey: 'sidebar.flyout.shift', to: '/production/dictionary/shift' },
          { labelKey: 'sidebar.flyout.holiday', to: '/production/dictionary/holiday' },
          { labelKey: 'sidebar.flyout.workCalendar', to: '/production/dictionary/work-calendar' },
        ],
      },
      {
        titleKey: 'sidebar.flyout.other',
        items: [
          { labelKey: 'sidebar.flyout.orgStructure', to: '/production/dictionary/org-structure' },
          { labelKey: 'sidebar.flyout.warehouseItem', to: '/production/dictionary/warehouse' },
          { labelKey: 'sidebar.flyout.unitOfMeasure', to: '/production/dictionary/unit-of-measure' },
          { labelKey: 'sidebar.flyout.stopReason', to: '/production/dictionary/stop-reason' },
          { labelKey: 'sidebar.flyout.currency', to: '/production/dictionary/currency' },
        ],
      },
    ],
  },

  {
    key: 'settings',
    labelKey: 'sidebar.settings',
    icon: 'settings',
    children: [
      { labelKey: 'sidebar.generalSettings', to: '/production/settings/general' },
      { labelKey: 'sidebar.permission', to: '/production/settings/permission' },
    ],
  },
]
