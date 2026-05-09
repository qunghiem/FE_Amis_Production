<!-- Trang Ca làm việc  -->
<template>
  <main class="layout__content">
    <!-- Title header -->
    <div class="shift-page__header">
      <h1 class="shift-page__title">Ca làm việc</h1>
      <div class="shift-page__actions">
        <button class="btn btn--primary" @click="handleAdd">
          <i class="fa-solid fa-plus"></i>
          Thêm
        </button>
      </div>
    </div>

    <!-- Content container -->
    <div class="shift-page__content">
      <!-- Search bar -->
      <div class="shift-page__toolbar">
        <div class="shift-page__search">
          <i class="fa-solid fa-magnifying-glass shift-page__search-icon"></i>
          <input type="text" class="shift-page__search-input" placeholder="Tìm kiếm" />
        </div>
      </div>

      <!-- Table placeholder - sẽ xây dựng chi tiết ở bước sau -->
      <div class="shift-page__table-area">
        <p style="color: #888; text-align: center; padding: 40px">
          Bảng dữ liệu Ca làm việc sẽ được xây dựng ở bước tiếp theo.
        </p>
      </div>

      <!-- Footer pagination placeholder -->
      <div class="shift-page__footer">
        <span>Tổng số: 0</span>
        <div class="shift-page__pagination">
          <span>Số dòng/trang</span>
          <select>
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
          <span>1 - 10</span>
          <button disabled><i class="fa-solid fa-chevron-left"></i></button>
          <button disabled><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
function handleAdd() {
  alert('Tính năng Thêm Ca làm việc sẽ được xây dựng ở bước tiếp theo.')
}
</script>

<style scoped>
.shift-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.shift-page__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}
.shift-page__actions {
  display: flex;
  gap: 8px;
}

/* Button styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
}
.btn--primary {
  background-color: var(--primary);
  color: #fff;
}
.btn--primary:hover {
  background-color: var(--primary-light);
}

/* Content */
.shift-page__content {
  flex: 1;
  background-color: var(--bg-white);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Toolbar */
.shift-page__toolbar {
  padding: 16px;
  display: flex;
  align-items: center;
}
.shift-page__search {
  position: relative;
  width: 250px;
}
.shift-page__search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-heading);
  font-size: 13px;
}
.shift-page__search-input {
  width: 100%;
  padding: 8px 10px 8px 32px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
}
.shift-page__search-input:focus {
  border-color: var(--primary);
}

/* Table area */
.shift-page__table-area {
  flex: 1;
  overflow: auto;
}

/* Footer */
.shift-page__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-top: 1px solid var(--border-light);
  background-color: #fafafa;
  font-size: 13px;
  color: var(--text-secondary);
}
.shift-page__pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}
.shift-page__pagination select {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}
.shift-page__pagination button {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-secondary);
}
.shift-page__pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
