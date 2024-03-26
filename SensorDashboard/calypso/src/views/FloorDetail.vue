<template>
  <div class="container">
    <div v-if="loading">Loading...</div>
    <div v-if="error">Error: {{ error }}</div>
    <div v-if="floorData" class="floor">
      <div class="floor-header">
        <h1>{{ floorData.buildingName }}</h1>
        <h2>{{ floorData.floorName }} - Level: {{ floorData.floorLevel }}</h2>
      </div>
      <div class="accordion" id="accordionFloorplan">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
              data-bs-target="#collapseFloorplan" aria-expanded="false" aria-controls="collapseFloorplan">
              Floor Plan for {{ floorData.buildingName }}
            </button>
          </h2>
          <div id="collapseFloorplan" class="accordion-collapse collapse" data-bs-parent="#accordionFloorplan">
            <div class="accordion-body">
              <div class="text-center">
                <h3 style="color: black!important;;">{{ floorData.buildingName }}</h3>
              </div> 
              <!-- generate all sensor icons as a circle and set their position of x and y on the img
              when hover/click on the sensor icon, it shows the data
              icon color depends on sensor status (red green orange))-->
              <img class="img-fluid" src="../assets/Floorplan.jpg">
            </div>
          </div>
        </div>
      </div>
      <br>
      

      <!-- Tabs -->
      <div class="tabs">
        <ul class="nav nav-tabs" role="tablist">
          <li class="nav-item">
            <button class="nav-link active" id="all-sensors-tab" data-bs-toggle="tab"
              data-bs-target="#all-sensors-tab-pane" type="button" role="tab" aria-controls="all-sensors-tab-pane"
              aria-selected="true">Sensors</button>
          </li>
        </ul>
      </div>
      <!-- Tab content -->
      <div class="tab-content" id="floor-tab-content">
        <div class="tab-pane show active" id="all-sensors-tab-pane" role="tabpanel" aria-labelledby="all-sensors-tab"
          tabindex="0">
          <br>
          <!--Sensors for All Rooms-->
          <div class="rooms-grid">
            <div v-for="room in floorData.rooms" :key="room._id" class="card">
              <div class="card-header">
                <h3 class="room-card-header">{{ room.room_name }}</h3>
              </div>
              <div class="card-body">
                <div class="sensor-info">
                  <i class="fas fa-thermometer-half"></i>
                  <p>Temperature: {{ getAverage(room.latestTemperature) }}°C</p>
                </div>
                <div class="sensor-info">
                  <i class="fas fa-tint"></i>
                  <p>Humidity: {{ getAverage(room.latestHumidity) }}%</p>
                </div>
                <div class="sensor-info">
                  <i class="fas fa-users"></i>
                  <p>Last People Count: {{ room.latestPeopleCount }}</p>
                </div>
              </div>
              <div class="card-footer">
                <router-link
                  :to="{ path: `/building/${encodeURIComponent(floorData.buildingName)}/${encodeURIComponent(floorData.floorName)}/${encodeURIComponent(room.room_name)}`, query: { tab: 'sensors' } }"
                  class="btn btn-primary">
                  View Room Details
                </router-link>
              </div>
            </div>
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
      query: null,
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

    this.fetchFloorData().then(() => {
      this.fetchSensorData().then(() => {
        this.integrateSensorData();
        setTimeout(() => {
          this.equalizeCardHeaderHeights();
        }, 0);
      });
    });
  },
  methods: {
    equalizeCardHeaderHeights() {
      this.$nextTick(() => {
        const cardHeaders = document.querySelectorAll('.card-header');
        let maxHeight = 0;
        // Reset any previously set heights
        cardHeaders.forEach(el => {
          el.style.height = null;
        });
        // Find the max height
        cardHeaders.forEach(el => {
          maxHeight = Math.max(maxHeight, el.clientHeight);
        });
        // Apply the max height to all card headers
        cardHeaders.forEach(el => {
          el.style.height = `${maxHeight}px`;
        });
      });
    },
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
      try {
        const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/latest/readings');
        if (!response.ok) throw new Error('Network response was not ok.');

        let text = await response.text();

        // Replace ObjectId and ISODate formats with valid JSON
        text = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
        text = text.replace(/ISODate\("([^"]+)"\)/g, '"$1"');

        const readings = JSON.parse(text);

        readings.forEach(item => {
          if (item.type === 1) {
            const sensorId = item.deviceName;
            const [temperature, humidity] = item.data.split(',').map(Number);
            const time = new Date(item.time);
            if (!this.sensorData[sensorId] || new Date(this.sensorData[sensorId].time) < time) {
              this.sensorData[sensorId] = {
                temperature: temperature,
                humidity: humidity,
                time: time.toISOString(),
                type: item.type
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
                time: time.toISOString(),
                type: item.type
              };
            }
          }
        });
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    },
    integrateSensorData() {
      if (!this.floorData) {
        console.error('No floor data to integrate sensor data with.');
        return;
      }
      this.floorData.rooms.forEach(room => {
        // Initialize variables to track the most recent readings
        let latestTemperatureReading = null;
        let latestHumidityReading = null;
        let latestPeopleCount = null;

        room.sensors.forEach(sensorId => {
          const sensorData = this.sensorData[sensorId];
          if (sensorData) {
            // Update the latest temperature reading if this one is more recent
            switch (sensorData.type) {
              case 1:
                if (!latestTemperatureReading || new Date(latestTemperatureReading.time) < new Date(sensorData.time)) {
                  latestTemperatureReading = sensorData;
                }

                // Update the latest humidity reading if this one is more recent
                if (!latestHumidityReading || new Date(latestHumidityReading.time) < new Date(sensorData.time)) {
                  latestHumidityReading = sensorData;
                }
                break;
              case 2:
                // Update the latest people count if this one is more recent
                if (!latestPeopleCount || new Date(latestPeopleCount.time) < new Date(sensorData.time)) {
                  latestPeopleCount = sensorData;
                }
                break;
            }
          }
        });

        // Set the room's sensor data to the latest readings or a default value
        room.latestTemperature = latestTemperatureReading ? latestTemperatureReading.temperature.toFixed(2) : 'N/A';
        room.latestHumidity = latestHumidityReading ? latestHumidityReading.humidity.toFixed(2) : 'N/A';
        room.latestPeopleCount = latestPeopleCount ? latestPeopleCount.peopleCount.toString() : 'N/A';
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
  color: #0056b3;
  /* Primary color */
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

.rooms-grid-cctv {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top:20px
}

.card {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  /* Ensures the border-radius applies to children elements */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: white;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0056b3;
  color: white;
  padding: 15px;
  font-size: 1.2em;
  min-height: 60px;
  /* set a minimum height */
  /* Remove a fixed height if it's set */
}


.room-card-header {
  color: #eeebeb !important;
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

.nav-link {
  color: rgb(150, 150, 150) !important;
}

.nav-link:focus,
.nav-link:hover {
  color: #000000 !important;
  /*changes the color of the text when hovered */
}

@media (max-width: 768px) {
  .rooms-grid {
    grid-template-columns: 1fr;
  }
  
  .rooms-grid-cctv {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 0;
    /* Removes padding for the card on smaller screens */
  }

  .card-header,
  .card-body,
  .card-footer {
    padding: 10px;
  }
}
</style>



