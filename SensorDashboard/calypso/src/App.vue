<template>

    <nav v-if="isLoggedIn" class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <router-link to="/overview" class="navbar-brand">Calypso</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ml-auto">
            <li class="nav-item">
              <router-link to="/overview" class="nav-link">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/building" class="nav-link">Buildings</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/sensors" class="nav-link">Sensors</router-link>
            </li>
            <!-- You can add more navigation links as required -->
          </ul>
          <div v-if="isLoggedIn" class="ms-auto">
            <button @click="logout" class="btn btn-outline-danger">Logout</button>
          </div>
        </div>
      </div>
    </nav>

      <div>
        <RouterView v-slot="{ Component }">
          <template v-if="Component">
            <Suspense>
              <component :is="Component" />
              <template #fallback>
                <div style="font-size: 1.5rem">Loading...</div>
              </template>
            </Suspense>
          </template>
        </RouterView>
      </div>
</template>

<script>
  import auth from '@/auth.js';
  import { Suspense } from 'vue';

  export default {
    data() {
      return {
        delayed:false,
      };
    },
    name: 'App',
    computed: {
      isLoggedIn(){
        return auth.isLoggedIn();
      }
    }, 
    async mounted() {
      await this.beforeRouteEnter();
      this.delayed = true;
    },
    methods: {
      logout() {
        auth.logout();
        this.$router.push('/');
      },
      delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      },
      // async delayedLoad(ms) {
      // await new Promise(resolve => setTimeout(resolve, ms));
      // // Perform additional logic if needed
      // },
      // beforeRouteEnter(to, from, next) {
      // // Delay the loading of the route by 2 seconds
      //   this.delayedLoad(2000).then(() => {
      //     next();
      //   });
      // },
      async beforeRouteEnter(to, from, next) {
        // Introduce a delay of 10 seconds before entering the route
        await this.delay(10000);
        next();
      },
    }
  };
</script>

<style>

  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    background-color: #2c323c !important;;
    color: rgb(216, 216, 216) !important;;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 300;
    color: #3590f3;
  }

  h1 {
    font-size: 2.5em;
    margin-bottom: 0.5em;
    color: rgb(216, 216, 216) !important;;
  }

  h2{
    color: rgb(150, 150, 150) !important;;
  }

  h3 {
    color: rgb(216, 216, 216) !important;;
  }

  h5 {
    font-size: 1.125em;
    margin-bottom: 1em;
  }

  .nav-link {
    font-weight: 500;
  }
  
  .container {
    padding: 15px;
  }

  .navbar {
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    background-color: #ffffff;
  }

  .card {
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .btn-outline-danger {
    color: #d9534f;
    border-color: #d9534f;
    padding: 5px 15px;
    transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
  }

  .btn-outline-danger:hover {
    background-color: #d9534f;
    color: #ffffff;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .btn-logout-container {
    padding-left: 15px;
    display: flex;
  }
</style>

