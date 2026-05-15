<template>
  <div class="placeholder-page">
    <div class="placeholder-page__content">
      <div class="placeholder-page__icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="40" height="40" rx="8" fill="currentColor" fill-opacity="0.08"/>
          <rect x="12" y="16" width="24" height="3" rx="1.5" fill="currentColor" fill-opacity="0.3"/>
          <rect x="12" y="22" width="18" height="3" rx="1.5" fill="currentColor" fill-opacity="0.3"/>
          <rect x="12" y="28" width="21" height="3" rx="1.5" fill="currentColor" fill-opacity="0.3"/>
        </svg>
      </div>
      <h2 class="placeholder-page__title">{{ pageTitle }}</h2>
      <p class="placeholder-page__desc">{{ $t('common.developing') }}</p>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const route = useRoute()
const pageTitle = computed(() => route.meta?.title || 'Trang')
</script>

<style scoped>
.placeholder-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--main-bg, #f3f4f6);
}

.placeholder-page__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary, #6b7280);
}

.placeholder-page__icon {
  color: var(--text-secondary, #9ca3af);
  margin-bottom: 4px;
}

.placeholder-page__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #374151);
  margin: 0;
}

.placeholder-page__desc {
  font-size: 14px;
  color: var(--text-secondary, #9ca3af);
  margin: 0;
}
</style>
