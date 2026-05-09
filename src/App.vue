<template>
  <!-- Header  -->
  <AppHeader />

  <!-- Nội dung  -->
  <section class="app-layout">
    <!-- Sidebar  -->
    <AppSidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />
    <router-view />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'

// Key lưu trạng thái sidebar trong localStorage
const SIDEBAR_KEY = 'amis_sidebar_collapsed'

// Khởi tạo từ localStorage, mặc định là mở rộng (false)
const sidebarCollapsed = ref(false)

onMounted(() => {
  const saved = localStorage.getItem(SIDEBAR_KEY)
  if (saved !== null) {
    sidebarCollapsed.value = saved === 'true'
  }
})

// Toggle sidebar và lưu trạng thái vào localStorage
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem(SIDEBAR_KEY, String(sidebarCollapsed.value))
}
</script>
