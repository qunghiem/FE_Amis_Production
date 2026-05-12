<template>
  <header class="header">
    <!-- Left section -->
    <div class="header__left">
      <div class="header__icon-wrapper tooltip-right" data-tooltip="Tất cả ứng dụng">
        <div class="header__menu-icon"></div>
      </div>

      <!-- Logo MISA -->
      <div class="header__logo">
      </div>

      <!-- App name -->
      <span class="header__app-name">Sản xuất</span>


    </div>

    <!-- Right section -->
    <div class="header__right">
      <!-- Company selector -->
      <div class="header__company" data-tooltip="Công ty cổ phần MISA Test - 345">
        <span class="company-name">Công ty cổ phần MISA Test - 345</span>
        <i class="chevron"></i>
      </div>

      <!-- Danh sách các icon bên phải header -->
      <div class="header__right-setting">
        <!-- Xuất Excel -->
        <div class="" data-tooltip="Xuất Excel">
          <div class="header__icon-btn  header__icon-download"></div>
        </div>

        <div class="nav-separator"></div>

        <!-- Tra cứu tồn kho -->
        <div class="" data-tooltip="Tra cứu tồn kho">
          <div class="header__icon-btn header__icon-package"></div>
        </div>

        <!-- Mời tham gia Misa -->
        <div class="" data-tooltip="Mời tham gia Misa">
          <div class="header__icon-btn header__icon-user"></div>
        </div>

        <!-- Nhắc nhở thông minh -->
        <div class="" data-tooltip="Nhắc nhở thông minh">
          <div class="header__icon-btn header__icon-reminder"></div>
        </div>

        <!-- Thông báo -->
        <div class="" data-tooltip="Thông báo">
          <div class="header__icon-btn header__icon-noti"></div>
        </div>

        <!-- Trợ giúp -->
        <div class="" data-tooltip="Trợ giúp">
          <div class="header__icon-btn header__icon-help"></div>
        </div>

        <!-- Tính năng khác -->
        <div class="" data-tooltip="Tính năng khác">
          <div class="header__icon-btn header__icon-more"></div>
        </div>

         <!-- Kiến thức hữu ích -->
        <div class="" data-tooltip="Kiến thức hữu ích">
          <div class="header__icon-btn header__icon-knowledge"></div>
        </div>

        <!-- Avatar -->
        <div class="header__avatar">
          <img src="https://amisplatform.misacdn.net/APIS/PlatformAPI/api/Avatar/154e11d2-cf4c-44ad-9b8b-9ed40778bf40/jq8vew6b.jpg?avatarID=7c88d81f-ce78-4177-acd0-312a3d27378f&width=64&height=64" alt="">
        </div>
      </div>
    </div>
  </header>
</template>

<script setup></script>

<style scoped>
/* HEADER */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  height: 48px;
  background-color: var(--bg-page);
  border-bottom: 1px solid #D1D5DB;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  width: 100%;
  font-family: Inter;
}

/* Header Left */
.header__left {
  max-width: 200px;
  display: flex;
  gap: 16px;
  align-items: center;
  height: 100%;
}

.header__menu-icon {
  mask-position: 0px -35px;
  cursor: pointer;
  height: 24px;
  width: 24px;
  min-height: 24px;
  min-width: 24px;
  position: relative;
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.1.2.4);
}

.header__logo {
  background-image: url(https://qtsxcdng2.misacdn.net/assets/pas.ic_production_100px-626a0b65.svg?v=10.1.2.4);
  width: 30px;
  height: 30px;
  background-repeat: no-repeat;
  background-size: contain;
}

.header__app-name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-heading);
  white-space: nowrap;
  margin-left: -4px;
}

.header__company {
  display: flex;
  align-items: center;
  font-size: var(--font-size-base);
  color: var(--text-heading);
  cursor: pointer;
  white-space: nowrap;
  font-weight: 700;
  max-width: 440px;
  overflow: hidden;
  position: relative;
  text-overflow: ellipsis;
  gap: 4px;
}

