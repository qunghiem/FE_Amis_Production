<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <nav class="sidebar__nav">
      <template v-for="(item, index) in MENU_CONFIG" :key="index">

        <!-- thanh ngang -->
        <div v-if="item.type === 'divider'" class="sidebar__divider" />

        <!-- Flyout (Danh mục khác) -->
        <div
          v-else-if="item.type === 'flyout'"
          class="sidebar__item sidebar__item--other"
          :class="{ 'sidebar__item--active': isOtherActive(item) }"
          @mouseenter="showFlyout = true"
          @mouseleave="showFlyout = false"
        >
          <span class="sidebar__icon" :class="`sidebar__icon--${item.icon}`" />
          <span class="sidebar__label">{{ item.label }}</span>
          <i class="sidebar__chevron sidebar__chevron--right" />

          <transition name="flyout">
            <div class="sidebar__flyout" v-show="showFlyout">
              <div class="flyout__columns">
                <div v-for="col in item.columns" :key="col.title" class="flyout__col">
                  <div class="flyout__col-title">{{ col.title }}</div>
                  <router-link
                    v-for="link in col.items"
                    :key="link.to"
                    :to="link.to"
                    class="flyout__item"
                    active-class="flyout__item--active"
                  >
                    {{ link.label }}
                  </router-link>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Item có submenu -->
        <template v-else-if="item.children">
          <div
            class="sidebar__item sidebar__item--has-sub"
            :class="{
              'sidebar__item--sub-open': openMenus[item.key],
              'sidebar__item--parent-active':
                openMenus[item.key] && isParentActive(item.children.map((c) => c.to)),
            }"
            @click="toggleMenu(item.key)"
          >
            <span class="sidebar__icon" :class="`sidebar__icon--${item.icon}`" />
            <span class="sidebar__label">{{ item.label }}</span>
            <i
              class="sidebar__chevron"
              :class="{ 'sidebar__chevron--open': openMenus[item.key] }"
            />
          </div>
          <div class="sidebar__submenu" :class="{ 'sidebar__submenu--open': openMenus[item.key] }">
            <router-link
              v-for="child in item.children"
              :key="child.to"
              :to="child.to"
              class="sidebar__subitem"
              active-class="sidebar__subitem--active"
            >
              {{ child.label }}
            </router-link>
          </div>
        </template>

        <!-- Item đơn -->
        <router-link
          v-else
          :to="item.to"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isExactActive(item.to) }"
        >
          <span class="sidebar__icon" :class="`sidebar__icon--${item.icon}`" />
          <span class="sidebar__label">{{ item.label }}</span>
        </router-link>
      </template>
    </nav>

    <!-- Thu gọn / Mở rộng -->
    <div class="sidebar__footer" @click="toggleCollapse">
      <span
        class="sidebar__icon sidebar__icon--collapse"
        :class="{ 'sidebar__icon--expand': collapsed }"
      />
      <span class="sidebar__label">{{ collapsed ? 'Mở rộng' : 'Thu gọn' }}</span>
    </div>
  </aside>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { MENU_CONFIG } from './sidebar.config'

const props = defineProps({ collapsed: { type: Boolean, default: false } })
const emit = defineEmits(['update:collapsed'])
const route = useRoute()

// ── Collapse ──────────────────────────────────────────────────────────────────
const COLLAPSE_KEY = 'sidebar_collapsed'
function toggleCollapse() {
  const next = !props.collapsed
  localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next))
  emit('update:collapsed', next)
}

// ── Open menus ────────────────────────────────────────────────────────────────
const OPEN_MENUS_KEY = 'sidebar_open_menus'

function loadOpenMenus() {
  try {
    const saved = localStorage.getItem(OPEN_MENUS_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return {}
}

const openMenus = reactive(loadOpenMenus())

// Build map: key → [child routes] — tính từ config, không hardcode
const menuRoutes = Object.fromEntries(
  MENU_CONFIG.filter((item) => item.key && item.children).map((item) => [
    item.key,
    item.children.map((c) => c.to),
  ]),
)

// Tự động mở menu khi route thay đổi
watch(
  () => route.path,
  (newPath) => {
    Object.keys(menuRoutes).forEach((key) => {
      openMenus[key] = menuRoutes[key].some((p) => newPath === p || newPath.startsWith(p + '/'))
    })
    localStorage.setItem(OPEN_MENUS_KEY, JSON.stringify({ ...openMenus }))
  },
  { immediate: true },
)

function toggleMenu(key) {
  const isOpen = openMenus[key]
  Object.keys(openMenus).forEach((k) => {
    openMenus[k] = false
  })
  openMenus[key] = !isOpen
  localStorage.setItem(OPEN_MENUS_KEY, JSON.stringify({ ...openMenus }))
}

// ── Active helpers ─────────────────────────────────────────────────────────────
function isExactActive(path) {
  return route.path === path && !Object.values(openMenus).some(Boolean)
}

function isParentActive(childPaths) {
  return childPaths.some((p) => route.path === p || route.path.startsWith(p + '/'))
}

// Flyout active: kiểm tra các prefix từ config
function isOtherActive(item) {
  return (
    item.activePrefixes.some((prefix) => route.path.startsWith(prefix)) &&
    !Object.values(openMenus).some(Boolean)
  )
}

const showFlyout = ref(false)
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
  width: 60px;
  min-width: 60px;
}

.sidebar::-webkit-scrollbar {
  display: none;
}

/* ===== NAV ===== */
.sidebar__nav {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  gap: 4px;
  border-bottom: 1px solid rgba(209, 213, 219, .3);
}

/* ===== ITEM ===== */
.sidebar__item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 16px;
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
  border-radius: 4px;
}

