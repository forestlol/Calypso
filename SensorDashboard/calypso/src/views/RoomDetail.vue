<template>
  <div class="container mt-5">
    <h1 class="text-center mb-5 display-4">Room {{ roomId }} Sensors Data</h1>

    <div class="row gy-4">
      <!-- Display temperature sensors -->
      <div class="col-lg-4 col-md-6" v-for="sensor in temperatureSensors" :key="'temp-' + sensor.id">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-primary text-white text-uppercase">
            Temperature Sensor {{ sensor.id }}
          </div>
          <div class="card-body">
            <h5 class="card-title">Temperature</h5>
            <p class="card-text display-5">{{ sensor.temp }}°C</p>
          </div>
        </div>
      </div>

      <!-- Display people count sensors -->
      <div class="col-lg-4 col-md-6" v-for="sensor in peopleCountSensors" :key="'count-' + sensor.id">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-primary text-white text-uppercase">
            People Counter Sensor {{ sensor.id }}
          </div>
          <div class="card-body">
            <h5 class="card-title">People Count</h5>
            <p class="card-text display-5">{{ sensor.count }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-5 text-center">
      <router-link :to="`/building/${buildingId}`" class="btn btn-primary btn-lg">Back to Floors</router-link>
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
        temperatureSensors: [
          { id: 1, temp: 22 },
          { id: 2, temp: 24 },
          { id: 3, temp: 21 }
        ],
        peopleCountSensors: [
          { id: 1, count: 10 },
          { id: 2, count: 8 },
          { id: 3, count: 5 }
        ]
      };
    }
  };
</script>
  
<style>

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f5f5f5;
}

.card {
    border-radius: 10px;
}

.display-4 {
    font-weight: 600;
}

.btn-primary {
    background-color: #007bff;
    border-color: #007bff;
}

.btn-primary:hover, .btn-primary:focus {
    background-color: #0056b3;
    border-color: #004999;
}

</style>