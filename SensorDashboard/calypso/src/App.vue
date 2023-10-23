<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <router-link to="/" class="navbar-brand">Sensor Dashboard</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/sensors" class="nav-link">Sensors</router-link>
          </li>
          <!-- You can add more navigation links as required -->
        </ul>
        <button v-if="isLoggedIn" @click="logout" class="btn btn-outline-danger ml-auto">Logout</button>
      </div>
    </div>
  </nav>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
import auth from '@/auth.js';

export default {
  name: 'App',
  computed: {
    isLoggedIn() {
      return auth.isLoggedIn();
    }
  },
  methods: {
    logout() {
      auth.logout();
      this.$router.push('/');
    }
  }
};


</script>


<style>
  body {
    background-color: #f7f7f7;
    font-family: 'Arial', sans-serif;
  }

  h1, h5 {
    color: #333;
  }

  .card {
    border-radius: 10px;
  }

  .btn-outline-primary {
    border-width: 2px;
  }
</style>

