<template>
    <header :class="['app-header', { collapsed }]">
        <!-- Hamburger Menu -->
        <button class="hamburger-menu" @click="$emit('toggle-sidebar')">
            <i class="fas fa-bars"></i>
        </button>

        <!-- Header Right -->
        <div class="header-right">
            <!-- Full Screen Toggle (hidden) -->
            <button class="header-icon fullscreen-toggle" @click="toggleFullScreen">
                <i class="fas fa-expand"></i>
            </button>

            <!-- Dark/Light Mode Toggle -->
            <button class="header-icon" @click="toggleTheme">
                <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
            </button>

            <!-- User Icon & Logout -->
            <div class="profile-container">
                <button class="header-icon user-icon" @click="toggleLogoutMenu">
                    <i class="fas fa-user"></i>
                </button>
                <button v-if="showLogoutMenu" class="logout-btn" @click="confirmLogout">
                    Logout
                </button>
            </div>
        </div>
    </header>
</template>

<script>
import Swal from 'sweetalert2'

export default {
    name: 'AppHeader',
    props: {
        collapsed: { type: Boolean, default: false },
    },
    data() {
        return {
            isDarkMode: false,
            showLogoutMenu: false,
        }
    },
    methods: {
        toggleTheme() {
            this.isDarkMode = !this.isDarkMode
            document.body.classList.toggle('dark-mode', this.isDarkMode)
        },
        toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
            } else if (document.exitFullscreen) {
                document.exitFullscreen()
            }
        },
        toggleLogoutMenu() {
            this.showLogoutMenu = !this.showLogoutMenu
        },
        confirmLogout() {
            this.showLogoutMenu = false
            Swal.fire({
                title: 'Are you sure?',
                text: 'You will be logged out of your session.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, logout',
                cancelButtonText: 'Cancel',
            }).then((result) => {
                if (result.isConfirmed) this.logout()
            })
        },
        logout() {
            this.$router.push({ name: 'Login' })
        },
    },
}
</script>

<style scoped>
:root {
    /* Light Mode */
    --header-bg-color: #f1f5f9;
    --header-text-color: #1e293b;
    --header-border-color: #e2e8f0;
    --header-icon-color: #4b5563;
    --header-icon-hover-color: #1f2937;

    --sidebar-bg-color: #1e293b;
    --sidebar-text-color: #fff;
    --sidebar-hover-color: #334155;

    --main-bg-color: #f8f9fa;
    --main-text-color: #1e293b;
}

body.dark-mode {
    /* Dark Mode */
    --header-bg-color: #1e293b;
    --header-text-color: #f1f5f9;
    --header-border-color: #334155;
    --header-icon-color: #9ca3af;
    --header-icon-hover-color: #e5e7eb;

    --sidebar-bg-color: #0f172a;
    --sidebar-text-color: #9ca3af;
    --sidebar-hover-color: #1e293b;

    --main-bg-color: #111827;
    --main-text-color: #e5e7eb;
}

.app-header {
    height: 60px;
    background-color: var(--header-bg-color);
    border-bottom: 1px solid var(--header-border-color);
    padding: 0 20px;
    display: flex;
    align-items: center;
    position: fixed;
    top: 0;
    left: 250px;
    /* sidebar width */
    width: calc(100% - 250px);
    z-index: 10;
    /* above sidebar’s 100 */
    transition: left 0.3s, width 0.3s;
    box-sizing: border-box;
    color: var(--header-text-color);
}

.app-header.collapsed {
    left: 80px;
    /* collapsed sidebar */
    width: calc(100% - 80px);
}

.hamburger-menu {
    background: none;
    border: none;
    color: var(--header-text-color);
    font-size: 24px;
    cursor: pointer;
    margin-right: 20px;
}

.header-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 15px;
}

.header-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    color: var(--header-icon-color);
    transition: color 0.3s;
}

.header-icon:hover {
    color: var(--header-icon-hover-color);
}

/* Hide fullscreen toggle entirely */
.fullscreen-toggle {
    display: none;
}

.profile-container {
    position: relative;
}

.logout-btn {
    position: absolute;
    top: 36px;
    right: 0;
    background-color: #d1d5db;
    color: var(--header-text-color);
    border: 1px solid var(--header-border-color);
    border-radius: 4px;
    padding: 6px 12px;
    white-space: nowrap;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: background 0.2s, color 0.2s;
}

.logout-btn:hover {
    background-color: #9ca0a5;
    color: var(--header-bg-color);
}

/* ------------------------------------------
   RESPONSIVE: tablet & below (<=992px)
-------------------------------------------*/
@media (max-width: 991.98px) {

    .app-header,
    .app-header.collapsed {
        left: 0 !important;
        width: 100% !important;
        box-sizing: border-box;
        padding: 0 20px;
        /* keep your side padding */
    }
}

/* tighten gaps on phones */
@media (max-width: 767.98px) {
    .header-right {
        gap: 10px;
    }
}

/* shrink icons on small phones */
@media (max-width: 575.98px) {

    .hamburger-menu,
    .header-icon {
        font-size: 18px;
    }

    .logout-btn {
        top: 30px;
        padding: 4px 8px;
        font-size: 0.9rem;
    }
}
</style>
