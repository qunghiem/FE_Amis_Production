import { createRouter, createWebHistory } from 'vue-router'
import PlaceholderPage from '@/pages/PlaceholderPage.vue'
import ShiftPage from '@/pages/ShiftPage.vue'

const routes = [
  // Tổng quan
  {
    path: '/production/dashboard',
    component: PlaceholderPage,
    meta: { title: 'Tổng quan' }
  },
  // Redirect gốc
  {
    path: '/',
    redirect: '/production/dashboard'
  },

  // Đơn đặt hàng
  {
    path: '/production/sale-order',
    component: PlaceholderPage,
    meta: { title: 'Đơn đặt hàng' }
  },

  // Kế hoạch sản xuất
  {
    path: '/production/plan',
    component: PlaceholderPage,
    meta: { title: 'Kế hoạch sản xuất' }
  },
  {
    path: '/production/plan/manufacturing-order',
    component: PlaceholderPage,
    meta: { title: '' }
  },
  {
    path: '/production/plan/schedule',
    component: PlaceholderPage,
    meta: { title: '' }
  },

  // Điều phối và thực thi
  {
    path: '/production/dispatch',
    component: PlaceholderPage,
    meta: { title: '' }
  },
  {
    path: '/production/dispatch/work-order',
    component: PlaceholderPage,
    meta: { title: '' }
  },
  {
    path: '/production/dispatch/progress',
    component: PlaceholderPage,
    meta: { title: '' }
  },

  // Kiểm tra chất lượng
  {
    path: '/production/quality',
    component: PlaceholderPage,
    meta: { title: '' }
  },
  {
    path: '/production/quality/inspection',
    component: PlaceholderPage,
    meta: { title: '' }
  },
  {
    path: '/production/quality/defect',
    component: PlaceholderPage,
    meta: { title: '' }
  },

  // Kho vật tư
  {
    path: '/production/warehouse',
    component: PlaceholderPage,
    meta: { title: '' }
  },
  {
    path: '/production/warehouse/receipt',
    component: PlaceholderPage,
    meta: { title: '' }
  },
  {
    path: '/production/warehouse/issue',
    component: PlaceholderPage,
    meta: { title: '' }
  },
  {
    path: '/production/warehouse/inventory',
    component: PlaceholderPage,
    meta: { title: '' }
  },

  // Giao việc
  {
    path: '/production/task',
    component: PlaceholderPage,
    meta: { title: '' }
  },
  {
    path: '/production/task/assign',
    component: PlaceholderPage,
        meta: { title: '' }

  },
  {
    path: '/production/task/tracking',
    component: PlaceholderPage,
        meta: { title: '' }

  },

  // Giá thành kế hoạch
  {
    path: '/production/cost',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/cost/estimate',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/cost/actual',
    component: PlaceholderPage,
    meta: { title: '' }

  },

  // Thuê gia công
  {
    path: '/production/outsource',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/outsource/contract',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/outsource/tracking',
    component: PlaceholderPage,
    meta: { title: '' }

  },

  // Truy xuất nguồn gốc
  {
    path: '/production/trace',
    component: PlaceholderPage,
    meta: { title: 'Truy xuất nguồn gốc' }
  },

  // Báo cáo
  {
    path: '/production/report',
    component: PlaceholderPage,
    meta: { title: 'Báo cáo' }
  },

  // Sản phẩm, NVL
  {
    path: '/production/dictionary/product',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/dictionary/product/list',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/dictionary/product/material',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/dictionary/product/bom',
    component: PlaceholderPage,
    meta: { title: '' }

  },

  // Quy trình sản xuất
  {
    path: '/production/dictionary/process',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/dictionary/process/routing',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/dictionary/process/operation',
    component: PlaceholderPage,
    meta: { title: '' }

  },

  // Năng lực sản xuất
  {
    path: '/production/dictionary/capacity',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/dictionary/capacity/machine',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/dictionary/capacity/workcenter',
    component: PlaceholderPage,
    meta: { title: '' }

  },

  // Danh mục khác - Đối tượng
  {
    path: '/category/customer',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/category/supplier',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/category/employee',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/category/cost-object',
    component: PlaceholderPage,
    meta: { title: '' }

  },

  // Danh mục khác - Lịch làm việc
  {
    path: '/production/dictionary/shift',
    component: ShiftPage,
    meta: { title: '' }

  },
  {
    path: '/category/holiday',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/category/work-calendar',
    component: PlaceholderPage,
    meta: { title: '' }

  },

  // Danh mục khác - Khác
  {
    path: '/category/org-structure',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/category/warehouse',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/category/unit-of-measure',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/category/stop-reason',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/category/currency',
    component: PlaceholderPage,
    meta: { title: '' }

  },

  // Thiết lập
  {
    path: '/production/settings',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/settings/general',
    component: PlaceholderPage,
    meta: { title: '' }

  },
  {
    path: '/production/settings/permission',
    component: PlaceholderPage,
    meta: { title: '' }

  },

  // Fallback
  {
    path: '/:pathMatch(.*)*',
    component: PlaceholderPage,
    meta: { title: 'Trang' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
