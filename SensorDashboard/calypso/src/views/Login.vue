<template>

  <div class="row vh-100 g-0">
    <!-- Left Side -->
    <div class="col-lg-6 position-relative d-none d-lg-block">
      <div class="bg-holder" style="background-image: url(src/assets/loginPage.PNG);">
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

          <!-- Social Login -->
          <button class="btn btn-lg btn-outline-secondary btn-outline-custom w-100 mb-3">
            <i class='bx bxl-google text-danger me-1 fs-6'></i> Login with Google
          </button>

          <button class="btn btn-lg btn-outline-secondary btn-outline-custom  w-100 mb-3">
            <i class='bx bxl-facebook text-primary me-1 fs-6'></i>Login with Facebook
          </button>

          <!-- Divider -->
          <div class="position-relative">
            <hr class="text-secondary divider">
            <div class="divider-content-center">Or</div>
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
          <div class="input-group mb-3 d-flex justify-content-between">
            <div class="form-check">
              <input type="checkbox" class="form-check-input" id="formCheck">
              <label for="formCheck" class="form-check-label text-secondary"><small>Remember Me</small></label>
            </div>
            <div>
              <small><a href="#">Forget Password?</a></small>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block mb-3" :disabled="isLoggingIn" @click="handleLogin">
            <span v-if="isLoggingIn" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isLoggingIn ? 'Logging in...' : 'Login' }}
          </button>
          <div v-if="loginError" class="alert alert-danger mt-3">Invalid login credentials</div>
        </form>

        <div class="text-center">
          <small>Don't have an account?</small> <a href="#" class="fw-bold">Sign Up</a>
        </div>
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
      loginError: false
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
@import 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
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

.btn {
  font-size: 0.8rem;
  font-weight: 700;
}

.btn i {
  vertical-align: text-top;
}

.btn-outline-custom {
  color: #31374a;
  border-color: #ddd;
}

.btn-outline-custom:hover {
  color: #31374a;
  border-color: #eee;
  background-color: #eee;
}

.divider-content-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: #fff;
  font-size: 0.8rem;
  font-weight: 500;
  color: #999;
}

.divider {
  margin: 2rem 0;
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

