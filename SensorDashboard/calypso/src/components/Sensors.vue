<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container mt-5">
    <h1 class="text-center mb-5 display-4">Sensor Devices</h1>

    <div class="mb-4">
      <label for="typeFilter" class="mr-2">Filter by Type: &nbsp;</label>
      <select id="typeFilter" v-model="selectedType" class="form-control w-auto d-inline-block">
        <option value="all">All</option>
        <option value="0">Panic</option>
        <option value="1">Temperature</option>
        <option value="2">People Counter</option>
      </select>
      <p></p>
      <input v-model="searchTerm" type="text" placeholder="Search for a device..." class="form-control w-50">
      <p></p>
      <button @click="downloadReport" class="btn btn-primary">Download Today's Report</button>
      <button @click="configNotification" class="btn btn-primary m-2">Configure Notification</button>
    </div>
    <p class="mb-4">{{ filteredDeviceNames.length }} device(s) found.</p>
    <div class="row mb-3" v-for="(deviceGroup, sensorType) in groupedAndOrderedDeviceNames" :key="sensorType">
      <!-- Divider and Group Header -->
      <div class="col-12">
        <h3 class="mt-4 mb-2">{{ getTypeName(sensorType) }}</h3>
        <hr />
      </div>
      <!-- Devices in the Group -->
      <div class="col-md-4" v-for="deviceName in deviceGroup" :key="deviceName">
        <router-link v-if="sensors[deviceName][0].type !== 0" :to="{ name: 'sensor-details', params: { id: deviceName } }"
          custom v-slot="{ navigate }">
          <div class="card mb-4 shadow" @click="navigate" style="cursor: pointer;">
            <div class="card-header" :class="getCardHeaderClass(deviceName)">
              <div class="status-indicator"
                :class="{ 'active': isActive(deviceName), 'inactive': !isActive(deviceName) }"></div>
              {{ deviceName }} {{ roomData[deviceName] }}
            </div>
            <div class="card-body">
              <!-- <span class="status-text">{{ isActive(deviceName) ? 'Active' : 'Inactive' }}</span> -->
              <!-- <h5 class="card-title">{{ getTypeName(sensors[deviceName][0].type) }}</h5>-->
              <!-- Check if type is Temperature -->
              <div v-if="sensors[deviceName][0].type == 1">
                <p class="card-text">Temperature: {{ parseFloat(getLastReading(deviceName).split(',')[0]).toFixed(2) }}°C
                </p>
                <p class="card-text">Humidity: {{ getLastReading(deviceName).split(',')[1] }}%</p>
              </div>
              <!-- Otherwise, display data as it is -->
              <div v-else>
                <p class="card-text">Current people count: {{ getLastReading(deviceName) }}</p>
              </div>
              <p></p>
              <p class="card-text">
                <small>Last updated: <span class="text-muted">{{ formatDate(sensors[deviceName][sensors[deviceName].length
                  - 1].time) }}</span></small>
              </p>
            </div>
          </div>
        </router-link>
        <!-- Panic card here-->
        <div v-else class="card mb-4 shadow"
          :class="isAcknowledged(deviceName) ? 'panic-card-acknowledged' : 'panic-card'">
          <div class="card-header text-white" :class="isAcknowledged(deviceName) ? 'bg-success' : 'bg-danger'">
            <span style="font-weight: bold; font-size: 1.5rem;">⚠️&nbsp;</span>
            {{ deviceName }} {{ roomData[deviceName] }}
          </div>
          <div class="card-body">
            <p v-if="isAcknowledged(deviceName)" class="text-success">Alert acknowledged!</p>
            <!--<h5 class="card-title">{{ getTypeName(sensors[deviceName][0].type) }}</h5> -->
            <!-- Otherwise, display data as it is -->
            <div>
              <div v-if="sensors[deviceName][0].type == 0" class="card-text">
                <p><span v-if="getLastReading(deviceName) == '1'">Incident Alert!</span><span v-else>Acknowledged</span>
                </p>
                <button v-if="getLastReading(deviceName) == '1'" @click="acknowledgePanic(deviceName)"
                  class="btn btn-danger" :disabled="isAcknowledged(deviceName)">Acknowledge</button>
              </div>
            </div>
            <p class="card-text">
              <small>Last updated: <span class="text-muted">{{ formatDate(sensors[deviceName][sensors[deviceName].length -
                1].time) }}</span></small>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  
<script>
//import * as CacheManager from '@/CacheManager.js';

