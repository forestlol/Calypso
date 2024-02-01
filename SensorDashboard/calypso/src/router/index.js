import { createRouter, createWebHistory } from 'vue-router';
// import Building from '../views/Home.vue';
// import FloorDetails from '../views/FloorDetail.vue';
// import RoomPage from '../views/RoomDetail.vue';
// import Login from '../views/Login.vue';
// import Sensors from '../components/Sensors.vue';
// import SensorDetails from '../components/SensorDetails.vue';
// import SensorOverview from '../components/SensorOverview.vue';
import auth from '../auth';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guestOnly: true}
  },
  {
    path: '/overview',
    name: 'SensorOverview',
    component: () => import('../components/SensorOverview.vue'),
    meta: { requiresAuth: true}
  },
  {
    path: '/building',
    name: 'Building',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true}
  },
  {
    path: '/building/:buildingId/:floorName',
    name: 'FloorDetails',
    component: () => import('../views/FloorDetail.vue'), // Make sure to import the FloorDetails component at the top
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/building/:buildingName/:floorName/:roomName',
    name: 'RoomPage',
    component: () => import('../views/RoomDetail.vue'),
    props: true,
    meta: { requiresAuth: true}
  },
  {
    path: '/sensors',
    name: 'Sensors',
    component: () => import('../components/Sensors.vue'),
    meta: { requiresAuth: true}
  },
  {
    path: '/sensor/:id',
    component: () => import('../components/SensorDetails.vue'),
    name: 'sensor-details',
    meta: { requiresAuth: true}
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn()) {
    next('/');
  } else if (to.meta.guestOnly && auth.isLoggedIn()) {
    next(`/overview`);
  } else {
    next();
  }
});

export default router;
