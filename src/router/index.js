import { createRouter, createWebHistory } from 'vue-router'

import PlaceholderPage from '@/pages/PlaceholderPage.vue'
import ShiftPage from '@/pages/ShiftPage.vue'

const routes = [
  { path: '/', redirect: '/production/dictionary/shift' },

  // Menu chính — mỗi tab 1 route, chưa làm thì dùng PlaceholderPage
  { path: '/production/dashboard',       name: 'Dashboard',    component: PlaceholderPage, meta: { title: 'Tổng quan' } },
  { path: '/production/sale-order',      name: 'SaleOrder',    component: PlaceholderPage, meta: { title: 'Đơn đặt hàng' } },
  { path: '/production/planning',        name: 'Planning',     component: PlaceholderPage, meta: { title: 'Kế hoạch sản xuất' } },
  { path: '/production/dispatch',        name: 'Dispatch',     component: PlaceholderPage, meta: { title: 'Điều phối và thực thi' } },
  { path: '/production/quality',         name: 'Quality',      component: PlaceholderPage, meta: { title: 'Kiểm tra chất lượng' } },
  { path: '/production/warehouse',       name: 'Warehouse',    component: PlaceholderPage, meta: { title: 'Kho vật tư' } },
  { path: '/production/task',            name: 'Task',         component: PlaceholderPage, meta: { title: 'Giao việc' } },
  { path: '/production/cost-plan',       name: 'CostPlan',     component: PlaceholderPage, meta: { title: 'Giá thành kế hoạch' } },
  { path: '/production/outsource',       name: 'Outsource',    component: PlaceholderPage, meta: { title: 'Thuê gia công' } },
  { path: '/production/traceability',    name: 'Traceability', component: PlaceholderPage, meta: { title: 'Truy xuất nguồn gốc' } },
  { path: '/production/report',          name: 'Report',       component: PlaceholderPage, meta: { title: 'Báo cáo' } },
  { path: '/production/product',         name: 'Product',      component: PlaceholderPage, meta: { title: 'Sản phẩm, NVL' } },
  { path: '/production/process',         name: 'Process',      component: PlaceholderPage, meta: { title: 'Quy trình sản xuất' } },
  { path: '/production/capacity',        name: 'Capacity',     component: PlaceholderPage, meta: { title: 'Năng lực sản xuất' } },
  { path: '/production/settings',        name: 'Settings',     component: PlaceholderPage, meta: { title: 'Thiết lập' } },

  // Danh mục khác → Ca làm việc (TRANG CHÍNH CẦN LÀM)
  { path: '/production/dictionary/shift', name: 'Shift', component: ShiftPage, meta: { title: 'Ca làm việc' } },

  // Catch-all
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