export default {
  data() {
    return {
      selectedType: 'all',
      sensors: {},
      uniqueDeviceNames: [],
      searchTerm: '',
      roomData: {}, // { devicename : {room_name:"", device_name : "" } }
      refreshInternal: null, 
    };
  },
  mounted() {
    this.equalizeCardHeaderHeights();
  },
  async created() {
    // if (CacheManager.getItem('readings') != null) {
    //   this.sensors == CacheManager.getItem('readings');
    //   await this.GetLatestReadings();
    // } else {
    //   await this.GetLatestReadings();
    // }
    await this.GetLatestReadings();
    this.setRefreshInterval();
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    setRefreshInterval() {
      // Set up an interval to fetch data every 2 minutes
      this.refreshInterval = setInterval(() => {
        this.GetLatestReadings();
      }, 120000); // 120000 milliseconds = 2 minutes
    },
    equalizeCardHeaderHeights() {
      this.$nextTick(() => {
        const cardHeaders = [...document.querySelectorAll('.card-header')];
        let maxHeight = 0;

        // Reset any previously set heights
        cardHeaders.forEach(el => el.style.minHeight = null);

        // Calculate the max height
        cardHeaders.forEach(el => {
          maxHeight = Math.max(maxHeight, el.offsetHeight);
        });

        // Apply the max height to all card headers
        cardHeaders.forEach(el => {
          el.style.minHeight = `${maxHeight}px`;
        });
      });
    },
    async GetLatestReadings() {
      try {
        const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/latest/readings');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let text = await response.text();

        // Replace ObjectId and ISODate formats with valid JSON
        text = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
        text = text.replace(/ISODate\("([^"]+)"\)/g, '"$1"');

        const rawData = JSON.parse(text);

        // Process rawData to get the desired dictionary
        this.sensors = rawData.reduce((acc, curr) => {
          if (!acc[curr.deviceName]) {
            acc[curr.deviceName] = [];
          }

          // Convert time string to Date object, if needed
          if (curr.time && typeof curr.time === 'string') {
            curr.time = new Date(curr.time);
          }

          acc[curr.deviceName].push(curr);
          return acc;
        }, {});

        // If you want an array of unique device names
        this.uniqueDeviceNames = Object.keys(this.sensors);
        this.fetchRoomData();
        //CacheManager.setItem('readings', this.sensors);
      } catch (error) {
        console.error("Error fetching sensors:", error);
      }

    },
    async fetchRoomData() {
      try {
        const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/building');
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }

        const text = await response.text();
        const sanitizedText = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
        const buildings = JSON.parse(sanitizedText);

        // iterate through this.sensors and print all
        const rooms = buildings[0].building.floors[0].rooms;
        for (let i = 0; i < rooms.length; i++) {
          for (let j = 0; j < rooms[i].sensors.length; j++) {
            if (this.uniqueDeviceNames.includes(rooms[i].sensors[j])) {
              this.roomData[rooms[i].sensors[j]] = rooms[i].room_name; // { 84AECD: Material Room }
            }
          }

        }
      } catch (err) {
        console.error(err);
        this.error = 'Failed to load floor data: ' + err.message;
      }
    },
    getTypeName(type) {
      const types = {
        0: 'Panic',
        1: 'Temperature',
        2: 'People Counter'
      };
      return types[type] || 'Unknown';
    },
    getCardHeaderClass(deviceName) {
      const sensorType = this.sensors[deviceName][0].type;
      switch (sensorType) {
        case 0: return 'card-header-panic';
        case 1: return 'card-header-temperature';
        case 2: return 'card-header-people-counter';
        default: return '';
      }
    },
    getLastReading(deviceName) {
      // Assuming the last reading is at the last index (latest timestamp)
      return this.sensors[deviceName][this.sensors[deviceName].length - 1].data;
    },
    formatDate(dateTime) {
      const date = new Date(dateTime);

      date.setUTCHours(date.getUTCHours());

      const day = date.getUTCDate().toString().padStart(2, '0');
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed
      const year = date.getUTCFullYear();
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    },
    acknowledgePanic(deviceName) {
      window.alert(`Panic alert for ${deviceName} has been acknowledged.`);
      // Update local state to reflect that the panic has been acknowledged
      // Assuming the data is a string and you want to set it to '0'
      const device = this.sensors[deviceName];
      console.log(deviceName);
      device[device.length - 1].data = '0';
    },
    isAcknowledged(deviceName) {
      return this.getLastReading(deviceName) !== '1';
    },
    async downloadReport() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaysData = Object.entries(this.sensors).reduce((acc, [deviceName, readings]) => {
        const todaysReadings = readings.filter(reading => {
          const readingDate = new Date(reading.time);
          readingDate.setHours(0, 0, 0, 0);
          return readingDate.getTime() === today.getTime();
        });

        if (todaysReadings.length > 0) {
          acc[deviceName] = todaysReadings;
        }

        return acc;
      }, {});

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Device Name,Type,Data,Time\n";

      Object.entries(todaysData).forEach(([deviceName, readings]) => {
        readings.forEach(reading => {
          const time = new Date(reading.time);
          let hours = time.getUTCHours();
          const minutes = time.getUTCMinutes().toString().padStart(2, '0');

          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
          csvContent += `${deviceName},${this.getTypeName(reading.type)},${reading.data},${formattedTime}\n`;
        });
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "sensors_report_today.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    isActive(deviceName) {
      if (!this.sensors[deviceName] || this.sensors[deviceName].length === 0) {
        return false;
      }

      const lastSensorData = this.sensors[deviceName][this.sensors[deviceName].length - 1];
      if (!lastSensorData || !lastSensorData.time) {
        return false;
      }

      const lastUpdateTime = new Date(lastSensorData.time);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - lastUpdateTime.getTime(); // time difference in milliseconds
      return timeDifference < 15 * 60 * 1000; // 15 minutes in milliseconds
    },
    configNotification() {
      // Navigate to the page where you can config notification 
      this.$router.replace({
        name: 'Notification'
      });
    }
  },
  computed: {
    filteredDeviceNames() {
      let filteredNames = Object.keys(this.roomData);

      if (this.selectedType !== 'all') {
        filteredNames = filteredNames.filter(deviceName => {
          return this.sensors[deviceName][0].type == this.selectedType;
        });
      }

      if (this.searchTerm) {
        const lowerCaseSearchTerm = this.searchTerm.toLowerCase();

        filteredNames = filteredNames.filter(deviceName => {
          return deviceName.toLowerCase().includes(lowerCaseSearchTerm) || this.roomData[deviceName].toLowerCase().includes(lowerCaseSearchTerm);
        });
      }
      //console.log(filteredNames);
      // Sort devices based on their type
      filteredNames.sort((a, b) => {
        const typeA = this.sensors[a][0].type;
        const typeB = this.sensors[b][0].type;
        return typeA - typeB;
      });

      return filteredNames;
    },
    groupedAndOrderedDeviceNames() {
      const grouped = {};

      this.filteredDeviceNames.forEach(deviceName => {
        const type = this.sensors[deviceName][0].type;
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push(deviceName);
      });
      return grouped;
    },
  },
};
</script>
  
