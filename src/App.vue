<!-- App.vue — ví dụ tích hợp sidebar với localStorage -->
<template>
  <div class="app">
    <!-- Header  -->
    <AppHeader />

    <div class="app__body">
      <!-- Sidebar: dùng v-model:collapsed để đồng bộ 2 chiều -->
      <Sidebar v-model:collapsed="sidebarCollapsed" />

      <!-- Nội dung chính -->
      <main class="app__main">
        <router-view />
      </main>
    </div>
     <!-- Toast notifications -->
    <AppToast />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import Sidebar from '@/components/AppSidebar.vue'
import AppToast from '@/components/AppToast.vue'

// Đọc trạng thái collapse từ localStorage khi app khởi động
const COLLAPSE_KEY = 'sidebar_collapsed'
const sidebarCollapsed = ref(
  JSON.parse(localStorage.getItem(COLLAPSE_KEY) ?? 'false')
)
// Sidebar tự ghi localStorage khi toggle qua emit('update:collapsed')
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app__body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app__main {
  flex: 1;
  overflow-y: auto;
}
</style>
