import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '../views/Home.vue';
import FloorPage from '../views/FloorDetail.vue';
import RoomPage from '../views/RoomDetail.vue';

const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage
  },
  {
    path: '/building/:buildingId',
    name: 'FloorPage',
    component: FloorPage,
    props: true
  },
  {
    path: '/building/:buildingId/floor/:floorId',
    name: 'RoomPage',
    component: RoomPage,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

export default router;
