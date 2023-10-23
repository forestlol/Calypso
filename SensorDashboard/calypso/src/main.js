import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import VueChartkick from 'vue-chartkick'
import 'chartkick/chart.js'


const app = createApp(App);
app.use(router);
app.use(VueChartkick);
app.mount('#app');
