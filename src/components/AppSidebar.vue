<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <nav class="sidebar__nav">
      <!-- Tổng quan -->
      <router-link
        to="/production/dashboard"
        class="sidebar__item"
        active-class="sidebar__item--active"
        exact
      >
        <span class="sidebar__icon sidebar__icon--overview"></span>
        <span class="sidebar__label">Tổng quan</span>
      </router-link>

      <!-- Đơn đặt hàng -->
      <router-link
        to="/production/sale-order"
        class="sidebar__item"
        active-class="sidebar__item--active"
      >
        <span class="sidebar__icon sidebar__icon--order"></span>
        <span class="sidebar__label">Đơn đặt hàng</span>
      </router-link>

      <!-- Kế hoạch sản xuất -->
      <div
        class="sidebar__item sidebar__item--has-sub"
        :class="{
          'sidebar__item--sub-open': openMenus.plan,
          'sidebar__item--parent-active': isParentActive([
            '/production/plan/manufacturing-order',
            '/production/plan/schedule',
          ]),
        }"
        @click="toggleMenu('plan')"
      >
        <span class="sidebar__icon sidebar__icon--plan"></span>
        <span class="sidebar__label">Kế hoạch sản xuất</span>
        <i class="sidebar__chevron" :class="{ 'sidebar__chevron--open': openMenus.plan }"></i>
      </div>
      <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus.plan }">
        <router-link
          to="/production/plan/manufacturing-order"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Kế hoạch tổng thể</router-link
        >
        <router-link
          to="/production/plan/schedule"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Kế hoạch chi tiết</router-link
        >
      </div>

      <!-- Điều phối và thực thi -->
      <div
        class="sidebar__item sidebar__item--has-sub"
        :class="{
          'sidebar__item--sub-open': openMenus.dispatch,
          'sidebar__item--parent-active': isParentActive([
            '/production/dispatch/work-order',
            '/production/dispatch/progress',
          ]),
        }"
        @click="toggleMenu('dispatch')"
      >
        <span class="sidebar__icon sidebar__icon--dispatch"></span>
        <span class="sidebar__label">Điều phối và thực thi</span>
        <i class="sidebar__chevron" :class="{ 'sidebar__chevron--open': openMenus.dispatch }"></i>
      </div>
      <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus.dispatch }">
        <div class="icon"></div>
        <router-link
          to="/production/dispatch/work-order"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Phiếu công việc</router-link
        >
        <router-link
          to="/production/dispatch/progress"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Tiến độ sản xuất</router-link
        >
      </div>

      <!-- Kiểm tra chất lượng -->
      <div
        class="sidebar__item sidebar__item--has-sub"
        :class="{
          'sidebar__item--sub-open': openMenus.quality,
          'sidebar__item--parent-active': isParentActive([
            '/production/quality/inspection',
            '/production/quality/defect',
          ]),
        }"
        @click="toggleMenu('quality')"
      >
        <span class="sidebar__icon sidebar__icon--quality"></span>
        <span class="sidebar__label">Kiểm tra chất lượng</span>
        <i class="sidebar__chevron" :class="{ 'sidebar__chevron--open': openMenus.quality }"></i>
      </div>
      <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus.quality }">
        <router-link
          to="/production/quality/inspection"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Phiếu kiểm tra</router-link
        >
        <router-link
          to="/production/quality/defect"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Lỗi sản phẩm</router-link
        >
      </div>

      <!-- Kho vật tư -->
      <div
        class="sidebar__item sidebar__item--has-sub"
        :class="{
          'sidebar__item--sub-open': openMenus.warehouse,
          'sidebar__item--parent-active': isParentActive([
            '/production/warehouse/receipt',
            '/production/warehouse/issue',
            '/production/warehouse/inventory',
          ]),
        }"
        @click="toggleMenu('warehouse')"
      >
        <span class="sidebar__icon sidebar__icon--warehouse"></span>
        <span class="sidebar__label">Kho vật tư</span>
        <i class="sidebar__chevron" :class="{ 'sidebar__chevron--open': openMenus.warehouse }"></i>
      </div>
      <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus.warehouse }">
        <router-link
          to="/production/warehouse/receipt"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Phiếu nhập kho</router-link
        >
        <router-link
          to="/production/warehouse/issue"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Phiếu xuất kho</router-link
        >
        <router-link
          to="/production/warehouse/inventory"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Tồn kho</router-link
        >
      </div>

      <!-- Giao việc -->
      <div
        class="sidebar__item sidebar__item--has-sub"
        :class="{
          'sidebar__item--sub-open': openMenus.task,
          'sidebar__item--parent-active': isParentActive([
            '/production/task/assign',
            '/production/task/tracking',
          ]),
        }"
        @click="toggleMenu('task')"
      >
        <span class="sidebar__icon sidebar__icon--task"></span>
        <span class="sidebar__label">Giao việc</span>
        <i class="sidebar__chevron" :class="{ 'sidebar__chevron--open': openMenus.task }"></i>
      </div>
      <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus.task }">
        <router-link
          to="/production/task/assign"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Phân công công việc</router-link
        >
        <router-link
          to="/production/task/tracking"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Theo dõi công việc</router-link
        >
      </div>

      <!-- Giá thành kế hoạch -->
      <div
        class="sidebar__item sidebar__item--has-sub"
        :class="{
          'sidebar__item--sub-open': openMenus.cost,
          'sidebar__item--parent-active': isParentActive([
            '/production/cost/estimate',
            '/production/cost/actual',
          ]),
        }"
        @click="toggleMenu('cost')"
      >
        <span class="sidebar__icon sidebar__icon--price"></span>
        <span class="sidebar__label">Giá thành kế hoạch</span>
        <i class="sidebar__chevron" :class="{ 'sidebar__chevron--open': openMenus.cost }"></i>
      </div>
      <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus.cost }">
        <router-link
          to="/production/cost/estimate"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Dự toán giá thành</router-link
        >
        <router-link
          to="/production/cost/actual"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Giá thành thực tế</router-link
        >
      </div>

      <!-- Thuê gia công -->
      <div
        class="sidebar__item sidebar__item--has-sub"
        :class="{
          'sidebar__item--sub-open': openMenus.outsource,
          'sidebar__item--parent-active': isParentActive([
            '/production/outsource/contract',
            '/production/outsource/tracking',
          ]),
        }"
        @click="toggleMenu('outsource')"
      >
        <span class="sidebar__icon sidebar__icon--outsource"></span>
        <span class="sidebar__label">Thuê gia công</span>
        <i class="sidebar__chevron" :class="{ 'sidebar__chevron--open': openMenus.outsource }"></i>
      </div>
      <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus.outsource }">
        <router-link
          to="/production/outsource/contract"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Hợp đồng gia công</router-link
        >
        <router-link
          to="/production/outsource/tracking"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Theo dõi gia công</router-link
        >
      </div>

      <!-- Truy xuất nguồn gốc -->
      <router-link
        to="/production/trace"
        class="sidebar__item"
        active-class="sidebar__item--active"
      >
        <span class="sidebar__icon sidebar__icon--trace"></span>
        <span class="sidebar__label">Truy xuất nguồn gốc</span>
      </router-link>

      <div class="sidebar__divider"></div>

      <!-- Báo cáo -->
      <router-link
        to="/production/report"
        class="sidebar__item"
        active-class="sidebar__item--active"
      >
        <span class="sidebar__icon sidebar__icon--report"></span>
        <span class="sidebar__label">Báo cáo</span>
      </router-link>

      <div class="sidebar__divider"></div>

      <!-- Sản phẩm, NVL -->
      <div
        class="sidebar__item sidebar__item--has-sub"
        :class="{
          'sidebar__item--sub-open': openMenus.product,
          'sidebar__item--parent-active': isParentActive([
            '/production/dictionary/product/list',
            '/production/dictionary/product/material',
            '/production/dictionary/product/bom',
          ]),
        }"
        @click="toggleMenu('product')"
      >
        <span class="sidebar__icon sidebar__icon--product"></span>
        <span class="sidebar__label">Sản phẩm, NVL</span>
        <i class="sidebar__chevron" :class="{ 'sidebar__chevron--open': openMenus.product }"></i>
      </div>
      <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus.product }">
        <router-link
          to="/production/dictionary/product/list"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Danh sách sản phẩm</router-link
        >
        <router-link
          to="/production/dictionary/product/material"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Nguyên vật liệu</router-link
        >
        <router-link
          to="/production/dictionary/product/bom"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Định mức nguyên liệu (BOM)</router-link
        >
      </div>

      <!-- Quy trình sản xuất -->
      <div
        class="sidebar__item sidebar__item--has-sub"
        :class="{
          'sidebar__item--sub-open': openMenus.process,
          'sidebar__item--parent-active': isParentActive([
            '/production/dictionary/process/routing',
            '/production/dictionary/process/operation',
          ]),
        }"
        @click="toggleMenu('process')"
      >
        <span class="sidebar__icon sidebar__icon--process"></span>
        <span class="sidebar__label">Quy trình sản xuất</span>
        <i class="sidebar__chevron" :class="{ 'sidebar__chevron--open': openMenus.process }"></i>
      </div>
      <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus.process }">
        <router-link
          to="/production/dictionary/process/routing"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Quy trình (Routing)</router-link
        >
        <router-link
          to="/production/dictionary/process/operation"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Công đoạn sản xuất</router-link
        >
      </div>

      <!-- Năng lực sản xuất -->
      <div
        class="sidebar__item sidebar__item--has-sub"
        :class="{
          'sidebar__item--sub-open': openMenus.capacity,
          'sidebar__item--parent-active': isParentActive([
            '/production/dictionary/capacity/machine',
            '/production/dictionary/capacity/workcenter',
          ]),
        }"
        @click="toggleMenu('capacity')"
      >
        <span class="sidebar__icon sidebar__icon--capacity"></span>
        <span class="sidebar__label">Năng lực sản xuất</span>
        <i class="sidebar__chevron" :class="{ 'sidebar__chevron--open': openMenus.capacity }"></i>
      </div>
      <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus.capacity }">
        <router-link
          to="/production/dictionary/capacity/machine"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Máy móc thiết bị</router-link
        >
        <router-link
          to="/production/dictionary/capacity/workcenter"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Trung tâm làm việc</router-link
        >
      </div>

      <!-- Danh mục khác (flyout) -->
      <div
        class="sidebar__item sidebar__item--other"
        :class="{ 'sidebar__item--active': isOtherActive }"
        @mouseenter="showFlyout = true"
        @mouseleave="showFlyout = false"
      >
        <span class="sidebar__icon sidebar__icon--other"></span>
        <span class="sidebar__label">Danh mục khác</span>
        <i class="sidebar__chevron sidebar__chevron--right"></i>

        <!-- Flyout menu -->
        <transition name="flyout">
          <div class="sidebar__flyout" v-show="showFlyout">
            <div class="flyout__columns">
              <!-- Đối tượng -->
              <div class="flyout__col">
                <div class="flyout__col-title">Đối tượng</div>
                <router-link
                  to="/category/customer"
                  class="flyout__item"
                  active-class="flyout__item--active"
                  >Khách hàng</router-link
                >
                <router-link
                  to="/category/supplier"
                  class="flyout__item"
                  active-class="flyout__item--active"
                  >Nhà cung cấp</router-link
                >
                <router-link
                  to="/category/employee"
                  class="flyout__item"
                  active-class="flyout__item--active"
                  >Nhân viên</router-link
                >
                <router-link
                  to="/category/cost-object"
                  class="flyout__item"
                  active-class="flyout__item--active"
                  >Đối tượng tập hợp chi phí</router-link
                >
              </div>

              <!-- Lịch làm việc -->
              <div class="flyout__col">
                <div class="flyout__col-title">Lịch làm việc</div>
                <router-link
                  to="/production/dictionary/shift"
                  class="flyout__item"
                  active-class="flyout__item--active"
                >
                  <span class="flyout__sub-icon"></span>
                  Ca làm việc
                </router-link>
                <router-link
                  to="/category/holiday"
                  class="flyout__item"
                  active-class="flyout__item--active"
                  >Ngày nghỉ</router-link
                >
                <router-link
                  to="/category/work-calendar"
                  class="flyout__item"
                  active-class="flyout__item--active"
                  >Lịch làm việc</router-link
                >
              </div>

              <!-- Khác -->
              <div class="flyout__col">
                <div class="flyout__col-title">Khác</div>
                <router-link
                  to="/category/org-structure"
                  class="flyout__item"
                  active-class="flyout__item--active"
                  >Cơ cấu tổ chức</router-link
                >
                <router-link
                  to="/category/warehouse"
                  class="flyout__item"
                  active-class="flyout__item--active"
                  >Kho</router-link
                >
                <router-link
                  to="/category/unit-of-measure"
                  class="flyout__item"
                  active-class="flyout__item--active"
                  >Đơn vị tính</router-link
                >
                <router-link
                  to="/category/stop-reason"
                  class="flyout__item"
                  active-class="flyout__item--active"
                  >Lý do dừng công việc</router-link
                >
                <router-link
                  to="/category/currency"
                  class="flyout__item"
                  active-class="flyout__item--active"
                  >Loại tiền</router-link
                >
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Thiết lập -->
      <div
        class="sidebar__item sidebar__item--has-sub"
        :class="{
          'sidebar__item--sub-open': openMenus.settings,
          'sidebar__item--parent-active': isParentActive([
            '/production/settings/general',
            '/production/settings/permission',
          ]),
        }"
        @click="toggleMenu('settings')"
      >
        <span class="sidebar__icon sidebar__icon--settings"></span>
        <span class="sidebar__label">Thiết lập</span>
        <i class="sidebar__chevron" :class="{ 'sidebar__chevron--open': openMenus.settings }"></i>
      </div>
      <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus.settings }">
        <router-link
          to="/production/settings/general"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Cài đặt chung</router-link
        >
        <router-link
          to="/production/settings/permission"
          class="sidebar__subitem"
          active-class="sidebar__subitem--active"
          >Phân quyền</router-link
        >
      </div>
    </nav>

    <!-- Thu gọn / Mở rộng -->
    <div class="sidebar__footer" @click="toggleCollapse">
      <span
        class="sidebar__icon sidebar__icon--collapse"
        :class="{ 'sidebar__icon--expand': collapsed }"
      ></span>
      <span class="sidebar__label">{{ collapsed ? 'Mở rộng' : 'Thu gọn' }}</span>
    </div>
  </aside>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'

