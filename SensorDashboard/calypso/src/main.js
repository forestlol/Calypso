import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import VueChartkick from 'vue-chartkick'
import 'chartkick/chart.js'
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// import FloatingVue from 'floating-vue'
// import 'floating-vue/dist/style.css'


library.add(fas);
const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(router);
//app.use(FloatingVue);
app.use(VueChartkick);
app.mount('#app');
