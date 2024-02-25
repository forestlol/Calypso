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
          <li class="nav-item">
            <button class="nav-link" id="floor-plan-tab" data-bs-toggle="tab" data-bs-target="#floor-plan-tab-pane" type="button"
              role="tab" aria-controls="floor-plan-tab-pane" aria-selected="false">Sensor Location</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="items-tab" data-bs-toggle="tab" data-bs-target="#items-tab-pane" type="button"
              role="tab" aria-controls="items-tab-pane" aria-selected="false">Items</button>
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

            <!-- Consumption Charts Section -->
            <div class="row mt-4">
              <div class="col-12 col-md-6">
                <h2 class="text-center">Water Consumption Data</h2>
                <div class="chart-container">
                  <canvas id="waterConsumptionChart"></canvas>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <h2 class="text-center">Electrical Consumption Data</h2>
                <div class="chart-container">
                  <canvas id="electricalConsumptionChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="text-center mt-4">
            <router-link :to="`/building/`" class="btn btn-primary">Back to Building</router-link>

            <router-link :to="{ path: `/building/${buildingName}/${floorName}`, query: { tab: 'allsensors' } }"
              class="btn btn-secondary">Back to Floor</router-link>
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

            <router-link :to="{ path: `/building/${buildingName}/${floorName}`, query: { tab: 'allcctv' } }"
              class="btn btn-secondary">Back to All CCTV</router-link>
          </div>


        </div>
        <!-- Display Floor Plan -->
        <div class="tab-pane" id="floor-plan-tab-pane" role="tabpanel" aria-labelledby="floor-plan-tab" tabindex="0">
          <br>
          <div class="row gx-5">
            <div class="floor-plan-image col-12" id="sensors-drag">
              <p>Click on the sensors to go to sensor details page</p>
              <div><img :src="imagePath" id="roomImg" class="img-fluid mx-auto d-block" alt="Room Image"></div>
              <!-- <div class="draggable"><img src="">ppl</div>
              <div class="draggable"><img src="">temp&hmd</div>
              <div class="draggable"><img src="">sensor 3</div> -->
              
              <div v-for="sensor in this.sensors"
                   :key="sensor.id"
                   :id="`icon_${sensor.id}`"
                   class="draggable">
                    <router-link :to="`/sensor/${sensor.id}`">
                      <img v-if="sensor.type === 2" class="img-fluid" src="/src/assets/people-count.png">
                      <img v-else-if="sensor.type === 1" class="img-fluid" src="/src/assets/temperature.png">                      
                      <img v-else class="img-fluid" src="/src/assets/sensor.png">
                    </router-link>
                    <span :id="`description_${sensor.id}`" class="sensor_description">ID:{{ sensor.id }}</span>

              </div>
              
            </div>

          </div>
          
          
          <div class="text-center mt-4">
            <router-link :to="`/building/`" class="btn btn-primary">Back to Building</router-link>

            <router-link :to="{ path: `/building/${buildingName}/${floorName}` }"
              class="btn btn-secondary">Back to Floor</router-link>
          </div>


        </div>
        <div class="tab-pane" id="items-tab-pane" role="tabpanel" aria-labelledby="items-tab"
          tabindex="0">
          BMS data 
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
import { Chart, registerables } from 'chart.js';
import interact from 'interactjs';
Chart.register(...registerables);

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
      waterConsumptionData: [], // Placeholder for water consumption data
      electricalConsumptionData: [], // Placeholder for electrical consumption data,
      overlay: [],
      imagePath: `../assets/Floorplan.jpg`,
      position: [],
    };
  },
  async mounted() {
    this.parseUrlParams();
    this.fetchRoomSensors().then(() => {
      this.$nextTick(() => {
        this.activateTabBasedOnQueryParam();
        this.initWaterConsumptionChart();
        this.initElectricalConsumptionChart();
        this.initDraggable();
      });
      this.setRoomImg();
    }).catch((err) => {
      console.error(err);
      this.error = err.message;
    });
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
      if (!this.query != null) {
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
        // Fetching building data
        let response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/building');
        if (!response.ok) throw new Error('Failed to fetch buildings');
        let text = this.sanitizeResponse(await response.text());
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
          //position: { x: 0, y: 0 }
        }));

        // Fetching sensor data
        response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/latest/readings');
        if (!response.ok) throw new Error('Failed to fetch sensor data');
        text = this.sanitizeResponse(await response.text());
        let allSensorData = JSON.parse(text);

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

    sanitizeResponse(text) {
      // Replace ObjectId and ISODate formats with valid JSON
      return text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"')
                .replace(/ISODate\("([^"]+)"\)/g, '"$1"');
    },
    processSensorData(sensor, sensorIndex) {
      switch (sensor.type) {
        case 0:
          this.sensors[sensorIndex].activated = sensor.data == '0' ? 'Yes' : 'No';
          break;
        case 1:
          // eslint-disable-next-line no-case-declarations
          const [temperature, humidity] = sensor.data.split(',').map(Number);
          this.sensors[sensorIndex].temp = temperature.toFixed(2);
          this.sensors[sensorIndex].humidity = humidity.toFixed(2);
          break;
        case 2:
          this.sensors[sensorIndex].peopleCount = Number(sensor.data);
          break;
      }
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
    generateLast24HoursLabels() {
      const labels = [];
      const currentHour = new Date().getHours(); // Get the current hour

      for (let i = 0; i < 24; i++) {
        labels.push(`${(currentHour - i + 24) % 24}:00`); // Format hours in 24-hour format
      }

      return labels.reverse(); // Reverse to get the labels in chronological order
    },
    WaterConsumptionData() {
      // Static fake data for 24 hours
      return [
        20, 18, 17, 16, 15, 14, 13, 12, 20, 25, 30, 35,
        40, 38, 37, 36, 34, 32, 30, 28, 26, 24, 22, 21
      ];
    },
    ElectricalConsumptionData() {
      // Static fake data for 24 hours
      return [
        40, 38, 37, 36, 34, 32, 30, 28, 26, 24, 22, 21,
        20, 18, 17, 16, 15, 14, 13, 12, 20, 25, 30, 35
      ];
    },
    initWaterConsumptionChart() {
      const ctxWater = document.getElementById('waterConsumptionChart').getContext('2d');
      new Chart(ctxWater, {
        type: 'line',
        data: {
          labels: this.generateLast24HoursLabels(),
          datasets: [{
            label: 'Water Consumption (Liters)',
            data: this.WaterConsumptionData(), // Use static fake data
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    },
    initElectricalConsumptionChart() {
      const ctxElectric = document.getElementById('electricalConsumptionChart').getContext('2d');
      new Chart(ctxElectric, {
        type: 'line',
        data: {
          labels: this.generateLast24HoursLabels(),
          datasets: [{
            label: 'Electrical Consumption (kWh)',
            data: this.ElectricalConsumptionData(), // Use static fake data
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    },
    setRoomImg() {
      let room = this.roomName.split(' ').join('-');  // replace spaces with hyphens
      room = room.replace(/\//g, "+");

      this.imagePath = `/assets/${room}.jpg`;

      var img = document.getElementById("roomImg");
      img.src = this.imagePath;

      console.log(this.imagePath);
    },
    getIndexFromElement(element) {
      // Find the index of the component in the DOM
      const elements = document.querySelectorAll('.draggable');
      return Array.from(elements).indexOf(element);
    },
    initDraggable() {
      this.position = Array.from({ length: this.sensors.length }, () => ({ x: 0, y: 0 })); //replace with api get call
      console.log(this.position);
      const vm = this; // Save the reference to the Vue instance

      interact('.draggable').draggable({
        listeners: {
          start(event) {
            console.log(event.type, event.target);
          },
          move(event) {
            const index = vm.getIndexFromElement(event.target); // Get the index of the component
            vm.position[index].x += event.dx;
            vm.position[index].y += event.dy;

            event.target.style.transform = `translate(${vm.position[index].x}px, ${vm.position[index].y}px)`;
            // do api post call to update position
          }
        }
      });

      // interact('.draggable')
      // .on('mouseenter', function (event) {
      //   // Show the description upon hovering
      //   let description = event.target.querySelector('.sensor_description');
      //   console.log(description);
      //   description.style.display = 'block';
    
      // })
      // .on('mouseleave', function (event) {
      //   // Hide the description when mouse leaves
      //  let description = event.target.querySelector('.sensor_description');
      //  console.log(description);
      //   description.style.display = 'none';
      // });
    }
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

.chart-container {
  position: relative;
  height: 300px;
  /* Adjust the height as necessary */
  width: 100%;
  /* Take the full width of the parent */
}
.floor-plan-image {
  position: relative;
}

.overlay {
  position: absolute; 
  background: rgba(255, 242, 0, 0.365);
}


.draggable {
  width: 9%;

  margin: 1rem 0 0 1rem;
  background-color: rgba(34, 153, 238, 0.5);
  color: white;
  border-radius: 0.75em;
  border-color: rgb(34,153,238);
  color: white;
  border-radius: 0.75em;
  padding: 1%;
  touch-action: none;
  user-select: none;
  position: relative;
  display: inline-block;
}

.draggable img {
  max-width: 100%; /* Ensure the image fits inside the container */
  max-height: 100%; /* Ensure the image fits inside the container */
}

.sensor_description{
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  color:#000000;
  border: 1px solid #ccc;
  padding: 5px;
  z-index: 1000; /* Ensure the description is above other elements */
}

.sensor_description:hover{
  display: block;
}


</style>