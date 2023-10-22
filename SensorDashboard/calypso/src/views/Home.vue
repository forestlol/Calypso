<template>
    <div class="container mt-5">
      <h1 class="text-center mb-5">Buildings</h1>
  
      <div class="row gy-4">
        <div class="col-lg-4 col-md-6" v-for="building in buildings" :key="building.id">
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
  export default {
    data() {
      return {
        buildings: [
          { id: 1, name: 'Building A', description: 'North Wing' },
          { id: 2, name: 'Building B', description: 'South Wing' },
          // Add more buildings as required
        ]
      };
    }
  };
</script>
  