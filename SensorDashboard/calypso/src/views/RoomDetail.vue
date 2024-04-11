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
            <button class="nav-link" id="floor-plan-tab" data-bs-toggle="tab" data-bs-target="#floor-plan-tab-pane" type="button"
              role="tab" aria-controls="floor-plan-tab-pane" aria-selected="false">Sensor Location</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="items-tab" data-bs-toggle="tab" data-bs-target="#items-tab-pane" type="button"
              role="tab" aria-controls="items-tab-pane" aria-selected="false">BMS Items</button>
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
                  <span v-if="sensor.type == 0 || sensor.type == -1">Panic Alert</span>
                  <span v-if="sensor.type == 1">Temperature & Humidity Sensor</span>
                  <span v-if="sensor.type == 2">People Counter</span>
                  &nbsp;
                  <h6 class="">(Sensor ID: {{ sensor.id }})</h6>
                </div>
                <div class="card-body">
                  <p v-if="sensor.type == 0 || sensor.type == -1 " class="card-text">
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
            <!-- <div class="row mt-4">
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
            </div> -->
          </div>
          <div class="text-center mt-4">
            <router-link :to="`/building/`" class="btn btn-primary btn-fixed-size">Back to Building</router-link>
            <router-link :to="{ path: `/building/${buildingName}/${floorName}`, query: { tab: 'allsensors' } }"
              class="btn btn-secondary btn-fixed-size">Back to Floor</router-link>

          </div>
        </div>
        <!-- Display Floor Plan -->
        <div class="tab-pane" id="floor-plan-tab-pane" role="tabpanel" aria-labelledby="floor-plan-tab" tabindex="0">
          <br>
          <div class="row gx-5">
            <div class="floor-plan-image col-12" id="sensors-drag">

              <div class="form-check form-switch form-control-lg">
                  <input class="form-check-input" type="checkbox" role="switch" id="edit_toggle" @change="toggleEdit()" checked>
                  <label class="form-check-label" id="label_edit_toggle" for="edit_toggle">Edit Mode </label>
                  <a data-bs-toggle="tooltip" :title="this.editMsg"><img class="img-fluid info-img" src="/src/assets/info.png"></a>
              </div>
              <div><img :src="imagePath" id="roomImg" class="img-fluid mx-auto d-block" alt="Room Image"></div>

              <!-- <div v-for="sensor in this.sensors"
                   :key="sensor.id"
                   :id="`icon_${sensor.id}`"
                   class="draggable drag-element" :style="{ transform: `translate(${this.position[sensor.id].x}px, ${this.position[sensor.id].y}px)` }">
                    <router-link v-if="!this.editMode" :to="`/sensor/${sensor.id}`">
                      <img v-if="this.position[sensor.id].type == 2" class="img-fluid" src="/src/assets/people-count.png">
                      <img v-else-if="this.position[sensor.id].type  == 1" class="img-fluid" src="/src/assets/temperature.png">                      
                      <img v-else class="img-fluid" src="/src/assets/sensor.png">
                    </router-link>
                    <div v-else>
                      <img v-if="this.position[sensor.id].type == 2" class="img-fluid" src="/src/assets/people-count.png">
                      <img v-else-if="this.position[sensor.id].type  == 1" class="img-fluid" src="/src/assets/temperature.png">                      
                      <img v-else class="img-fluid" src="/src/assets/sensor.png">
                    </div>
                    
                    <span :id="`description_${sensor.id}`" class="sensor_description">ID:{{ sensor.id }}</span>

              </div> -->
              <div v-for="sensor in this.sensors"
                   :key="sensor.id"
                   :id="`icon_${sensor.id}`"
                   class="draggable drag-element" :style="{ transform: `translate(${this.position[sensor.id].x}px, ${this.position[sensor.id].y}px)` }">
                   <a  data-bs-toggle="tooltip" data-bs-html="true" :title="sensor.id"><img v-if="this.position[sensor.id].type == 2" class="img-fluid" src="/src/assets/people-count.png">
                   <img v-else-if="this.position[sensor.id].type  == 1" class="img-fluid" src="/src/assets/temperature.png">                      
                   <img v-else class="img-fluid" src="/src/assets/sensor.png"></a>
                    
                    <!-- <span :id="`description_${sensor.id}`" class="sensor_description">ID:{{ sensor.id }}</span> -->

              </div>
            </div>

          </div>


          <div class="text-center mt-4">
            <router-link :to="`/building/`" class="btn btn-primary btn-fixed-size">Back to Building</router-link>
            <router-link :to="{ path: `/building/${buildingName}/${floorName}`, query: { tab: 'allsensors' } }"
              class="btn btn-secondary btn-fixed-size">Back to Floor</router-link>

          </div>


        </div>
        <div class="tab-pane" id="items-tab-pane" role="tabpanel" aria-labelledby="items-tab"
          tabindex="0">
          BMS data 
          <div class="row mt-4">
            <!-- <div class="col-12 col-md-6">
              <h2 class="text-center">Water Consumption Data</h2>
              <div class="chart-container">
                <canvas id="waterConsumptionChart"></canvas>
              </div>
            </div> -->
            <div class="col-12 col-md-6">
              <h2 class="text-center">Electrical Consumption Data</h2>
              <div class="chart-container">
                <canvas id="electricalConsumptionChart"></canvas>
              </div>
            </div>
            <!-- <div class="col-12 col-md-6">
              <h2 class="text-center">Energy Consumption Data</h2>
              <div class="chart-container">
                <canvas id="energyConsumptionChart"></canvas>
              </div>
            </div> -->
