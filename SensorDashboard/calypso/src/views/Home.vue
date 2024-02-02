<template>
  <div class="container mt-5">
    <h1 class="text-center mb-5">Buildings</h1>
    <div class="row gy-4">
      <div class="col-lg-4 col-md-6" v-for="building in buildings" :key="building.building_name">
        <div class="card shadow">
          <div class="card-body">
            <h5 class="card-title">{{ building.building_name }}</h5>
            <div v-if="building.floors && building.floors.length" v-for="floor in building.floors" :key="floor.floor_name">
              <p class="card-text">{{ floor.floor_name }} - Level: {{ floor.floor_level }}</p>
              <p class="card-text">Rooms: {{ floor.rooms.length }}</p>
              <!-- Link to view rooms for the floor -->
              <router-link :to="`/building/${building.building_name}/${floor.floor_name}`" class="btn btn-primary">View Rooms</router-link>
            </div>
            <!-- You could add an else case if there are no floors -->
            <div v-else>No floors available</div>
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
      buildings: [],
      loading: false,
      error: null
    };
  },
  async mounted() {
    await this.fetchBuildings();
  },
  methods: {
    async fetchBuildings() {
      this.loading = true;
      try {
        const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/building');
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const text = await response.text();
        // Sanitize the response text to remove ObjectId references
        const sanitizedText = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
        const data = JSON.parse(sanitizedText);
        this.buildings = data.map(item => ({
          building_name: item.building.building_name,
          floors: item.building.floors.map(floor => ({
            floor_name: floor.floor_name,
            floor_level: floor.floor_level,
            rooms: floor.rooms
          }))
        }));
      } catch (err) {
        console.error(err);
        this.error = 'Failed to load buildings data: ' + err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style>
/* Your existing styles */
</style>
