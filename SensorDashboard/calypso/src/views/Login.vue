<template>
    <div class="container mt-5">
      <div class="card w-50 mx-auto">
        <div class="card-body">
          <h4 class="text-center mb-4">Login</h4>
          <input class="form-control mb-2" v-model="username" placeholder="Username" />
          <input class="form-control mb-2" type="password" v-model="password" placeholder="Password" />
          <button class="btn btn-primary btn-block" @click="handleLogin">Login</button>
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
        password: ''
      };
    },
    methods: {
      handleLogin() {
        if (auth.login(this.username, this.password)) {
          this.$router.push(`/building`);
        } else {
          alert('Invalid login credentials');
        }
      }
    }
  };
  </script>
  