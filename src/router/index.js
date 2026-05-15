import { createRouter, createWebHistory } from 'vue-router'
import PlaceholderPage from '@/pages/PlaceholderPage.vue'
import ShiftPage from '@/pages/ShiftPage.vue'

const routes = [
  // Tổng quan
  { path: '/production/dashboard', component: PlaceholderPage, meta: { title: 'Tổng quan' } },
  { path: '/', redirect: '/production/dashboard' },

  // Đơn đặt hàng
  { path: '/production/sale-order', component: PlaceholderPage, meta: { title: 'Đơn đặt hàng' } },

  // Kế hoạch sản xuất
  { path: '/production/plan', component: PlaceholderPage, meta: { title: 'Kế hoạch sản xuất' } },
  {
    path: '/production/plan/manufacturing-order',
    component: PlaceholderPage,
    meta: { title: 'Kế hoạch tổng thể' },
  },
  {
    path: '/production/plan/schedule',
    component: PlaceholderPage,
    meta: { title: 'Kế hoạch chi tiết' },
  },

  // Điều phối và thực thi
  {
    path: '/production/dispatch',
    component: PlaceholderPage,
    meta: { title: 'Điều phối và thực thi' },
  },
  {
    path: '/production/dispatch/work-order',
    component: PlaceholderPage,
    meta: { title: 'Phiếu công việc' },
  },
  {
    path: '/production/dispatch/progress',
    component: PlaceholderPage,
    meta: { title: 'Tiến độ sản xuất' },
  },

  // Kiểm tra chất lượng
  {
    path: '/production/quality',
    component: PlaceholderPage,
    meta: { title: 'Kiểm tra chất lượng' },
  },
  {
    path: '/production/quality/inspection',
    component: PlaceholderPage,
    meta: { title: 'Phiếu kiểm tra' },
  },
  {
    path: '/production/quality/defect',
    component: PlaceholderPage,
    meta: { title: 'Lỗi sản phẩm' },
  },

  // Kho vật tư
  { path: '/production/warehouse', component: PlaceholderPage, meta: { title: 'Kho vật tư' } },
  {
    path: '/production/warehouse/receipt',
    component: PlaceholderPage,
    meta: { title: 'Phiếu nhập kho' },
  },
  {
    path: '/production/warehouse/issue',
    component: PlaceholderPage,
    meta: { title: 'Phiếu xuất kho' },
  },
  {
    path: '/production/warehouse/inventory',
    component: PlaceholderPage,
    meta: { title: 'Tồn kho' },
  },

  // Giao việc
  // { path: '/production/task', component: PlaceholderPage, meta: { title: 'Giao việc' } },
  // {
  //   path: '/production/task/assign',
  //   component: PlaceholderPage,
  //   meta: { title: 'Phân công công việc' },
  // },
  // {
  //   path: '/production/task/tracking',
  //   component: PlaceholderPage,
  //   meta: { title: 'Theo dõi công việc' },
  // },

  // Giá thành kế hoạch
  { path: '/production/cost', component: PlaceholderPage, meta: { title: 'Giá thành kế hoạch' } },
  {
    path: '/production/cost/estimate',
    component: PlaceholderPage,
    meta: { title: 'Dự toán giá thành' },
  },
  {
    path: '/production/cost/actual',
    component: PlaceholderPage,
    meta: { title: 'Giá thành thực tế' },
  },

  // Thuê gia công
  { path: '/production/outsource', component: PlaceholderPage, meta: { title: 'Thuê gia công' } },
  {
    path: '/production/outsource/contract',
    component: PlaceholderPage,
    meta: { title: 'Hợp đồng gia công' },
  },
  {
    path: '/production/outsource/tracking',
    component: PlaceholderPage,
    meta: { title: 'Theo dõi gia công' },
  },

  // Truy xuất nguồn gốc
  // { path: '/production/trace', component: PlaceholderPage, meta: { title: 'Truy xuất nguồn gốc' } },

  // Báo cáo
  { path: '/production/report', component: PlaceholderPage, meta: { title: 'Báo cáo' } },

  // Sản phẩm, NVL
  { path: '/production/product', component: PlaceholderPage, meta: { title: 'Sản phẩm, NVL' } },
  {
    path: '/production/product/list',
    component: PlaceholderPage,
    meta: { title: 'Danh sách sản phẩm' },
  },
  {
    path: '/production/product/material',
    component: PlaceholderPage,
    meta: { title: 'Nguyên vật liệu' },
  },
  {
    path: '/production/product/bom',
    component: PlaceholderPage,
    meta: { title: 'Định mức nguyên liệu (BOM)' },
  },

  // Quy trình sản xuất
  {
    path: '/production/process',
    component: PlaceholderPage,
    meta: { title: 'Quy trình sản xuất' },
  },
  {
    path: '/production/process/routing',
    component: PlaceholderPage,
    meta: { title: 'Quy trình (Routing)' },
  },
  {
    path: '/production/process/operation',
    component: PlaceholderPage,
    meta: { title: 'Công đoạn sản xuất' },
  },

  // Năng lực sản xuất
  {
    path: '/production/capacity',
    component: PlaceholderPage,
    meta: { title: 'Năng lực sản xuất' },
  },
  {
    path: '/production/capacity/machine',
    component: PlaceholderPage,
    meta: { title: 'Máy móc thiết bị' },
  },
  {
    path: '/production/capacity/workcenter',
    component: PlaceholderPage,
    meta: { title: 'Trung tâm làm việc' },
  },

  // Danh mục khác - Đối tượng
  {
    path: '/production/dictionary/customer',
    component: PlaceholderPage,
    meta: { title: 'Khách hàng' },
  },
  {
    path: '/production/dictionary/supplier',
    component: PlaceholderPage,
    meta: { title: 'Nhà cung cấp' },
  },
  {
    path: '/production/dictionary/employee',
    component: PlaceholderPage,
    meta: { title: 'Nhân viên' },
  },
  {
    path: '/production/dictionary/cost-object',
    component: PlaceholderPage,
    meta: { title: 'Đối tượng tập hợp chi phí' },
  },

  // Danh mục khác - Lịch làm việc
  { path: '/production/dictionary/shift', component: ShiftPage, meta: { title: 'Ca làm việc' } },
  {
    path: '/production/dictionary/holiday',
    component: PlaceholderPage,
    meta: { title: 'Ngày nghỉ' },
  },
  {
    path: '/production/dictionary/work-calendar',
    component: PlaceholderPage,
    meta: { title: 'Lịch làm việc' },
  },

  // Danh mục khác - Khác
  {
    path: '/production/dictionary/org-structure',
    component: PlaceholderPage,
    meta: { title: 'Cơ cấu tổ chức' },
  },
  { path: '/production/dictionary/warehouse', component: PlaceholderPage, meta: { title: 'Kho' } },
  {
    path: '/production/dictionary/unit-of-measure',
    component: PlaceholderPage,
    meta: { title: 'Đơn vị tính' },
  },
  {
    path: '/production/dictionary/stop-reason',
    component: PlaceholderPage,
    meta: { title: 'Lý do dừng công việc' },
  },
  {
    path: '/production/dictionary/currency',
    component: PlaceholderPage,
    meta: { title: 'Loại tiền' },
  },

  // Thiết lập
  { path: '/production/settings', component: PlaceholderPage, meta: { title: 'Thiết lập' } },
  {
    path: '/production/settings/general',
    component: PlaceholderPage,
    meta: { title: 'Cài đặt chung' },
  },
  {
    path: '/production/settings/permission',
    component: PlaceholderPage,
    meta: { title: 'Phân quyền' },
  },

  // Fallback
  { path: '/:pathMatch(.*)*', component: PlaceholderPage, meta: { title: 'Trang' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
