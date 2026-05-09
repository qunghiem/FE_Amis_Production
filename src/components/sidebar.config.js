/**
 * Item đơn (không có con)
 * { label, icon, to }
 *
 * Item có submenu
 * { key, label, icon, children: [{ label, to }] }
 *
 * Divider
 * { type: 'divider' }
 *
 * Flyout đặc biệt
 * { type: 'flyout', label, icon, columns: [{ title, items: [{ label, to }] }] }
 */

// =============================================
// SIDEBAR MENU CONFIG
// =============================================

// =============================================
// SIDEBAR MENU CONFIG
// =============================================

export const MENU_CONFIG = [
  // ── Đơn lẻ ────────────────────────────────
  {
    label: 'Tổng quan',
    icon: 'overview',
    to: '/production/dashboard',
  },
  {
    label: 'Đơn đặt hàng',
    icon: 'order',
    to: '/production/sale-order',
  },

  // ── Có submenu ────────────────────────────
  {
    key: 'plan',
    label: 'Kế hoạch sản xuất',
    icon: 'plan',
    children: [
      { label: 'Kế hoạch tổng thể', to: '/production/plan/manufacturing-order' },
      { label: 'Kế hoạch chi tiết', to: '/production/plan/schedule' },
    ],
  },
  {
    key: 'dispatch',
    label: 'Điều phối và thực thi',
    icon: 'dispatch',
    children: [
      { label: 'Phiếu công việc', to: '/production/dispatch/work-order' },
      { label: 'Tiến độ sản xuất', to: '/production/dispatch/progress' },
    ],
  },
  {
    key: 'quality',
    label: 'Kiểm tra chất lượng',
    icon: 'quality',
    children: [
      { label: 'Phiếu kiểm tra', to: '/production/quality/inspection' },
      { label: 'Lỗi sản phẩm', to: '/production/quality/defect' },
    ],
  },
  {
    key: 'warehouse',
    label: 'Kho vật tư',
    icon: 'warehouse',
    children: [
      { label: 'Phiếu nhập kho', to: '/production/warehouse/receipt' },
      { label: 'Phiếu xuất kho', to: '/production/warehouse/issue' },
      { label: 'Tồn kho', to: '/production/warehouse/inventory' },
    ],
  },
  {
    key: 'task',
    label: 'Giao việc',
    icon: 'task',
    children: [
      { label: 'Phân công công việc', to: '/production/task/assign' },
      { label: 'Theo dõi công việc', to: '/production/task/tracking' },
    ],
  },
  {
    key: 'cost',
    label: 'Giá thành kế hoạch',
    icon: 'price',
    children: [
      { label: 'Dự toán giá thành', to: '/production/cost/estimate' },
      { label: 'Giá thành thực tế', to: '/production/cost/actual' },
    ],
  },
  {
    key: 'outsource',
    label: 'Thuê gia công',
    icon: 'outsource',
    children: [
      { label: 'Hợp đồng gia công', to: '/production/outsource/contract' },
      { label: 'Theo dõi gia công', to: '/production/outsource/tracking' },
    ],
  },

  // ── Đơn lẻ ────────────────────────────────
  {
    label: 'Truy xuất nguồn gốc',
    icon: 'trace',
    to: '/production/trace',
  },

  { type: 'divider' },

  {
    label: 'Báo cáo',
    icon: 'report',
    to: '/production/report',
  },

  { type: 'divider' },

  // ── Có submenu ────────────────────────────
  {
    key: 'product',
    label: 'Sản phẩm, NVL',
    icon: 'product',
    children: [
      { label: 'Danh sách sản phẩm', to: '/production/product/list' },
      { label: 'Nguyên vật liệu', to: '/production/product/material' },
      { label: 'Định mức nguyên liệu (BOM)', to: '/production/product/bom' },
    ],
  },
  {
    key: 'process',
    label: 'Quy trình sản xuất',
    icon: 'process',
    children: [
      { label: 'Quy trình (Routing)', to: '/production/process/routing' },
      { label: 'Công đoạn sản xuất', to: '/production/process/operation' },
    ],
  },
  {
    key: 'capacity',
    label: 'Năng lực sản xuất',
    icon: 'capacity',
    children: [
      { label: 'Máy móc thiết bị', to: '/production/capacity/machine' },
      { label: 'Trung tâm làm việc', to: '/production/capacity/workcenter' },
    ],
  },

  // ── Flyout đặc biệt ───────────────────────
  {
    type: 'flyout',
    label: 'Danh mục khác',
    icon: 'other',
    activePrefixes: ['/production/dictionary/'],
    columns: [
      {
        title: 'Đối tượng',
        items: [
          { label: 'Khách hàng', to: '/production/dictionary/customer' },
          { label: 'Nhà cung cấp', to: '/production/dictionary/supplier' },
          { label: 'Nhân viên', to: '/production/dictionary/employee' },
          { label: 'Đối tượng tập hợp chi phí', to: '/production/dictionary/cost-object' },
        ],
      },
      {
        title: 'Lịch làm việc',
        items: [
          { label: 'Ca làm việc', to: '/production/dictionary/shift' },
          { label: 'Ngày nghỉ', to: '/production/dictionary/holiday' },
          { label: 'Lịch làm việc', to: '/production/dictionary/work-calendar' },
        ],
      },
      {
        title: 'Khác',
        items: [
          { label: 'Cơ cấu tổ chức', to: '/production/dictionary/org-structure' },
          { label: 'Kho', to: '/production/dictionary/warehouse' },
          { label: 'Đơn vị tính', to: '/production/dictionary/unit-of-measure' },
          { label: 'Lý do dừng công việc', to: '/production/dictionary/stop-reason' },
          { label: 'Loại tiền', to: '/production/dictionary/currency' },
        ],
      },
    ],
  },

  // ── Có submenu ────────────────────────────
  {
    key: 'settings',
    label: 'Thiết lập',
    icon: 'settings',
    children: [
      { label: 'Cài đặt chung', to: '/production/settings/general' },
      { label: 'Phân quyền', to: '/production/settings/permission' },
    ],
  },
]