.company-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.header__company .chevron {
  font-size: 10px;
  color: var(--text-heading);
  mask-position: -32px 0px;
  height: 16px;
  width: 16px;
  min-height: 16px;
  min-width: 16px;
  position: relative;
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.1.2.4);
}

/* Header Right */
.header__right {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin-left: 46px;
}

.header__right-setting {
  display: flex;
  align-items: center;
  gap: 11.5px;
}

.header__icon-btn {
  height: 24px;
  width: 24px;
  min-height: 24px;
  min-width: 24px;
  position: relative;
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  cursor: pointer;
}

.header__icon-download {
  mask-position: -744px -36px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.sprite_awh-bc818426.svg?v=10.1.2.4);
}

.nav-separator {
      width: 1px;
    height: 16px;
    background: #D1D5DB;
    align-self: center;
    border-radius: 1px;
}

.header__icon-package {
  background: url(https://qtsxcdng2.misacdn.net/assets/pas.ic_package-e7cf3c47.svg) no-repeat;
}

.header__icon-user {
  width: 32px;
  height: 32px;
  position: relative;
  border-radius: 16px;
  background-position: center;
  background-size: 24px;
  background-repeat: no-repeat;
  overflow: unset;
  background-color: var(--bg-white);
  cursor: pointer;
  background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTEuNSIgY3k9IjUuNSIgcj0iMy41IiBzdHJva2U9IiM3NTc1NzUiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMy41MDYyOSAxNS43NDEzTDMuMTA2NTIgMTYuMjk2NUMxLjM5MTk2IDE4LjY3NzggMy4wOTM2OCAyMiA2LjAyODA0IDIySDE1Ljk3MkMxOC45MDYzIDIyIDIwLjYwOCAxOC42Nzc4IDE4Ljg5MzUgMTYuMjk2NUwxOC40OTM3IDE1Ljc0MTNDMTYuODAyNCAxMy4zOTIyIDE0LjA4NDUgMTIgMTEuMTg5OSAxMkgxMC44MTAxQzcuOTE1NTMgMTIgNS4xOTc2MSAxMy4zOTIyIDMuNTA2MjkgMTUuNzQxM1oiIHN0cm9rZT0iIzc1NzU3NSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTIxIDVWN1Y5IiBzdHJva2U9IiMyQ0EwMUMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xOSA3SDIxSDIzIiBzdHJva2U9IiMyQ0EwMUMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=);
}

.header__icon-user:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.header__icon-reminder {
  background-position: -552px -428px;
  background-color: var(--bg-white);
  background-image: url(https://qtsxcdng2.misacdn.net/assets/pas.Sprites-1d4aa31f.svg?v=10.1.2.4);
}

.header__icon-noti {
  mask-position: -24px -36px;
      -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.1.2.4);
}

.header__icon-help {
  mask-position: -48px -36px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.Icon%20Warehouse-e29a964d.svg?v=10.1.2.4);
}

