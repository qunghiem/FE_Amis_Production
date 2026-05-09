<template>
  <aside class="sidebar" :class="{ collapsed }">
    <nav class="sidebar__menu">
      <template v-for="item in menuItems" :key="item.id">
        <!-- Separator -->
        <div v-if="item.type === 'separator'" class="sidebar__separator"></div>

        <!-- Item có sub-menu (chỉ Danh mục khác) -->
        <div v-else-if="item.children" class="sidebar__item">
          <div
            class="sidebar__group-header"
            :data-tooltip="collapsed ? item.label : undefined"
            @click="toggleGroup(item.id)"
          >
            <span class="sidebar__icon">
              <i :class="item.icon"></i>
            </span>
            <span class="sidebar__text">{{ item.label }}</span>
            <i
              class="fa-solid fa-chevron-right sidebar__chevron"
              :class="{ open: openGroups.has(item.id) }"
            ></i>
          </div>

          <div v-if="openGroups.has(item.id)" class="sidebar__sub-items">
            <div class="sidebar__item" v-for="child in item.children" :key="child.id">
              <router-link
                :to="child.route"
                class="sidebar__link"
                :class="{ active: $route.path === child.route }"
              >
                <span class="sidebar__text">{{ child.label }}</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Item đơn -->
        <div v-else class="sidebar__item">
          <router-link
            :to="item.route"
            class="sidebar__link"
            :class="{ active: $route.path === item.route }"
            :data-tooltip="collapsed ? item.label : undefined"
          >
            <span class="sidebar__icon">
              <i :class="item.icon"></i>
            </span>
            <span class="sidebar__text">{{ item.label }}</span>
            <!-- Chevron trang trí cho các item có submenu trong UI gốc -->
            <i v-if="item.hasChevron" class="fa-solid fa-chevron-right sidebar__chevron"></i>
          </router-link>
        </div>
      </template>
    </nav>

    <!-- Toggle button -->
    <button class="sidebar__toggle" @click="$emit('toggle')">
      <span class="sidebar__toggle-icon">
        <i class="fa-solid fa-chevron-left"></i>
      </span>
      <span class="sidebar__toggle-label">Thu gọn</span>
    </button>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  collapsed: Boolean,
})
defineEmits(['toggle'])

const route = useRoute()

// ===== CẤU HÌNH MENU SIDEBAR =====
// hasChevron = true: hiện mũi tên bên phải (giống UI gốc), nhưng click vẫn chuyển trang placeholder
// children: chỉ dùng cho "Danh mục khác" vì cần expand ra "Ca làm việc"
const menuItems = [
  { id: 'dashboard',     label: 'Tổng quan',              icon: 'fa-solid fa-house',                        route: '/production/dashboard' },
  { id: 'sale-order',    label: 'Đơn đặt hàng',           icon: 'fa-solid fa-clipboard-list',                route: '/production/sale-order' },
  { id: 'planning',      label: 'Kế hoạch sản xuất',      icon: 'fa-solid fa-calendar-check',                route: '/production/planning',       hasChevron: true },
  { id: 'dispatch',      label: 'Điều phối và thực thi',   icon: 'fa-solid fa-arrows-split-up-and-left',     route: '/production/dispatch',       hasChevron: true },
  { id: 'quality',       label: 'Kiểm tra chất lượng',    icon: 'fa-solid fa-clipboard-check',               route: '/production/quality',        hasChevron: true },
  { id: 'warehouse',     label: 'Kho vật tư',             icon: 'fa-solid fa-warehouse',                     route: '/production/warehouse',      hasChevron: true },
  { id: 'task',          label: 'Giao việc',              icon: 'fa-solid fa-list-check',                    route: '/production/task',           hasChevron: true },
  { id: 'cost-plan',     label: 'Giá thành kế hoạch',     icon: 'fa-solid fa-money-bill-trend-up',           route: '/production/cost-plan',      hasChevron: true },
  { id: 'outsource',     label: 'Thuê gia công',          icon: 'fa-solid fa-handshake',                     route: '/production/outsource',      hasChevron: true },
  { id: 'traceability',  label: 'Truy xuất nguồn gốc',    icon: 'fa-solid fa-magnifying-glass-location',     route: '/production/traceability' },
  { type: 'separator', id: 'sep-1' },
  { id: 'report',        label: 'Báo cáo',                icon: 'fa-solid fa-chart-line',                    route: '/production/report' },
  { type: 'separator', id: 'sep-2' },
  { id: 'product',       label: 'Sản phẩm, NVL',         icon: 'fa-solid fa-boxes-stacked',                 route: '/production/product',        hasChevron: true },
  { id: 'process',       label: 'Quy trình sản xuất',     icon: 'fa-solid fa-diagram-project',               route: '/production/process',        hasChevron: true },
  { id: 'capacity',      label: 'Năng lực sản xuất',      icon: 'fa-solid fa-gauge-high',                    route: '/production/capacity',       hasChevron: true },
  {
    id: 'dictionary',
    label: 'Danh mục khác',
    icon: 'fa-solid fa-ellipsis',
    children: [
      { id: 'shift', label: 'Ca làm việc', route: '/production/dictionary/shift' },
    ],
  },
  { id: 'settings',      label: 'Thiết lập',              icon: 'fa-solid fa-gear',                          route: '/production/settings',       hasChevron: true },
]

// ===== QUẢN LÝ MỞ/ĐÓNG NHÓM (chỉ "Danh mục khác") =====
const openGroups = ref(new Set())

initOpenGroups()

function initOpenGroups() {
  for (const item of menuItems) {
    if (item.children) {
      const hasActiveChild = item.children.some((c) => route.path === c.route)
      if (hasActiveChild) openGroups.value.add(item.id)
    }
  }
}

watch(() => route.path, () => initOpenGroups())

function toggleGroup(id) {
  const s = new Set(openGroups.value)
  s.has(id) ? s.delete(id) : s.add(id)
  openGroups.value = s
}
</script>