.sidebar__item:hover {
  background-color: rgba(255, 255, 255, 0.07);
  color: var(--sidebar-text-hover);
}

.sidebar__item--active,
.sidebar__item--parent-active,
.sidebar__item--sub-open {
  background-color: var(--primary) !important;
  color: #fff !important;
}

.sidebar__item--active .sidebar__icon,
.sidebar__item--active .sidebar__chevron,
.sidebar__item--parent-active .sidebar__icon,
.sidebar__item--parent-active .sidebar__chevron,
.sidebar__item--sub-open .sidebar__icon,
.sidebar__item--sub-open .sidebar__chevron {
  background-color: #fff !important;
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
  display: none;
}

/* ===== CHEVRON ===== */
.sidebar__chevron {
  height: 20px;
  width: 20px;
  min-height: 20px;
  min-width: 20px;
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
  gap: 9px;
  padding: 8px 16px;
  color: var(--sidebar-text);
  font-size: 13px;
  font-weight: 400;
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

.sidebar__subitem::before {
  content: '';
  background-color: var(--sidebar-text);
  visibility: hidden;
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  flex-shrink: 0;
  -webkit-mask-repeat: no-repeat;
  mask-position: -58px -67px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}

.sidebar__subitem:hover::before,
.sidebar__subitem--active::before {
  visibility: visible;
  background-color: #fff;
}

.sidebar__subitem--active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.08);
  opacity: 1;
}

/* ===== FOOTER ===== */
.sidebar__footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  color: var(--sidebar-text);
  cursor: pointer;
  font-size: 13px;
  transition: color 0.15s;
  white-space: nowrap;
  overflow: hidden;
  margin: auto auto;
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
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.Sprites-1d4aa31f.svg?v=10.1.2.4);
}
.sidebar__icon--trace {
  mask-position: -214px -146px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.Sprites-1d4aa31f.svg?v=10.1.2.4);
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
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.1.2.4);
}
.sidebar__icon--expand {
  transform: scaleX(-1);
}

/* ===== FLYOUT ===== */
.sidebar__item--other {
  position: relative;
}

.sidebar__flyout {
  position: fixed;
  left: calc(var(--sidebar-width) + 15px);
  background-color: var(--sidebar-bg);
  border-radius: 6px;
  box-shadow: 4px 4px 24px rgba(0, 0, 0, 0.5);
  padding: 20px 30px;
  z-index: 9999;
  min-width: 420px;
}

.sidebar--collapsed .sidebar__flyout {
  left: 52px;
}

.flyout__columns {
  display: flex;
  gap: 24px;
  background: var(--sidebar-bg);
}

.flyout__col {
  display: flex;
  flex-direction: column;
  min-width: 130px;
  gap: 4px;
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
  gap: 7px;
  padding: 8px 4px;
  color: var(--sidebar-text);
  font-size: var(--font-size-base);
  font-weight: 400;
  text-decoration: none;
  transition:
    background-color 0.12s,
    color 0.12s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.85;
  position: relative;
      margin-left: -19px;
      border-radius: 4px;
}

.flyout__item::before {
  content: '';
  background-color: var(--sidebar-text);
  visibility: hidden;
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  flex-shrink: 0;
  -webkit-mask-repeat: no-repeat;
  mask-position: -58px -67px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}

.flyout__item:hover::before,
.flyout__item--active::before {
  visibility: visible;
  background-color: #fff;
}

.flyout__item:hover {
  background-color: #252C3B;
  color: #fff;
  opacity: 1;
}

.flyout__item--active {
    background-color: #4B5563;

  color: #fff;
  opacity: 1;
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

/* ===== COLLAPSED ===== */
.sidebar--collapsed .sidebar__item {
  justify-content: center;
  padding: 8px;
}

.sidebar--collapsed .sidebar__footer {
  justify-content: center;
  /* padding: 12px 0; */
}



.sidebar--collapsed .sidebar__chevron {
  display: none;
}

/* ===== DIVIDER ===== */
.sidebar__divider {
  height: 1px;
  background-color: rgba(209, 213, 219, .3);
  margin: 4px 0;
}
</style>