.header__icon-more {
  mask-position: -8px -428px;
  -webkit-mask-image: url(https://qtsxcdng2.misacdn.net/assets/pas.qtsx_icon-e5768799.svg?v=10.1.2.4);
}


.header__icon-knowledge {
      border-radius: 16px;
    background-position: center;
    background-size: 24px;
    background-repeat: no-repeat;
    overflow: unset;
    cursor: pointer;
    width: 32px;
    height: 32px;
    position: relative;
    background-color: var(--bg-white);
    background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0zIDEwVjIxIiBzdHJva2U9IiNGRkFBMkIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8cGF0aCBkPSJNMyAxMEMzLjA2NjY3IDkuNjY2NjcgMy41NiA5IDUgOSIgc3Ryb2tlPSIjRkZBQTJCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPg0KPHBhdGggZD0iTTIxIDEwQzIwLjkzMzMgOS42NjY2NyAyMC40NCA5IDE5IDkiIHN0cm9rZT0iI0ZGQUEyQiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4NCjxwYXRoIGQ9Ik0yMSAxMFYyMSIgc3Ryb2tlPSIjRkZBQTJCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPg0KPHBhdGggZD0iTTMgMjFDNC4zNjgxNyAyMC4yMSA1LjkyMDE3IDE5Ljc5NDIgNy41IDE5Ljc5NDJDOS4wNzk4MyAxOS43OTQyIDEwLjYzMTggMjAuMjEgMTIgMjFDMTMuMzY4MiAyMC4yMSAxNC45MjAyIDE5Ljc5NDIgMTYuNSAxOS43OTQyQzE4LjA3OTggMTkuNzk0MiAxOS42MzE4IDIwLjIxIDIxIDIxIiBzdHJva2U9IiNGRkFBMkIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8cGF0aCBkPSJNOS42IDEyLjA3MTRDOC45MjgzOCAxMS41NzY3IDguNDMyMjcgMTAuODg3IDguMTgxOTUgMTAuMDk5OUM3LjkzMTYzIDkuMzEyOTEgNy45Mzk3OCA4LjQ2ODQ3IDguMjA1MjYgNy42ODYyNUM4LjQ3MDc1IDYuOTA0MDIgOC45ODAxIDYuMjIzNjYgOS42NjExNiA1Ljc0MTU1QzEwLjM0MjIgNS4yNTk0MyAxMS4xNjA1IDUgMTIgNUMxMi44Mzk1IDUgMTMuNjU3OCA1LjI1OTQzIDE0LjMzODggNS43NDE1NUMxNS4wMTk5IDYuMjIzNjYgMTUuNTI5MyA2LjkwNDAyIDE1Ljc5NDcgNy42ODYyNUMxNi4wNjAyIDguNDY4NDcgMTYuMDY4NCA5LjMxMjkxIDE1LjgxODEgMTAuMDk5OUMxNS41Njc3IDEwLjg4NyAxNS4wNzE2IDExLjU3NjcgMTQuNCAxMi4wNzE0QzE0LjA4NzcgMTIuMzc1MSAxMy44NTI1IDEyLjc0NjcgMTMuNzEzNSAxMy4xNTYyQzEzLjU3NDUgMTMuNTY1NyAxMy41MzU2IDE0LjAwMTYgMTMuNiAxNC40Mjg2QzEzLjYgMTQuODQ1MyAxMy40MzE0IDE1LjI0NSAxMy4xMzE0IDE1LjUzOTdDMTIuODMxMyAxNS44MzQ0IDEyLjQyNDMgMTYgMTIgMTZDMTEuNTc1NyAxNiAxMS4xNjg3IDE1LjgzNDQgMTAuODY4NiAxNS41Mzk3QzEwLjU2ODYgMTUuMjQ1IDEwLjQgMTQuODQ1MyAxMC40IDE0LjQyODZDMTAuNDY0NCAxNC4wMDE2IDEwLjQyNTUgMTMuNTY1NyAxMC4yODY1IDEzLjE1NjJDMTAuMTQ3NSAxMi43NDY3IDkuOTEyMzUgMTIuMzc1MSA5LjYgMTIuMDcxNFoiIHN0cm9rZT0iI0ZGQUEyQiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4NCjxwYXRoIGQ9Ik0xMC4xNjAyIDEyLjg1NzJIMTMuODQwMiIgc3Ryb2tlPSIjRkZBQTJCIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8cGF0aCBkPSJNMTIgMkwxMiAxIiBzdHJva2U9IiNGRkFBMkIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8cGF0aCBkPSJNNyA0TDYuMDQ0OTkgMy43MDM0NCIgc3Ryb2tlPSIjRkZBQTJCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPg0KPHBhdGggZD0iTTE2Ljk5OTggNEwxNy45NTQ4IDMuNzAzNDQiIHN0cm9rZT0iI0ZGQUEyQiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4NCjwvc3ZnPg0K);
}

.header__avatar {
      border-radius: 50%;
    cursor: pointer;
    width: 32px;
    height: 32px;
    overflow: hidden;
    border-width: medium;
    border-style: none;
    border-color: currentcolor;
    border-image: initial;
    margin-left: 15px;
}

.header__avatar img {
  width: 100%;
  height: 100%;
  max-width: 32px;
  max-height: 32px;
}
</style>
