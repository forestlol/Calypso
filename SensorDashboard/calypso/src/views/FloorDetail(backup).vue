<template>
  <div class="container mt-5">
    <h1 class="text-center mb-5">Floors in {{ buildingName }}</h1>

    <div v-if="floors.length > 0">
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
    </div>
    <div v-else>
      <p class="text-center">No floors available for this building.</p>
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
      buildingFloors: {
        'A': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Floor 3' }],
        'B': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Floor 3' }, { id: 4, name: 'Floor 4' }],
        'C': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Floor 3' }, { id: 4, name: 'Floor 4' }, { id: 5, name: 'Floor 5' }],
        'D': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Ground Floor' }],
        'E': [{ id: 1, name: 'Ground Floor' }, { id: 2, name: 'Basement 1' }, { id: 3, name: 'Basement 2' }],
        'F': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }],
        'G': [{ id: 1, name: 'Ground Floor' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Floor 3' }],
        'H': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Floor 3' }, { id: 4, name: 'Attic' }],
        'I': [{ id: 1, name: 'Ground Floor' }, { id: 2, name: 'Basement 1' }],
        'J': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }],
        'K': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Floor 3' }],
        'L': [{ id: 1, name: 'Ground Floor' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Roof' }],
        'M': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }],
        'N': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Floor 3' }],
        'O': [{ id: 1, name: 'Ground Floor' }],
        'P': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Floor 3' }],
        'Q': [{ id: 1, name: 'Ground Floor' }, { id: 2, name: 'Basement 1' }, { id: 3, name: 'Basement 2' }],
        'R': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }],
        'S': [{ id: 1, name: 'Ground Floor' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Floor 3' }],
        'T': [{ id: 1, name: 'Floor 1' }, { id: 2, name: 'Floor 2' }, { id: 3, name: 'Floor 3' }, { id: 4, name: 'Floor 4' }, { id: 5, name: 'Penthouse' }],
        // Add more buildings and floors as required
      },
      buildingName: '',
      floors: []
    };
  },
  created() {
    this.floors = this.buildingFloors[this.buildingId] || [];
    this.buildingName = `Building ${this.buildingId}`;
  }
};
</script>

