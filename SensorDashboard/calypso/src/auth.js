// auth.js
export default {
    user: null,
  
    login(username, password) {
      if (username === 'admin' && password === 'password') {
        this.user = { id: 1, username: 'admin', buildingId: 'A' };
        return true;
      }
      return false;
    },
  
    logout() {
      this.user = null;
    },
  
    isLoggedIn() {
      return this.user !== null;
    }
  };
  