<template>
  <div class="container mt-5">
    <h1 class="text-center mb-5 display-4">Sensor Devices</h1>

    <div class="mb-4">
      <label for="typeFilter" class="mr-2">Filter by Type:</label>
      <select id="typeFilter" v-model="selectedType" class="form-control w-auto d-inline-block">
        <option value="all">All</option>
        <option value="0">Panic</option>
        <option value="1">Temperature</option>
        <option value="2">People Counter</option>
      </select>
    </div>

    <div class="row">
      <div class="col-md-4" v-for="deviceName in filteredDeviceNames" :key="deviceName">
        <router-link :to="{ name: 'sensor-details', params: { id: deviceName }}">
          <div class="card mb-4 shadow">
              <div class="card-header bg-primary text-white">
                {{ deviceName }}
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ sensorType(sensors[deviceName][0].type) }}</h5>
                <!-- Check if type is Temperature -->
                <div v-if="sensors[deviceName][0].type == 1">
                  <p class="card-text">Temperature: {{ getLastReading(deviceName).split(',')[0] }}°C</p>
                  <p class="card-text">Humidity: {{ getLastReading(deviceName).split(',')[1] }}%</p>
                </div>
                <!-- Otherwise, display data as it is -->
                <div v-else>
                  <p class="card-text">{{ getLastReading(deviceName) }}</p>
                </div>
                <p class="card-text">
                  <small>Last updated: <span class="text-muted">{{ formatDate(sensors[deviceName][sensors[deviceName].length - 1].time) }}</span></small>
                </p>
              </div>
            </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
  
  
  <script>
  export default {
    data() {
      return {
        selectedType: 'all',
        sensors: {},
        uniqueDeviceNames: []
      };
    },
    async created() {
        try {
            const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/backup');
            const rawData = await response.json();
            
            // Process rawData to get the desired dictionary
            this.sensors = rawData.reduce((acc, curr) => {
            if (!acc[curr.deviceName]) {
                acc[curr.deviceName] = [];
            }
            acc[curr.deviceName].push(curr);
            return acc;
            }, {});
            
            // If you want an array of unique device names
            this.uniqueDeviceNames = Object.keys(this.sensors);

        } catch (error) {
            console.error("Error fetching sensors:", error);
        }
    },
    methods: {
      getTypeName(type) {
        const types = {
          0: 'Panic',
          1: 'Temperature',
          2: 'People Counter'
        };
        return types[type] || 'Unknown';
      },
      getLastReading(deviceName) {
      // Assuming the last reading is at the last index (latest timestamp)
        return this.sensors[deviceName][this.sensors[deviceName].length - 1].data;
      },
      sensorType(type) {
        switch(type) {
          case 0: return "Panic";
          case 1: return "Temperature";
          case 2: return "People Counter";
          default: return "Unknown";
        }
      },
      formatDate(dateTime) {
        const date = new Date(dateTime);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed
        const year = date.getUTCFullYear();
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
    },
    computed: {
      filteredDeviceNames() {
        if (this.selectedType === 'all') {
          return this.uniqueDeviceNames;
        }

        return this.uniqueDeviceNames.filter(deviceName => {
          return this.sensors[deviceName][0].type == this.selectedType;
        });
      }
    },
  };
  </script>
  
  <style scoped>
  .card-header {
    font-size: 1.25rem;
    font-weight: 500;
  }
  .card-title {
    margin-bottom: 0.5rem;
  }
  .stretched-link::after {
    background-color: rgba(0, 119, 204, 0.1);  /* Slight overlay to indicate clickable */
  }
  </style>