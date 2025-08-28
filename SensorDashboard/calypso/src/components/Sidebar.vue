<template>
    <aside :class="['app-sidebar', { collapsed }]">
        <!-- Mobile Close Button -->
        <button class="close-btn" @click="$emit('toggle-sidebar')">
            <i class="fas fa-times"></i>
        </button>

        <!-- Logo Section -->
        <div class="logo-section">
            <img src="@/assets/cavill_logo.png" alt="Logo" class="logo" />
        </div>

        <!-- Menu -->
        <nav>
            <div class="menu-section">
                <span class="menu-title" v-if="!collapsed">Menu</span>
                <ul class="menu">
                    <li class="menu-item">
                        <router-link to="/overview" class="menu-link" exact-active-class="router-link-exact-active">
                            <i class="fas fa-home"></i>
                            <span v-if="!collapsed">Home</span>
                        </router-link>
                    </li>
                    <li class="menu-item">
                        <router-link to="/building" class="menu-link" exact-active-class="router-link-exact-active">
                            <i class="fas fa-building"></i>
                            <span v-if="!collapsed">Buildings</span>
                        </router-link>
                    </li>
                    <li class="menu-item">
                        <router-link to="/sensors" class="menu-link" exact-active-class="router-link-exact-active">
                            <i class="fas fa-microchip"></i>
                            <span v-if="!collapsed">Sensors</span>
                        </router-link>
                    </li>
                    <li class="menu-item">
                        <router-link to="/bms" class="menu-link" exact-active-class="router-link-exact-active">
                            <i class="fas fa-cogs"></i>
                            <span v-if="!collapsed">BMS</span>
                        </router-link>
                    </li>
                    <li class="menu-item">
                        <router-link to="/smart-toilet" class="menu-link" exact-active-class="router-link-exact-active">
                            <i class="fas fa-droplet"></i>
                            <span v-if="!collapsed">Smart Toilet</span>
                        </router-link>
                    </li>
                </ul>
            </div>
        </nav>
    </aside>
</template>

<script>
export default {
    props: {
        collapsed: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style scoped>
.app-sidebar {
    width: 250px;
    background-color: #1e293b;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    transition: width 0.3s, transform 0.3s;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 100;
    display: flex;
    flex-direction: column;
}

.app-sidebar.collapsed {
    width: 80px;
    transform: translateX(0);
}

/* Mobile Close Button */
.close-btn {
    display: none;
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 24px;
    color: white;
    cursor: pointer;
    z-index: 110;
}

/* Logo Section */
.logo-section {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-bottom: 1px solid #334155;
}

.logo {
    height: 40px;
}

/* Menu Section */
.menu-section {
    margin-top: 10px;
    padding: 0;
}

.menu-title {
    font-size: 12px;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 10px;
    display: block;
    padding-left: 20px;
}

/* Menu */
.menu {
    list-style: none;
    padding: 0;
    margin: 0;
}

.menu-item {
    padding: 10px 0;
}

.menu-link {
    text-decoration: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: left;
    padding: 10px 18px;
    transition: background 0.3s, justify-content 0.3s, padding 0.3s;
    border-radius: 4px;
}

.app-sidebar.collapsed .menu-link {
    justify-content: center;
    padding: 10px 0;
}

.menu-link i {
    font-size: 20px;
}

.menu-link span {
    margin-left: 10px;
}

.menu-link:hover {
    background: #334155;
}

.menu-link.router-link-exact-active {
    background: #475569;
    color: #ffffff;
    font-weight: bold;
}

/* -----------------------------------
   RESPONSIVE BEHAVIOR
------------------------------------*/

/* Tablet and below: off‑canvas + show close button */
@media (max-width: 991.98px) {
    .app-sidebar {
        transform: translateX(-100%);
        width: 250px;
        /* width when open */
    }

    .app-sidebar.collapsed {
        transform: translateX(0);
    }

    .close-btn {
        display: block;
    }
}

/* Mobile: slightly narrower + adjust logo/menu spacing */
@media (max-width: 575.98px) {
    .app-sidebar {
        transform: translateX(-100%);
        width: 220px;
    }

    .app-sidebar.collapsed {
        transform: translateX(0);
        width: 100%;
    }

    .logo-section {
        padding: 10px;
    }

    .logo {
        height: 30px;
    }

    .menu-item {
        padding: 8px 0;
    }

    .menu-link {
        padding: 8px 12px;
    }

    .menu-link i {
        font-size: 18px;
    }
}
</style>
