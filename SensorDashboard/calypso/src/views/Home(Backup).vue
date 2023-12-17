<template>
  <div class="container mt-5">
    <h1 class="text-center mb-5">User's Buildings</h1>
    <div class="row gy-4">
      <div class="col-lg-4 col-md-6" v-for="building in userBuildings" :key="building.id">
        <div class="card shadow">
          <div class="card-body">
            <h5 class="card-title">{{ building.name }}</h5>
            <p class="card-text">Description: {{ building.description }}</p>
            <router-link :to="`/building/${building.id}`" class="btn btn-primary">View Floors</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


  
<script>
import auth from '@/auth.js';

export default {
  data() {
  return {
    buildings: [
      { id: 'A', name: 'Building A', description: 'North Wing' },
      { id: 'B', name: 'Building B', description: 'South Wing' },
      { id: 'C', name: 'Building C', description: 'East Wing' },
      { id: 'D', name: 'Building D', description: 'West Wing' },
      { id: 'E', name: 'Building E', description: 'Central Hub' },
      { id: 'F', name: 'Building F', description: 'Research and Development' },
      { id: 'G', name: 'Building G', description: 'Human Resources' },
      { id: 'H', name: 'Building H', description: 'Engineering' },
      { id: 'I', name: 'Building I', description: 'Customer Support' },
      { id: 'J', name: 'Building J', description: 'Product Management' },
      { id: 'K', name: 'Building K', description: 'Finance and Administration' },
      { id: 'L', name: 'Building L', description: 'Sales and Marketing' },
      { id: 'M', name: 'Building M', description: 'Training Center' },
      { id: 'N', name: 'Building N', description: 'Cafeteria' },
      { id: 'O', name: 'Building O', description: 'Gymnasium' },
      { id: 'P', name: 'Building P', description: 'Auditorium' },
      { id: 'Q', name: 'Building Q', description: 'Library' },
      { id: 'R', name: 'Building R', description: 'Outdoor Recreation' },
      { id: 'S', name: 'Building S', description: 'Conference Rooms' },
      { id: 'T', name: 'Building T', description: 'Executive Suites' }
      ]
    };
  },
  computed: {
    userBuildings() {
      const buildingsForUser = this.buildings.filter(b => auth.getBuildingIds().includes(b.id));
      return buildingsForUser;
    }
  }
};
</script>


  