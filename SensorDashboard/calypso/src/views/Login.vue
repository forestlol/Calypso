<template>
  <div class="container">
    <div class="card mx-auto login-card">
      <div class="card-body">
        <h2 class="text-center mb-4">Welcome Back!</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input id="username" class="form-control" v-model.trim="username" required />
          </div>
          <div class="mb-4">
            <label for="password" class="form-label">Password</label>
            <input id="password" type="password" class="form-control" v-model.trim="password" required />
          </div>
          <button type="submit" class="btn btn-primary btn-block" :disabled="isLoggingIn" @click="handleLogin">
            <span v-if="isLoggingIn" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isLoggingIn ? 'Logging in...' : 'Login' }}
          </button>
          <div v-if="loginError" class="alert alert-danger mt-3">Invalid login credentials</div>
        </form>
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
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  max-width: 400px;
  width: 100%;
  transition: transform 0.2s ease-in-out;
}

.login-card:hover {
  transform: translateY(-5px);
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

