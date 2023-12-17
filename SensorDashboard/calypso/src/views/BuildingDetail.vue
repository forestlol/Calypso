<template>
  <div>
    <h2>Buildings</h2>
    <ul class="list-group">
      <li v-for="building in buildingsList" :key="building.id" class="list-group-item">
        <router-link :to="{ name: 'FloorDetail', params: { buildingId: building.id } }">
          {{ building.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>
  
<script>
import store from '../router/store.js';

export default {
  computed: {
    buildingsList() {
      return store.state.buildings;
    }
  }
};
</script>
