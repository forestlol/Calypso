import { createRouter, createWebHistory } from 'vue-router';
// import Building from '../views/Home.vue';
// import FloorDetails from '../views/FloorDetail.vue';
// import RoomPage from '../views/RoomDetail.vue';
// import Login from '../views/Login.vue';
// import Sensors from '../components/Sensors.vue';
// import SensorDetails from '../components/SensorDetails.vue';
// import SensorOverview from '../components/SensorOverview.vue';

import { defineAsyncComponent } from "vue";

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/overview',
    name: 'SensorOverview',
    component: defineAsyncComponent(() => import('../components/SensorOverview.vue')),
  },
  {
    path: '/building',
    name: 'Building',
    component: defineAsyncComponent(() => import('../views/Home.vue')),
  },
  {
    path: '/building/:buildingId/:floorName',
    name: 'FloorDetails',
    component: defineAsyncComponent(() => import('../views/FloorDetail.vue')), // Make sure to import the FloorDetails component at the top
    props: true,
  },
  {
    path: '/building/:buildingName/:floorName/:roomName',
    name: 'RoomPage',
    component: defineAsyncComponent(() => import('../views/RoomDetail.vue')),
    props: true,
  },
  {
    path: '/sensors',
    name: 'Sensors',
    component: defineAsyncComponent(() => import('../components/Sensors.vue')),
  },
  {
    path: '/notification',
    name: 'Notification',
    component: defineAsyncComponent(() => import('../views/NotificationConfig.vue')),
  },
  {
    path: '/sensor/:id',
    component: defineAsyncComponent(() => import('../components/SensorDetails.vue')),
    name: 'sensor-details',
  },
  {
    path: '/Bms',
    name: 'BMS',
    component: defineAsyncComponent(() => import('../views/Bms.vue')),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// router.beforeEach((to, from, next) => {
//   if (to.meta.requiresAuth) {
//     next('/');
//   } else if (to.meta.guestOnly) {
//     next(`/overview`);
//   } else {
//     next();
//   }
// });

export default router;
