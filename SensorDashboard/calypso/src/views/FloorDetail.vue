<template>
  <div class="container">
    <div v-if="loading">Loading...</div>
    <div v-if="error">Error: {{ error }}</div>
    <div v-if="floorData" class="floor">
      <h1>{{ floorData.buildingName }}</h1>
      <h2>{{ floorData.floorName }} - Level: {{ floorData.floorLevel }}</h2>
      <div class="rooms-grid">
        <div v-for="room in floorData.rooms" :key="room._id" class="card">
          <h3>{{ room.room_name }}</h3>
          <p>Average Temperature: {{ getAverage(room.avgTemperature) }}°C</p>
          <p>Average Humidity: {{ getAverage(room.avgHumidity) }}%</p>
          <router-link
            :to="`/building/${encodeURIComponent(floorData.buildingName)}/${encodeURIComponent(floorData.floorName)}/${encodeURIComponent(room.room_name)}`"
            class="btn btn-primary">
            View Room Detail
          </router-link>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      floorData: null,
      sensorData: {},
      loading: false,
      error: null
    };
  },
  async mounted() {
    this.loading = true;
    try {
      await this.fetchFloorData();
      if (this.floorData) {
        await this.fetchSensorData();
        if (Object.keys(this.sensorData).length > 0) {
          this.integrateSensorData();
        }
      }
    } catch (err) {
      console.error(err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },
  methods: {
    getAverage(value) {
      return typeof value === 'number' ? value.toFixed(2) : value;
    },
    async fetchFloorData() {
      const buildingName = this.$route.params.buildingId;
      const floorName = decodeURIComponent(this.$route.params.floorName);
      try {
        const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/building');
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const text = await response.text();
        const sanitizedText = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
        const buildings = JSON.parse(sanitizedText);
        const building = buildings.find(b => b.building.building_name === buildingName);
        if (!building) {
          throw new Error(`Building "${buildingName}" not found`);
        }
        const floor = building.building.floors.find(f => f.floor_name === floorName);
        if (!floor) {
          throw new Error(`Floor "${floorName}" not found`);
        }
        this.floorData = {
          buildingName: building.building.building_name,
          floorName: floor.floor_name,
          floorLevel: floor.floor_level,
          rooms: floor.rooms
        };
      } catch (err) {
        console.error(err);
        this.error = 'Failed to load floor data: ' + err.message;
      }
    },
    async fetchSensorData() {
      const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/backup');
      if (!response.ok) throw new Error('Network response was not ok.');
      const rawData = await response.json();
      rawData.forEach(item => {
        if (item.type === 1) {
          const sensorId = item.deviceName;
          const [temperature, humidity] = item.data.split(',').map(Number);
          const time = new Date(item.time);
          if (!this.sensorData[sensorId] || new Date(this.sensorData[sensorId].time) < time) {
            this.sensorData[sensorId] = {
              temperature: temperature,
              humidity: humidity,
              time: time.toISOString()
            };
          }
        }
      });
    },
    integrateSensorData() {
      if (!this.floorData) {
        console.error('No floor data to integrate sensor data with.');
        return;
      }

      // Integrate sensor data with floor data
      this.floorData.rooms.forEach(room => {
        let totalTemperature = 0;
        let totalHumidity = 0;
        let sensorCount = room.sensors.length;  // Total number of sensors including those without data

        room.sensors.forEach(sensorId => {
          const sensorData = this.sensorData[sensorId];
          if (sensorData) {
            totalTemperature += sensorData.temperature ?? 0;  // Use 0 if temperature is not available
            totalHumidity += sensorData.humidity ?? 0;  // Use 0 if humidity is not available
          }
        });

        // Calculate average; divide by the total number of sensors to account for those without readings
        room.avgTemperature = (totalTemperature / sensorCount).toFixed(2);
        room.avgHumidity = (totalHumidity / sensorCount).toFixed(2);

        // If there were no sensors with data, set average to 'N/A'
        room.avgTemperature = sensorCount > 0 ? room.avgTemperature : 'N/A';
        room.avgHumidity = sensorCount > 0 ? room.avgHumidity : 'N/A';
      });
    }
  }
};
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.buildings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.floor {
  background-color: #f8f8f8;
  padding: 16px;
  border-radius: 8px;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
}
</style>
