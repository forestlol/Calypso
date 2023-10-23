<template>
  <div class="container mt-5">
    <h1 class="text-center mb-5">Floors in {{ buildingName }}</h1>

    <div class="row gy-4">
      <div class="col-lg-4 col-md-6" v-for="floor in floors" :key="floor.id">
        <div class="card shadow">
          <div class="card-body">
            <h5 class="card-title">{{ floor.name }}</h5>
            <router-link :to="`/building/${buildingId}/floor/${floor.id}`" class="btn btn-primary">View Rooms</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation to go back to the buildings page -->
    <div class="mt-5 text-center">
      <router-link to="/building" class="btn btn-outline-primary">Back to Buildings</router-link>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      buildingId: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        buildingName: 'Building A', // This could be fetched based on buildingId
        floors: [
          { id: 1, name: 'Floor 1' },
          { id: 2, name: 'Floor 2' },
          // Add more floors as required
        ]
      };
    }
  };
</script>
