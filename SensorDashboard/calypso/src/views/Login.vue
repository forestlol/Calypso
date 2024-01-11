<template>

  <div class="row vh-100 g-0">
    <!-- Left Side -->
    <div class="col-lg-6 position-relative d-none d-lg-block">
      <div class="bg-holder" :style="backgroundImageStyle">
      </div>
    </div>

    <!-- Right Side-->
    <div class="col-lg-6">
      <div class="row align-items-center justify-content-center h-100 g-0 px-4 px-sm-0">
        <div class="col col-sm-6 col-lg-7 col-xl-6">
          <!-- Logo -->
          <a href="#" class="d-flex justify-content-center mb-4">
            <img src="@/assets/calypso.png" alt="" width="60">
          </a>

          <div class="text-center mb-5">
            <h3 class="fw-bold">Log In</h3>
            <p class="text-secondary"> Get access to your account</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input id="username" class="form-control" v-model.trim="username" required />
          </div>
          <div class="mb-4">
            <label for="password" class="form-label">Password</label>
            <input id="password" type="password" class="form-control" v-model.trim="password" required />
          </div>
          <button type="submit" class="btn btn-primary btn-block mb-3" :disabled="isLoggingIn" @click="handleLogin">
            <span v-if="isLoggingIn" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isLoggingIn ? 'Logging in...' : 'Login' }}
          </button>
          <div v-if="loginError" class="alert alert-danger mt-3">Invalid login credentials</div>
        </form>
        
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import auth from '../auth.js';

export default {
  data() {
    return {
      username: '',
      password: '',
      isLoggingIn: false,
      loginError: false,
      backgroundImageStyle: {
        backgroundImage: `url(${new URL('../assets/login.png', import.meta.url)})`
      }
    };
  },
  methods: {
    async handleLogin() {
      this.isLoggingIn = true;
      this.loginError = false;

      try {
        const success = await auth.login(this.username, this.password);
        if (success) {
          this.$router.push(`/overview`);
        } else {
          this.loginError = true;
        }
      } catch (error) {
        console.error('Login Error:', error);
        this.loginError = true;
      } finally {
        this.isLoggingIn = false;
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap');
* {
  font-family: 'Nunito Sans', sans-serif;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.bg-holder {
  position: absolute;
  width: 100%;
  min-height: 100%;
  top: 0;
  left: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.btn-block {
  width: 100%;
}

h2 {
  font-size: 1.8em;
  color: #333;
}

.form-label {
  font-weight: 500;
}

.alert {
  transition: opacity 0.3s ease-in-out;
}

.alert-danger {
  opacity: 0.9;
}
</style>