// ===== PROPS & EMITS =====
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:collapsed'])

// ===== ROUTE =====
const route = useRoute()

// ===== COLLAPSE (localStorage) =====
const COLLAPSE_KEY = 'sidebar_collapsed'

function toggleCollapse() {
  const next = !props.collapsed
  localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next))
  emit('update:collapsed', next)
}

// ===== OPEN MENUS (submenu expand/collapse, localStorage) =====
const OPEN_MENUS_KEY = 'sidebar_open_menus'

function loadOpenMenus() {
  try {
    const saved = localStorage.getItem(OPEN_MENUS_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return {}
}

const openMenus = reactive(loadOpenMenus())

function toggleMenu(key) {
  openMenus[key] = !openMenus[key]
  localStorage.setItem(OPEN_MENUS_KEY, JSON.stringify({ ...openMenus }))
}

// ===== PARENT ACTIVE CHECK =====
// Trả về true nếu route hiện tại khớp với bất kỳ path con nào
function isParentActive(childPaths) {
  return childPaths.some((p) => route.path === p || route.path.startsWith(p + '/'))
}

// ===== FLYOUT =====
const showFlyout = ref(false)

// Highlight "Danh mục khác" khi đang ở trong flyout routes
const otherRoutes = ['/category/', '/production/dictionary/shift']
const isOtherActive = computed(() => otherRoutes.some((prefix) => route.path.startsWith(prefix)))
</script>

<style scoped>
/* ===== SIDEBAR ===== */
.sidebar {
  width: var(--sidebar-width, 220px);
  min-width: var(--sidebar-width, 220px);
  background-color: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px);
  position: sticky;
  top: 48px;
  overflow-y: auto;
  overflow-x: visible;
  scrollbar-width: none;
  z-index: 100;
  flex-shrink: 0;
  transition:
    width 0.25s ease,
    min-width 0.25s ease;
}

.sidebar--collapsed {
  width: 52px;
  min-width: 52px;
}

.sidebar::-webkit-scrollbar {
  display: none;
}

/* ===== NAV ===== */
.sidebar__nav {
  flex: 1;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

/* ===== ITEM ===== */
.sidebar__item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 16px;
  color: var(--sidebar-text);
  cursor: pointer;
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  position: relative;
  transition:
    background-color 0.15s,
    color 0.15s;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar__item:hover {
  background-color: rgba(255, 255, 255, 0.07);
  color: var(--sidebar-text-hover);
}

.sidebar__item--active {
  background-color: var(--primary) !important;
  color: #fff !important;
}

.sidebar__item--active .sidebar__icon,
.sidebar__item--active .sidebar__chevron {
  background-color: #fff !important;
}

/* Menu cha active khi con được chọn */
.sidebar__item--parent-active {
  background-color: var(--primary) !important;
  color: #fff !important;
}

.sidebar__item--parent-active .sidebar__icon,
.sidebar__item--parent-active .sidebar__chevron {
  background-color: #fff !important;
}

.sidebar__item--sub-open {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Sub-open bị override nếu parent-active */
.sidebar__item--parent-active.sidebar__item--sub-open {
  background-color: var(--primary) !important;
}

/* ===== LABEL ===== */
.sidebar__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.sidebar--collapsed .sidebar__label {
  opacity: 0;
  pointer-events: none;
  width: 0;
}

/* ===== CHEVRON ===== */
.sidebar__chevron {
  height: 20px;
  width: 20px;
  min-height: 20px;
  min-width: 20px;
  position: relative;
  background-color: var(--sidebar-text);
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.1.2.4);
  mask-position: -200px -16px;
  transition:
    transform 0.2s ease,
    background-color 0.15s;
}

.sidebar__chevron--open {
  transform: rotate(180deg);
}

.sidebar__item:hover .sidebar__chevron {
  background-color: #fff;
}

.sidebar__chevron--right {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M6 4l4 4-4 4' stroke='currentColor' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  transform: none !important;
}

/* ===== SUBMENU ===== */
.sidebar__submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease;
  background-color: rgba(0, 0, 0, 0.15);
}

.sidebar__submenu--open {
  max-height: 300px;
}

.sidebar--collapsed .sidebar__submenu {
  display: none;
}

/* ===== SUBITEM ===== */
.sidebar__subitem {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 7px 16px 7px 46px;
  color: var(--sidebar-text);
  font-size: var(--font-size-base);
  text-decoration: none;
  transition:
    background-color 0.12s,
    color 0.12s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.85;
  position: relative;
}

.sidebar__subitem:hover {
  background-color: rgba(255, 255, 255, 0.07);
  color: var(--sidebar-text-hover);
  opacity: 1;
}

/* Icon mũi tên khi hover subitem */
.sidebar__subitem:hover::before {
  content: '';
  background-color: var(--sidebar-text-hover);
  display: inline-block;
  width: 20px;
  height: 20px;
  -webkit-mask-repeat: no-repeat;
  background-color: #fff;
  mask-position: -58px -67px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
  margin-right: 6px;
  flex-shrink: 0;
}

.sidebar__subitem--active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.08);
  opacity: 1;
}

