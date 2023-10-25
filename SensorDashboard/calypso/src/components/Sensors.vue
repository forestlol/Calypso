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
        <router-link :to="{ name: 'sensor-details', params: { id: deviceName }}">
          <div class="card mb-4 shadow">
              <div class="card-header bg-primary text-white">
                {{ deviceName }}
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ getTypeName(sensors[deviceName][0].type) }}</h5>
                <!-- Check if type is Temperature -->
                <div v-if="sensors[deviceName][0].type == 1">
                  <p class="card-text">Temperature: {{ parseFloat(getLastReading(deviceName).split(',')[0]).toFixed(2) }}°C</p>
                  <p class="card-text">Humidity: {{ getLastReading(deviceName).split(',')[1] }}%</p>
                </div>
                <!-- Otherwise, display data as it is -->
                <div v-else>
                  <p class="card-text">{{ getLastReading(deviceName) }}</p>
                </div>
                <p class="card-text">
                  <small>Last updated: <span class="text-muted">{{  formatDate(sensors[deviceName][sensors[deviceName].length - 1].time) }}</span></small>
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
        uniqueDeviceNames: [],
        searchTerm: '',
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
        let filteredNames = this.uniqueDeviceNames;

        if (this.selectedType !== 'all') {
          filteredNames = filteredNames.filter(deviceName => {
            return this.sensors[deviceName][0].type == this.selectedType;
          });
        }

        if (this.searchTerm) {
          const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
          filteredNames = filteredNames.filter(deviceName => {
            return deviceName.toLowerCase().includes(lowerCaseSearchTerm);
          });
        }

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
        }
    },
  };
</script>
  
<style scoped>
  /* Base styles */
  .container {
      font-family: 'Arial', sans-serif;
      color: #333;
  }

  h1, h3 {
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
      background: linear-gradient(to bottom right, #f8f9fa, #e9ecef);
      transition: transform 0.3s, box-shadow 0.3s;
      border-radius: 10px;
  }

  .card:hover {
      transform: translateY(-5px);
      box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
  }

  .card-header {
      border-radius: 10px 10px 0 0;
      font-weight: 600;
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

  /* Mobile Responsive - adjust as per your requirements */
  @media (max-width: 768px) {
      .container {
          padding-left: 10px;
          padding-right: 10px;
      }

      .form-control.w-50 {
          width: 100%!important;
          margin-bottom: 1rem;
      }
  }
</style>
