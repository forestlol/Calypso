<template>
  <div class="container">
    <div v-if="loading">Loading...</div>
    <div v-if="error">Error: {{ error }}</div>
    <div v-if="floorData" class="floor">
      <div class="floor-header">
        <h1>{{ floorData.buildingName }}</h1>
        <h2>{{ floorData.floorName }} - Level: {{ floorData.floorLevel }}</h2>
      </div>
      <div class="rooms-grid">
        <div v-for="room in floorData.rooms" :key="room._id" class="card">
          <div class="card-header">
            <h3>{{ room.room_name }}</h3>
          </div>
          <div class="card-body">
            <div class="sensor-info">
              <i class="fas fa-thermometer-half"></i>
              <p>Average Temperature: {{ getAverage(room.avgTemperature) }}°C</p>
            </div>
            <div class="sensor-info">
              <i class="fas fa-tint"></i>
              <p>Average Humidity: {{ getAverage(room.avgHumidity) }}%</p>
            </div>
            <div class="sensor-info">
              <i class="fas fa-users"></i>
              <p>Last People Count: {{ room.peopleCount }}</p>
            </div>
          </div>
          <div class="card-footer">
            <router-link
              :to="`/building/${encodeURIComponent(floorData.buildingName)}/${encodeURIComponent(floorData.floorName)}/${encodeURIComponent(room.room_name)}`"
              class="btn btn-primary">
              View Room Detail
            </router-link>
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
        else if (item.type === 2) {
          // People count sensor data handling
          const sensorId = item.deviceName;
          const peopleCount = Number(item.data);
          const time = new Date(item.time);
          if (!this.sensorData[sensorId] || new Date(this.sensorData[sensorId].time) < time) {
            this.sensorData[sensorId] = {
              ...this.sensorData[sensorId], // Keep existing sensor data
              peopleCount: peopleCount,
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

        // People count integration
        room.peopleCount = '0'; // Default if no sensor data
        room.sensors.forEach(sensorId => {
          const sensorData = this.sensorData[sensorId];
          if (sensorData && sensorData.peopleCount !== undefined) {
            room.peopleCount = sensorData.peopleCount;
          }
        });
      });
    }
  }
};
</script>

<style>
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  font-family: 'Open Sans', sans-serif;
}

.floor-header {
  text-align: center;
  margin-bottom: 20px;
}

.floor-header h1 {
  color: #0056b3; /* Primary color */
  margin-bottom: 0.5em;
}

.floor-header h2 {
  color: #666;
  font-weight: normal;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden; /* Ensures the border-radius applies to children elements */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: white;
}

.card-header {
  background-color: #0056b3;
  color: white;
  padding: 15px;
  font-size: 1.2em;
}

.card-body {
  padding: 20px;
  text-align: left;
}

.sensor-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.sensor-info i {
  margin-right: 10px;
  color: #0056b3;
}

.card-footer {
  background-color: #f8f8f8;
  padding: 10px;
  text-align: center;
}

.btn-primary {
  background-color: #0056b3;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #004494;
}

@media (max-width: 768px) {
  .rooms-grid {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 0; /* Removes padding for the card on smaller screens */
  }

  .card-header, .card-body, .card-footer {
    padding: 10px;
  }
}
</style>



