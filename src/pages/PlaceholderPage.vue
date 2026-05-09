<template>
  <main class="layout__content">
    <div class="placeholder-page">
      <div class="placeholder-page__icon">
        <i class="fa-solid fa-hammer"></i>
      </div>
      <div class="placeholder-page__title">{{ $route.meta.title || 'Trang' }}</div>
      <div class="placeholder-page__desc">Tính năng đang trong quá trình phát triển</div>
    </div>
  </main>
</template>

<script setup></script>

<style scoped>
/* Placeholder page */
.placeholder-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-white);
  border-radius: 8px;
  gap: 12px;
  color: var(--text-heading);
}
.placeholder-page__icon {
  font-size: 48px;
  opacity: 0.3;
}
.placeholder-page__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-secondary);
}
.placeholder-page__desc {
  font-size: var(--font-size-base);
}
</style>
