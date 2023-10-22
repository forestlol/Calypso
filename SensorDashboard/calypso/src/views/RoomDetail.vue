<template>
    <div class="container mt-5">
      <h1 class="text-center mb-5">Room {{ roomId }} Sensors Data</h1>
  
      <div class="row gy-4">
        <div class="col-lg-4 col-md-6" v-for="sensor in sensors" :key="sensor.id">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              Sensor {{ sensor.id }}
            </div>
            <div class="card-body">
              <h5 class="card-title">Temperature</h5>
              <p class="card-text">{{ sensor.temp }}°C</p>
              <h5 class="card-title mt-4">People Count</h5>
              <p class="card-text">{{ sensor.count }}</p>
            </div>
          </div>
        </div>
      </div>
  
      <div class="mt-5 text-center">
        <router-link :to="`/building/${buildingId}`" class="btn btn-outline-primary">Back to Floors</router-link>
      </div>
    </div>
</template>
  
  
  
  
<script>
  export default {
    props: {
      roomId: {
        type: String,
        required: true
      },
      buildingId: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        sensors: [
          // Dummy data for multiple sensors in the room
          { id: 1, temp: 22, count: 10 },
          { id: 2, temp: 24, count: 8 },
          { id: 3, temp: 21, count: 5 }
        ]
      };
    }
  };
</script>
  
  