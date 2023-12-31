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
    </div>
    <p class="mb-4">{{ filteredDeviceNames.length }} device(s) found.</p>
    <div class="row mb-3" v-for="(deviceGroup, sensorType) in groupedAndOrderedDeviceNames" :key="sensorType">
      <!-- Divider and Group Header -->
      <div class="col-12">
        <h3 class="mt-4 mb-2">{{ getTypeName(sensorType) }}</h3>
        <hr />
      </div>
      <!-- Devices in the Group -->
      <div class="col-md-4" v-for="deviceName in deviceGroup" :key="deviceName" >
        <router-link v-if="sensors[deviceName][0].type !== 0" :to="{ name: 'sensor-details', params: { id: deviceName }}" custom v-slot="{ href, navigate }">
          <div class="card mb-4 shadow" @click="navigate" style="cursor: pointer;">
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
          <!-- Panic card here-->
          <div v-else class="card mb-4 shadow" :class="isAcknowledged(deviceName) ? 'panic-card-acknowledged' : 'panic-card'">
            <div class="card-header text-white" :class="isAcknowledged(deviceName) ? 'bg-success' : 'bg-danger'">
              <span style="font-weight: bold; font-size: 1.5rem;">⚠️&nbsp;</span>
              {{ deviceName }}
            </div>
            <div class="card-body">
                <p v-if="isAcknowledged(deviceName)" class="text-success">Alert acknowledged!</p>
                <h5 class="card-title">{{ getTypeName(sensors[deviceName][0].type) }}</h5>
                <!-- Otherwise, display data as it is -->
                <div>
                  <div v-if="sensors[deviceName][0].type == 0" class="card-text">
                    <p>Status: <span v-if="getLastReading(deviceName) == '1'">Alert</span><span v-else>Acknowledged</span></p>
                    <button v-if="getLastReading(deviceName) == '1'" @click="acknowledgePanic(deviceName)" class="btn btn-danger" :disabled="isAcknowledged(deviceName)">Acknowledge</button>
                  </div>
                </div>
                <p class="card-text">
                  <small>Last updated: <span class="text-muted">{{  formatDate(sensors[deviceName][sensors[deviceName].length - 1].time) }}</span></small>
                </p>
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
      },
      acknowledgePanic(deviceName) {
        window.alert(`Panic alert for ${deviceName} has been acknowledged.`);
        // Update local state to reflect that the panic has been acknowledged
        // Assuming the data is a string and you want to set it to '0'
        const device = this.sensors[deviceName];
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
        },
        
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

  .panic-card {
    background-color: #FFEBEB; /* Light red background */
    border: 1px solid #FF6666; /* Darker red border */
    box-shadow: 0 4px 8px rgba(255, 51, 51, 0.2); /* Soft red shadow */
    animation: pulse 2s infinite; /* Pulsating effect */
  }

  .panic-card .card-header {
      background-color: #FF6666; /* Darker red background for header */
      color: #ffffff; /* White text */
      font-weight: bold; /* Bold text */
      font-size: 1.25rem; /* Larger font size */
    }

  .panic-card .card-body {
    color: #333333; /* Dark text for better contrast and readability */
  }

  .panic-card .card-body h5,
  .panic-card .card-body p {
    font-weight: bold; /* Bold text for better visibility */
  }

  .panic-card-acknowledged {
    background-color: #e6ffcc; /* Light green background */
    border: 1px solid #b3ff66; /* Darker green border */
    box-shadow: 0 4px 8px rgba(179, 255, 102, 0.2); /* Soft green shadow */
  }

  .panic-card-acknowledged .card-header {
    background-color: #b3ff66; /* Darker green background for header */
    color: #ffffff; /* White text */
    font-weight: bold; /* Bold text */
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
