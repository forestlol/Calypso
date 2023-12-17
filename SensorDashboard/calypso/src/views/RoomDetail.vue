<template>
  <div class="container">
    <div v-if="loading">Loading...</div>
    <div v-if="error">
      <p>Error: {{ error }}</p>
    </div>

    <!-- Check if sensor data is available -->
    <div v-if="sensors.length > 0" class="room-sensors">
      <h1 class="text-center mb-4">{{ roomName }}</h1>

      <!-- Display temperature and humidity sensors -->
      <div class="row">
        <div class="col-md-6 mb-3" v-for="sensor in sensors" :key="sensor.id">
          <div class="card h-100">
            <div class="card-header">
              Sensor ID: {{ sensor.id }}
            </div>
            <div class="card-body">
              <p class="card-text">Temperature: {{ sensor.temp }}°C</p>
              <p class="card-text">Humidity: {{ sensor.humidity }}%</p>
            </div>
            <router-link :to="`/sensor/${sensor.id}`" class="btn btn-primary">View Sensor Detail</router-link>
          </div>
        </div>
      </div>

      <div class="text-center mt-4">
        <router-link :to="`/building/`" class="btn btn-primary">Back to Building</router-link>
        <router-link :to="`/building/${buildingName}/${floorName}`" class="btn btn-secondary">Back to Floor</router-link>
      </div>
    </div>

    <!-- If no sensor data is available -->
    <div v-else class="alert alert-warning" role="alert">
      No sensor data available for this room.
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roomName: null, // Extracted from URL
      buildingName: null, // Extracted from URL
      floorName: null, // Extracted from URL
      sensors: [], // Sensors data for the room
      loading: false,
      error: null,
    };
  },
  async mounted() {
    this.loading = true;
    try {
      this.parseUrlParams();
      await this.fetchRoomSensors();
    } catch (err) {
      console.error(err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },
  methods: {
    sanitizeResponse(responseText) {
      // This will replace all occurrences of ObjectId("...") with the string inside the quotes
      return responseText.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
    },
    parseUrlParams() {
      const path = this.$route.path;
      const segments = path.split('/').filter(Boolean); // ['building', 'ITE CCK', 'Build Environment Hub', 'Smart Facilities Management Lab']
      this.buildingName = decodeURIComponent(segments[1]);
      this.floorName = decodeURIComponent(segments[2]);
      this.roomName = decodeURIComponent(segments[3]);
    },
    async fetchRoomSensors() {
      try {
        // Fetch building data and handle response
        let response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/building');
        if (!response.ok) throw new Error('Failed to fetch buildings');

        let text = await response.text();
        text = this.sanitizeResponse(text);
        let buildingsData = JSON.parse(text);

        // Find the specific building, floor, and room
        let building = buildingsData.find(b => b.building.building_name === this.buildingName).building;
        let floor = building.floors.find(f => f.floor_name === this.floorName);
        let room = floor.rooms.find(r => r.room_name === this.roomName);

        // Initialize all sensors with "N/A" data
        this.sensors = room.sensors.map(id => ({
          id: id,
          temp: 'N/A',
          humidity: 'N/A'
        }));

        // Fetch sensor data
        response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/backup');
        if (!response.ok) throw new Error('Failed to fetch sensor data');
        let allSensorData = await response.json();

        // Map the latest sensor data to the initialized sensors
        allSensorData.forEach(sensor => {
          if (sensor.type === 1 && room.sensors.includes(sensor.deviceName)) {
            const sensorIndex = this.sensors.findIndex(s => s.id === sensor.deviceName);
            if (sensorIndex !== -1) {
              const [temperature, humidity] = sensor.data.split(',').map(Number);
              this.sensors[sensorIndex].temp = temperature.toFixed(2);
              this.sensors[sensorIndex].humidity = humidity.toFixed(2);
            }
          }
        });
      } catch (err) {
        console.error(err);
        this.error = err.message;
      }
    },
  },
};
</script>


<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.room-sensors {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover,
.btn-primary:focus {
  background-color: #0056b3;
  border-color: #004999;
}

.btn-secondary {
  margin-left: 10px;
}
</style>