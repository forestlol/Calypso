<template>
  <div class="container">
    <div v-if="loading">Loading...</div>
    <div v-if="error">
      <p>Error: {{ error }}</p>
    </div>
    <h1 class="text-center mb-4">{{ roomName }}</h1>
    <!-- Check if sensor data is available -->
    <div v-if="sensors.length > 0" class="room-sensors">
      <!-- <h1 class="text-center mb-4">{{ roomName }}</h1> -->
      <!-- Tabs -->
      <div class="tabs">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <button class="nav-link active" id="sensors-tab" data-bs-toggle="tab" data-bs-target="#sensors-tab-pane"
              type="button" role="tab" aria-controls="sensors-tab-pane" aria-selected="true">Sensors</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="cctv-tab" data-bs-toggle="tab" data-bs-target="#cctv-tab-pane" type="button"
              role="tab" aria-controls="cctv-tab-pane" aria-selected="false">CCTV</button>
          </li>
        </ul>
      </div>
      <!-- Tab content -->
      <div class="tab-content" id="room-tab-content">
        <div class="tab-pane show active" id="sensors-tab-pane" role="tabpanel" aria-labelledby="sensors-tab"
          tabindex="0">
          <br>
          <!-- Display temperature and humidity sensors -->
          <div class="row">
            <div class="col-md-6 mb-3" v-for="sensor in sensors" :key="sensor.id">
              <div class="card h-100">
                <div class="card-header">
                  Sensor ID: {{ sensor.id }}
                </div>
                <div class="card-body">
                  <p v-if="sensor.type == 0" class="card-text">
                    Activated: {{ sensor.activated ? 'Yes' : 'No' }}
                  </p>
                  <template v-if="sensor.type == 1">
                    <p class="card-text">Temperature: {{ sensor.temp }}°C</p>
                    <p class="card-text">Humidity: {{ sensor.humidity }}%</p>
                  </template>
                  <p v-if="sensor.type == 2" class="card-text">
                    People Count: {{ sensor.peopleCount }}
                  </p>
                </div>
                <router-link :to="`/sensor/${sensor.id}`" class="btn btn-primary">View Sensor Detail</router-link>
              </div>
            </div>
          </div>
          <div class="text-center mt-4">
            <router-link :to="`/building/`" class="btn btn-primary">Back to Building</router-link>
            
            <router-link :to="{ path: `/building/${buildingName}/${floorName}`, query: { tab: 'allsensors' } }" class="btn btn-secondary">Back to Floor</router-link>
          </div>
        </div>
        <!-- Display CCTV -->
        <div class="tab-pane" id="cctv-tab-pane" role="tabpanel" aria-labelledby="cctv-tab" tabindex="0">
          <br>
          <!--http://(IP address):(Camera port number)-->
          <!--Sample Video-->
          <div class="row gx-5">
            <div class="col-12">
              <div>
                <iframe width="100%" height="370" src="https://www.youtube.com/embed/K4TOrB7at0Y?si=dp1Ha6nVGWtAhnMz"
                  title="YouTube video player" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen></iframe>
              </div>
            </div>
          </div>
          <!--CCTV Controls-->
          Camera Controls
          <div class="row text-center">
            <div class="col">
              <button id="volume-button" type="button" class="btn " @click="volumeToggle"><img id="volume-button-image"
                  class="button-image" src="../assets/volumeon.png"><br>Sound</button>
            </div>
            <div class="col">
              <button id="mic-button" type="button" class="btn" @click="micToggle"><img id="mic-button-image"
                  class="button-image" src="../assets/micon.png"><br>Mic</button>
            </div>
            <div class="col">
              <button id="screenshot-button" type="button" class="btn" @click="screenshot"><img
                  id="screenshot-button-image" class="button-image" src="../assets/capture.png"><br>Screenshot</button>
            </div>
          </div>
          <div class="text-center mt-4">
            <router-link :to="`/building/`" class="btn btn-primary">Back to Building</router-link>
            
            <router-link :to="{ path: `/building/${buildingName}/${floorName}`, query: { tab: 'allcctv' } }" class="btn btn-secondary">Back to All CCTV</router-link>
          </div>


        </div>
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
      query: null, // Extracted from URL
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
      this.$nextTick(() => {
        this.activateTabBasedOnQueryParam();
      });
    } catch (err) {
      console.error(err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },
  methods: {
    parseUrlParams() {
      const path = this.$route.path;
      const segments = path.split('/').filter(Boolean);
      this.buildingName = decodeURIComponent(segments[1]);
      this.floorName = decodeURIComponent(segments[2]);
      this.roomName = decodeURIComponent(segments[3]);
      this.query = this.$route.query.tab;
    },
    activateTabBasedOnQueryParam() {
      if (!this.query != null){
        this.resetTabs();
        if (this.query === 'sensors') {
          this.activateTab('sensors');
        } else if (this.query === 'cctv') {
          this.activateTab('cctv');
        }
      }
      
    },
    resetTabs() {
      const sensorsTab = document.getElementById('sensors-tab');
      const cctvTab = document.getElementById('cctv-tab');
      const sensorsTabPane = document.getElementById('sensors-tab-pane');
      const cctvTabPane = document.getElementById('cctv-tab-pane');

      sensorsTab.classList.remove('active');
      cctvTab.classList.remove('active');
      sensorsTabPane.classList.remove('show', 'active');
      cctvTabPane.classList.remove('show', 'active');
    },
    activateTab(tabName) {
      const tab = document.getElementById(`${tabName}-tab`);
      const tabPane = document.getElementById(`${tabName}-tab-pane`);

      if (tab && tabPane) {
        tab.classList.add('active');
        tabPane.classList.add('show', 'active');
      }
    },
    async fetchRoomSensors() {
      try {
        let response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/building');
        if (!response.ok) throw new Error('Failed to fetch buildings');
        let text = await response.text();
        text = this.sanitizeResponse(text);
        let buildingsData = JSON.parse(text);
        let building = buildingsData.find(b => b.building.building_name === this.buildingName).building;
        let floor = building.floors.find(f => f.floor_name === this.floorName);
        let room = floor.rooms.find(r => r.room_name === this.roomName);
        this.sensors = room.sensors.map(id => ({
          id: id,
          type: -1,
          temp: 'N/A',
          humidity: 'N/A',
          activated: 'No',
          peopleCount: 'N/A',
          lastReadingDate: null,
        }));

        response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/backup');
        if (!response.ok) throw new Error('Failed to fetch sensor data');
        let allSensorData = await response.json();

        allSensorData.forEach(sensor => {
          const sensorIndex = this.sensors.findIndex(s => s.id === sensor.deviceName);
          if (sensorIndex !== -1) {
            this.sensors[sensorIndex].type = sensor.type;
            this.processSensorData(sensor, sensorIndex);
          }
        });
      } catch (err) {
        console.error(err);
        this.error = err.message;
      }
    },
    processSensorData(sensor, sensorIndex) {
      switch (sensor.type) {
        case 0:
          this.sensors[sensorIndex].activated = sensor.data == '0' ? 'Yes' : 'No';
          break;
        case 1:
          const [temperature, humidity] = sensor.data.split(',').map(Number);
          this.sensors[sensorIndex].temp = temperature.toFixed(2);
          this.sensors[sensorIndex].humidity = humidity.toFixed(2);
          break;
        case 2:
          this.sensors[sensorIndex].peopleCount = Number(sensor.data);
          break;
      }
    },
    sanitizeResponse(responseText) {
      return responseText.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
    },
    volumeToggle() {
      var image = document.getElementById('volume-button-image');
      image.src = image.src.includes("/volumeon.png") ? "/src/assets/volumeoff.png" : "/src/assets/volumeon.png";
    },
    micToggle() {
      var image = document.getElementById('mic-button-image');
      image.src = image.src.includes("/micon.png") ? "/src/assets/micoff.png" : "/src/assets/micon.png";
    },
    screenshot() {
      // Functionality to be implemented
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

.button-image {
  width: 20px;
  height: 20px;
}
</style>