<!-- 
            <div class="col-12 col-md-6">
              <h2 class="text-center">Weekly Energy Usage</h2>
              <div class="chart-container">
                <canvas id="weeklyEnergyConsumptionChart"></canvas>
              </div>
            </div>

          </div> 
          <div class="row mt-4">
            <div class="col-12 col-md-6">
              <h2 class="text-center">Air Pressure Data</h2>
              <div class="chart-container">
                <canvas id="airPressureChart"></canvas>
              </div>
            </div> -->
            <div class="col-12 col-md-6">
              <h2 class="text-center">Water Inflow/Outflow Data</h2>
              <div class="chart-container">
                <canvas id="waterInflowOutflowChart"></canvas>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <h2 class="text-center">Sensor Device Monitoring Chart</h2>
              <div class="chart-container">
                <canvas id="sensorMonitorChart"></canvas>
              </div>
            </div>
          </div>

          <div class="text-center mt-4">
              <router-link :to="`/building/`" class="btn btn-primary">Back to Building</router-link>
              <router-link :to="{ path: `/building/${buildingName}/${floorName}` }"
                class="btn btn-secondary">Back to Floor</router-link>
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
import { Chart, registerables } from 'chart.js';
import interact from 'interactjs';
import { Tooltip } from 'bootstrap';
import { useTransitionState } from 'vue';
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
      editMode: true,
      editMsg: "Toggle between View and Edit Mode. Edit Mode allows dragging of icons to change their position",
      bmsDeviceGroup: [],
      bms24hrData: [],
      
    };
  },
  async mounted() {    
    new Tooltip(document.body, {
      selector: "[data-bs-toggle='tooltip']",
    });
    this.parseUrlParams();
    this.getPosition();
    this.fetchRoomSensors().then(() => {
      this.$nextTick(() => {
        this.getbmsDeviceGroups();
        // this.initWaterConsumptionChart();
        this.initElectricalConsumptionChart();
        // this.initEnergyConsumptionChart();
        this.initWaterInflowOutflowChart();
        // this.initAirPressureChart();
        this.initSensorMonitorChart();
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
    async getPosition(){
      try {
        let response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/sensor/list');
        if (!response.ok) throw new Error('Failed to fetch sensor data');
        let text = this.sanitizeResponse(await response.text());
        let sensorData = JSON.parse(text);
        let sensorPosition = {};
        sensorData.forEach(sensor => {
          sensorPosition[sensor.name] = {x: sensor.position.x, y: sensor.position.y, type: sensor.type, id: sensor._id};
        });
        this.position = sensorPosition;
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
    generateLast24HoursLabels() {
      const labels = [];
      const currentHour = new Date().getHours(); // Get the current hour

      for (let i = 0; i < 24; i++) {
        labels.push(`${(currentHour - i + 24) % 24}:00`); // Format hours in 24-hour format
      }

      return labels.reverse(); // Reverse to get the labels in chronological order
    },
    async getbmsDeviceGroups(){
      try {
        let response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/Bacnet/api/get/bms/groups');
        if (!response.ok) throw new Error('Failed to fetch sensor data');
        let text = this.sanitizeResponse(await response.text());
        let deviceData = JSON.parse(text);
        let deviceGroups = {}
        deviceData.forEach(group => {
          // later arrange in for each group, pair with corresponding unit
          // _id: {name: {group: , units:}, {group: , units:}}
          let group_unit = []
          for (let i = 0; i < group.units.length; i++) {
            group_unit.push({group: group.group[i], units: group.units[i]}); 
          }
          deviceGroups[group.name] = {group: group_unit};
        });
        this.bmsDeviceGroup = deviceGroups;
      } catch (err) {
        console.error(err);
        this.error = err.message;
      }
    },
    // functionally same as https://hammerhead-app-kva7n.ondigitalocean.app/Bacnet/api/get/object/ObjectId
    // async getbms24hrData(){
    //   try{
    //     let response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/Bacnet/api/get/all/latest/data');
    //     if (!response.ok) throw new Error('Failed to fetch sensor data');
    //     let text = this.sanitizeResponse(await response.text());
    //     let bmsData = JSON.parse(text);
    //     let dayData = {}
    //     // ObjectID: {{id, device, name, value, time, status, description, dateTime}, {id, device, name, value, time, status, description, dateTime}...}
    //     // AI:9: {id: '6614189a070d5adfe1ada658', device: '32', name: 'RoomTemp_000', value: '27.7', time: '00:15:59', …}
    //     bmsData.forEach(data => {
    //       if (!dayData[data.ObjectId]) {
    //         // If not, initialize it as an empty array
    //         dayData[data.ObjectId] = [];
    //       }
          
    //       // Push a new object containing data properties to the array
    //       dayData[data.ObjectId].push({
    //         id: data._id,
    //         device: data.Device,
    //         name: data.Name,
    //         value: data.Value,
    //         time: data.Time,
    //         status: data.Status,
    //         description: data.Description,
    //         dateTime: data.dateTime
    //       });
    //     });
    //     this.bms24hrData = dayData;

    //   } catch (err) {
    //     console.error(err);
    //     this.error = err.message;
    //   }
    // },
    async bmsDeviceData(objectId){
      // get data for a specific object id 
      try{
        let response = await fetch(`https://hammerhead-app-kva7n.ondigitalocean.app/Bacnet/api/get/object/${objectId}`);
        if (!response.ok) throw new Error('Failed to fetch sensor data');
        let text = this.sanitizeResponse(await response.text());
        let bmsData = JSON.parse(text);
        let toclean = []
        let success = []
        bmsData.forEach(data => {
          toclean.push({
            value: data.Value,
            dateTime: data.dateTime
          });
          success.push({
            status: data.Status,
            dateTime: data.dateTime
          });
        });
        
        return {objectId: objectId, data: toclean, status: success};
        
      } catch (err) {
        console.error(err);
        this.error = err.message;
      }
    },
    WaterConsumptionData() {
      // Static fake data for 24 hours
      return [
        20, 18, 17, 16, 15, 14, 13, 12, 20, 25, 30, 35,
        40, 38, 37, 36, 34, 32, 30, 28, 26, 24, 22, 21
      ];
    },
    async ElectricalConsumptionData() {
      // Static fake data for 24 hours
      //hard coded object id
      let data = await this.bmsDeviceData("AV:43");
      let byHour = {};
      for (let i = 0; i < 24; i++) {
        byHour[i] = 0;
      }
      data.data.forEach(data => {
          let hour = new Date(data.dateTime).getHours();
          byHour[hour] += Math.abs(parseFloat(data.value));
        });

        return byHour;

    },
    EnergyConsumptionData(){
      // Static fake data for 24 hours
      return [
        28, 34, 37, 32, 34, 30, 30, 28, 26, 28, 22, 27,
        20, 18, 20, 16, 15, 14, 14, 12, 17, 25, 30, 35
      ];
    },
    weeklyEnergyConsumptionData(){
      // Static fake data for 7 days
      return [
        250, 230, 198, 263, 253, 241, 280
      ];
    },
    airPressureChart(){
      // static fake data for 24 hours
      return [
        1013, 1012, 1012, 1012, 1012, 1011, 1011, 1011, 1011, 1010, 1010, 1010,
        1010, 1010, 1009, 1009, 1009, 1009, 1009, 1008, 1008, 1008, 1008, 1008
      ]
    },
    waterInflowOutflowChart(){
      // static fake data for 24 hours
      // returns ([inflow], [outflow])
      return [
        [20, 18, 17, 16, 15, 14, 13, 12, 20, 25, 30, 35,
        40, 38, 37, 36, 34, 32, 30, 28, 26, 24, 22, 21],
        [15, 17, 17, 13, 12, 13, 13, 10, 17, 22, 29, 35,
        30, 30, 34, 35, 30, 28, 30, 26, 23, 24, 20, 20]
      ];
    },
    sensorMonitorChart(){
      // static fake data for 24 hours
      // returns ([panicAlert], [temperature], [peopleCounter]) 
      return [
        [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0,0,5,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
    },

    // gradientColor(value, data, opacity = 0.5){
    // this function is not working, delete if not needed in the future
    //   // Create gradient color for the chart
    //   const green = [0, 255, 0]; // Low consumption
    //   const red = [255, 0, 0]; // High consumption

    //   // Interpolate between green and red based on the data value
    //   const interpolate = (color1, color2, factor) => {
    //     return color1.map((c, index) => Math.round(c + factor * (color2[index] - c)));
    //   };

    //   // Calculate factor based on the data value
    //   const min = Math.min(...data);
    //   const max = Math.max(...data);
    //   const factor = (value - min) / (max - min);

    //   // Generate interpolated color
    //   const color = interpolate(green, red, factor);
    //   return `rgba(${color.join(',')}, ${opacity})`; // Return color with alpha (opacity)

    // },
    datato24hrformat(data){
      // convert  to 24 hour format
      let toReturn = [];
      let currHr = new Date().getHours();
      let toSplice = data.splice(currHr+1, data.length-1);
      toReturn = toSplice.concat(data);
      
      return toReturn;
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
    async initElectricalConsumptionChart() {
      const ctxElectric = document.getElementById('electricalConsumptionChart').getContext('2d');
      let values = [];
      try {
        let data = await this.ElectricalConsumptionData();
        values = Object.values(data);
        values = this.datato24hrformat(values);
        
      } catch (err) {
        console.error(err);
        this.error = err.message;
      }
      new Chart(ctxElectric, {
        type: 'line',
        data: {
          labels: this.generateLast24HoursLabels(),
          datasets: [{
            label: 'Electrical Consumption (kWh)',
            data: values, // Use static fake data
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
    initEnergyConsumptionChart(){
      // const ctxEnergy = document.getElementById('energyConsumptionChart').getContext('2d');
      // new Chart(ctxEnergy, {
      //   type: 'line',
      //   data: {
      //     labels: this.generateLast24HoursLabels(),
      //     datasets: [{
      //       label: 'Energy Consumption (kWh)',
      //       data: this.EnergyConsumptionData(), // Use static fake data
      //       backgroundColor: 'rgba(75, 192, 192, 0.5)',
      //       borderColor: 'rgba(75, 192, 192, 1)',
      //       borderWidth: 1,
      //     }],
      //   },
      //   options: {
      //     scales: {
      //       y: {
      //         beginAtZero: true
      //       }
      //     }
      //   }
      // });

      const ctxWeeklyEnergy = document.getElementById('weeklyEnergyConsumptionChart').getContext('2d');
      //create bar chart for ctxWeeklyEnergy
      new Chart(ctxWeeklyEnergy, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Energy Consumption (kWh)',
            data: this.weeklyEnergyConsumptionData(), // Use static fake data
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
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
    initAirPressureChart(){
      // create line chart for air pressure
      const ctxAirPressure = document.getElementById('airPressureChart').getContext('2d');
      new Chart(ctxAirPressure, {
        type: 'line',
        data: {
          labels: this.generateLast24HoursLabels(),
          datasets: [{
            label: 'Air Pressure (hPa)',
            data: this.airPressureChart(), // Use static fake data
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });

    },
    initWaterInflowOutflowChart(){
      // create line chart for water inflow/outflow
      const ctxWaterInflowOutflow = document.getElementById('waterInflowOutflowChart').getContext('2d');
      new Chart(ctxWaterInflowOutflow, {
        type: 'line',
        data: {
          labels: this.generateLast24HoursLabels(),
          datasets: [{
            label: 'Water Inflow (m³/hr)',
            data: this.waterInflowOutflowChart()[0], // Use static fake data
            backgroundColor:'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'Water Outflow (m³/hr)',
            data: this.waterInflowOutflowChart()[1], // Use static fake data
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
    initSensorMonitorChart(){
      const ctxSensorMonitor = document.getElementById('sensorMonitorChart').getContext('2d');
      new Chart(ctxSensorMonitor, {
        type: 'line',
        data: {
          labels: this.generateLast24HoursLabels(),
          datasets: [{
            label: 'Panic Alert',
            data: this.sensorMonitorChart()[0], // Use static fake data
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          {
            label: 'Temperature',
            data: this.sensorMonitorChart()[1], // Use static fake data
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'People Counter',
            data: this.sensorMonitorChart()[2], // Use static fake data
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 60, // Set the maximum value for the y-axis
              title: {
                display: true,
                text: 'Minutes of Downtime' // Label for the y-axis
                },
              
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
    },
    initDraggable() {
      //console.log(this.position);
      const vm = this; // Save the reference to the Vue instance

      let activeSensorId = null; // Initialize variable to track active sensor ID
      let newX = 0;
      let newY = 0;

      interact('.draggable').draggable({
        listeners: {
          start(event) {
            const sensorId = event.target.id.split('_')[1]; // Extract sensor ID
            activeSensorId = sensorId; // Set active sensor ID
            console.log(event.type, activeSensorId);
          },
          move(event) {
            if (activeSensorId !== null) { // Check if there is an active sensor
              
              let sensorPosition = vm.position[activeSensorId];
              if (sensorPosition) {
                // Calculate new position for the active sensor
                newX = vm.position[activeSensorId].x + event.dx;
                newY = vm.position[activeSensorId].y + event.dy;

                // Update position and apply transform only to the active sensor
                vm.position[activeSensorId].x = newX;
                vm.position[activeSensorId].y = newY;
                const sensorElement = document.getElementById(`icon_${activeSensorId}`);
                if (sensorElement) {
                  sensorElement.style.transform = `translate(${newX}px, ${newY}px)`;
                }
              }
            }
          },
          end(event) {
            console.log(vm.position[activeSensorId])
            const postData = {
                "id":vm.position[activeSensorId].id,
                "name": activeSensorId,
                "type": vm.position[activeSensorId].type,
                "position": {
                  "x": newX,
                  "y": newY
                }
              }
            activeSensorId = null; // Reset active sensor ID when drag operation ends
            // Perform API POST call to update positions if needed
            console.log(newX, newY);
            console.log(postData);


            fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/update/sensor/position', {
                method: 'POST',
                headers: {
                  'Accept': '*/*',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
              })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(data => {
              console.log('Response from server:', data);
            })
            .catch(error => {
              console.error('There was a problem with the fetch operation:', error);
            });
            // {
          //   "name": "string",
          //   "position": {
          //     "x": 0,
          //     "y": 0
          //   }
          // }
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
    },
    toggleEdit() {
      this.editMode = !this.editMode;
      console.log(this.editMode);
      //get elements with class draggable
      const draggableElements = document.getElementsByClassName('drag-element');
      // for each element, remove draggable class
      for (let i = 0; i < draggableElements.length; i++) {
        if (this.editMode) {
          draggableElements[i].classList.add('draggable');
        } else {
          draggableElements[i].classList.remove('draggable');
        }
      }


      const editToggle = document.getElementById('edit_toggle');
      const labeleditToggle = document.getElementById('label_edit_toggle');
      if (editToggle.checked) {
          labeleditToggle.textContent = 'Edit Mode';
      } else {
          labeleditToggle.textContent = 'View Mode';
      }
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

.btn-fixed-size {
  width: 150px;
  /* Set the width you want */
  height: 50px;
  /* Set the height you want */
  display: inline-block;
  /* This makes sure the width and height are applied */
  text-align: center;
  /* This centers the text inside the button */
  line-height: 50px;
  /* This centers the text vertically */
  padding: 0;
  /* Remove padding to maintain the size */
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


.drag-element {
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

.drag-element img {
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

.info-img {
  width: 20px;
  height: 20px;
}


</style>