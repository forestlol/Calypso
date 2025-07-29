<template>
  <router-view v-slot="{ Component, route }">
    <!-- Routes like Login with hideLayout go full‑screen -->
    <component v-if="route.meta.hideLayout" :is="Component" />

    <!-- Otherwise wrap in sidebar + header + content -->
    <div v-else class="layout">
      <AppSidebar :collapsed="collapsed" @toggle-sidebar="toggleSidebar" />
      <div :class="['main-content', { collapsed }]">
        <AppHeader :collapsed="collapsed" @toggle-sidebar="toggleSidebar" />
        <!-- your actual page content sits here -->
        <component :is="Component" />
      </div>
    </div>
  </router-view>
</template>

<script>
import AppSidebar from './components/Sidebar.vue'
import AppHeader from './components/AppHeader.vue'

export default {
  name: 'App',
  components: { AppSidebar, AppHeader },
  data() {
    return {
      collapsed: false
    }
  },
  methods: {
    toggleSidebar() {
      this.collapsed = !this.collapsed
    }
  }
}
</script>

<style>
/* 1) Flex container for sidebar + content */
.layout {
  display: flex;
}

/* 2) Main‑content is pushed right by sidebar on desktop */
.main-content {
  flex: 1;
  min-height: 100vh;
  margin-left: 260px;
  /* full sidebar width */
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;

  /* ↑ NEW: space for fixed header */
  padding-top: 60px;
}

/* 3) When sidebar is collapsed to mini: smaller offset */
.main-content.collapsed {
  margin-left: 80px;
  /* collapsed sidebar width */
  padding-top: 60px;
  /* keep header space */
}

/* 4) RESPONSIVE OVERRIDE: BELOW TABLET (≤992px) */
@media (max-width: 991.98px) {

  /* remove any left‑margin so content is full‑width */
  .main-content,
  .main-content.collapsed {
    margin-left: 0 !important;
    /* still keep the header spacing */
    padding-top: 60px !important;
  }
}

/* 5) ensure children fill edge‑to‑edge if needed */
:deep(.layout)+* {
  width: 100%;
  height: 100%;
}
</style>

<!-- App.vue -->
<style>
html,
body {
  margin: 0;
  padding: 0;
  background-color: #2c323c;
  /* match your page background */
}
</style>
