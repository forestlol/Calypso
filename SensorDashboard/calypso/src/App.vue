<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
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
    <router-view></router-view>
  </div>
</template>

<script>
  import auth from '@/auth.js';

  export default {
    name: 'App',
    computed: {
      isLoggedIn(){
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
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    background-color: #fafafa;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 300;
  }

  h1 {
    font-size: 2.5em;
    margin-bottom: 0.5em;
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