/* ===== DIVIDER ===== */
.sidebar__divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.08);
  margin: 4px 0;
}

/* ===== FOOTER ===== */
.sidebar__footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: var(--sidebar-text);
  cursor: pointer;
  font-size: 13px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  transition: color 0.15s;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar__footer:hover {
  color: var(--sidebar-text-hover);
}

/* ===== ICONS ===== */
.sidebar__icon {
  width: 20px;
  height: 20px;
  min-height: 20px;
  min-width: 20px;
  background-color: var(--sidebar-text);
  -webkit-mask-repeat: no-repeat;
}

.sidebar__item:hover .sidebar__icon {
  background-color: #fff;
}

.sidebar__icon--overview {
  mask-position: -6px -7px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}

.sidebar__icon--order {
  mask-position: -344px -86px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}

.sidebar__icon--plan {
  mask-position: -32px -7px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}

.sidebar__icon--dispatch {
  mask-position: -57px -7px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--quality {
  mask-position: -110px -6px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--warehouse {
  mask-position: -84px -6px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--task {
  mask-position: -318px -6px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--price {
  mask-position: -345px -5px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.Sprites-1d4aa31f.svg?v=10.1.2.4);
}
.sidebar__icon--outsource {
  mask-position: -214px -146px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--trace {
  mask-position: -214px -146px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--report {
  mask-position: -214px -7px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--product {
  mask-position: -136px -6px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--process {
  mask-position: -162px -6px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--capacity {
  mask-position: -189px -6px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--other {
  mask-position: -240px -6px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--settings {
  mask-position: -266px -6px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--collapse {
  mask-position: -140px -16px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}
.sidebar__icon--expand {
  transform: scaleX(-1);
}

/* ===== FLYOUT MENU ===== */
.sidebar__item--other {
  position: relative;
}

.sidebar__flyout {
  position: fixed;
  left: var(--sidebar-width, 220px);
  top: auto;
  background-color: #1f2937;
  border-radius: 6px;
  box-shadow: 4px 4px 24px rgba(0, 0, 0, 0.5);
  padding: 16px;
  z-index: 9999;
  min-width: 420px;
  margin-top: -9px;
}

.sidebar--collapsed .sidebar__flyout {
  left: 52px;
}

.flyout__columns {
  display: flex;
  gap: 24px;
}

.flyout__col {
  display: flex;
  flex-direction: column;
  min-width: 130px;
}

.flyout__col-title {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 12px 8px;
}

.flyout__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  color: #d1d5db;
  font-size: 13px;
  text-decoration: none;
  border-radius: 4px;
  transition:
    background-color 0.12s,
    color 0.12s;
  white-space: nowrap;
}

.flyout__item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.flyout__item--active {
  background-color: rgba(0, 155, 113, 0.2);
  color: #fff;
}

.flyout__sub-icon {
  width: 14px;
  height: 14px;
  min-width: 14px;
  background-color: var(--primary);
  -webkit-mask-size: auto;
  mask-position: -8px -428px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
  -webkit-mask-repeat: no-repeat;
}

/* ===== FLYOUT TRANSITION ===== */
.flyout-enter-active,
.flyout-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}

/* ===== COLLAPSED TOOLTIP ===== */
.sidebar--collapsed .sidebar__item {
  justify-content: center;
  padding: 9px 0;
}

.sidebar--collapsed .sidebar__footer {
  justify-content: center;
  padding: 12px 0;
}

.sidebar--collapsed .sidebar__chevron {
  display: none;
}
</style>
