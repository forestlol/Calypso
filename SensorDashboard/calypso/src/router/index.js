import { createRouter, createWebHistory } from 'vue-router';
import Building from '../views/Home.vue';
import FloorPage from '../views/FloorDetail.vue';
import RoomPage from '../views/RoomDetail.vue';
import Login from '../views/Login.vue';
import Sensors from '../components/Sensors.vue';
import SensorDetails from '../components/SensorDetails.vue';
import SensorOverview from '../components/SensorOverview.vue';
import auth from '../auth';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true}
  },
  {
    path: '/overview',
    name: 'SensorOverview',
    component: SensorOverview,
    meta: { requiresAuth: true}
  },
  {
    path: '/building',
    name: 'Building',
    component: Building,
    meta: { requiresAuth: true}
  },
  {
    path: '/building/:buildingId',
    name: 'FloorPage',
    component: FloorPage,
    props: true,
    meta: { requiresAuth: true}
  },
  {
    path: '/building/:buildingId/floor/:floorId',
    name: 'RoomPage',
    component: RoomPage,
    props: true,
    meta: { requiresAuth: true}
  },
  {
    path: '/sensors',
    name: 'Sensors',
    component: Sensors,
    meta: { requiresAuth: true}
  },
  {
    path: '/sensor/:id',
    component: SensorDetails,
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
