<template>
    <aside class="sidebar">
        <nav>
            <router-link to="/overview" class="sidebar-link" exact-active-class="active">
                <i class="fa fa-home"></i>
                <span>Home</span>
            </router-link>
            <router-link to="/building" class="sidebar-link" exact-active-class="active">
                <i class="fa fa-building"></i>
                <span>Buildings</span>
            </router-link>
            <router-link to="/sensors" class="sidebar-link" exact-active-class="active">
                <i class="fa fa-microchip"></i>
                <span>Sensors</span>
            </router-link>
            <router-link to="/bms" class="sidebar-link" exact-active-class="active">
                <i class="fa fa-cogs"></i>
                <span>Bms</span>
            </router-link>
        </nav>
    </aside>
</template>

<script>
export default {};
</script>

<style scoped>
.sidebar {
    width: 220px;
    background: #202939;
    color: #fff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding-top: 56px;
    /* aligns links below the header */
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
}

nav {
    display: flex;
    flex-direction: column;
    margin-top: 1.5rem;
}

.sidebar-link {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    color: #fff;
    text-decoration: none;
    font-weight: 500;
    border-radius: 6px;
    margin-bottom: 4px;
    transition: background 0.15s;
}

.sidebar-link.active,
.sidebar-link:hover {
    background: #2d3a4d;
    color: #fff;
}

.sidebar-link i {
    margin-right: 12px;
    font-size: 1.15rem;
}
</style>
