import { ref } from 'vue';

const user = ref(null);

export default {
  login(username, password) {
    if (username === 'admin' && password === 'password') {
      const buildingIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
      
      // Shuffling the array and picking the first 5 building IDs
      const userBuildingIds = buildingIds.sort(() => 0.5 - Math.random()).slice(0, 5);
      
      user.value = { id: 1, username: 'admin', buildingIds: userBuildingIds };
      return true;
    }
    return false;
  },

  logout() {
    user.value = null;
  },

  isLoggedIn() {
    if(user.value === null)
      return false;
    return true;
  },

  getUser() {
    return user.value;
  },

  getBuildingIds(){
    return user.value.buildingIds;
  }
};