<style scoped>
/* Base styles */
.container {
  font-family: 'Arial', sans-serif;
  color: rgb(216, 216, 216);
}

h1,
h3 {
  color: #444;
}

/* Link styles */
a {
  text-decoration: none;
  color: #007BFF;
}

a:hover {
  color: #0056b3;
}

/* Card styles */
.card {
  border: none;
  background: #f8f9fa;
  color: #333;
  transition: transform 0.3s, box-shadow 0.3s;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  flex-direction: column;
  flex: 1 0 calc(33.333% - 16px);
  /* Adjust percentage for 3 in a row minus gap */
  display: grid;
  grid-template-rows: auto 1fr auto; /* Header, content, footer */
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  /* or whatever minimum height you desire */
}


.card-header-temperature {
  background-color: #e67e22 !important;
  color: #fff;
  border-radius: 10px 10px 0 0;
  font-weight: bold;
}

.card-header-people-counter {
  background-color: #4682B4 !important;
  color: #fff;
  border-radius: 10px 10px 0 0;
  font-weight: bold;
}

.card-body {
  padding: 1.25rem;
}

/* Dropdown and Search styles */
.form-control {
  border-radius: 20px;
  border: 1px solid #ced4da;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
  border-color: #007BFF;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.1);
}

.panic-card {
  background-color: #FFEBEB;
  /* Light red background */
  border: 1px solid #FF6666;
  /* Darker red border */
  box-shadow: 0 4px 8px rgba(255, 51, 51, 0.2);
  /* Soft red shadow */
  animation: pulse 2s infinite;
  /* Pulsating effect */
}

.panic-card .card-header {
  background-color: #FF6666 !important;
  /* Darker red background for header */
  color: #ffffff;
  /* White text */
  font-weight: bold;
  /* Bold text */
  font-size: 1.25rem;
  /* Larger font size */
}

.panic-card .card-body {
  color: #333333;
  /* Dark text for better contrast and readability */
}

.panic-card .card-body h5,
.panic-card .card-body p {
  font-weight: bold;
  /* Bold text for better visibility */
}

.panic-card-acknowledged {
  background-color: #e6ffcc;
  /* Light green background */
  border: 1px solid #b3ff66;
  /* Darker green border */
  box-shadow: 0 4px 8px rgba(179, 255, 102, 0.2);
  /* Soft green shadow */
}

.panic-card-acknowledged .card-header {
  background-color: #b3ff66;
  /* Darker green background for header */
  color: #ffffff;
  /* White text */
  font-weight: bold;
  /* Bold text */
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 8px rgba(255, 51, 51, 0.2);
  }

  50% {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 51, 51, 0.3);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 4px 8px rgba(255, 51, 51, 0.2);
  }
}

.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-indicator.active {
  background-color: green;
}

.status-indicator.inactive {
  background-color: red;
}

.status-text {
  vertical-align: middle;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Replace 300px with your card width */
  gap: 16px; /* Adjust the space between cards */
  /* Adjust the space between cards */
  justify-content: center;
  /* Center cards in the container */
}


/* Mobile Responsive - adjust as per your requirements */
@media (max-width: 768px) {
  .container {
    padding-left: 10px;
    padding-right: 10px;
  }

  .form-control.w-50 {
    width: 100% !important;
    margin-bottom: 1rem;
  }

  .card-header {
    min-height: auto;
  }
}</style>
