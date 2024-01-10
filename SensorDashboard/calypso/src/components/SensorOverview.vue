<template>
<div class="container mt-5">

    <div class="row">
      <div class="col-lg-6 mb-5">
          <select class="form-select" v-model="selectedBuilding" aria-label="Default select example">
            <option disabled value="">Select your building</option>
            <option v-for="building in buildings" :key="building.building_name" :value="building.building_name">
              {{ building.building_name }}
            </option>
        </select>
      </div>
      <div class="text-center col-lg-6 mb-5">
        <h3 v-if="selectedBuilding" class="display-4">{{selectedBuilding}} <br> Sensors Overview</h3>
        <h3 v-else class="display-4">Sensors Overview</h3>
      </div>
    </div>
    
    <!-- Cards for Average Temperature, Humidity and Total People -->
    <div class="row">
        <div class="col-md-4">
            <div class="card mb-4">
                <h5 class="card-header bg-primary">Average Temperature</h5>
                <div class="card-body">
                  <p class="card-text">{{ averageTemperature }}°C</p>
                </div>
            </div>

            <div class="card mb-4">
                <h5 class="card-header  bg-primary">Average Humidity</h5>
                <div class="card-body">
                    <p class="card-text">{{ averageHumidity }}%</p>
                </div>
            </div>

            <div class="card mb-4">
                <h5 class="card-header  bg-primary">Total People</h5>
                <div class="card-body">
                    <p class="card-text">{{ totalPeople }}</p>
                </div>
            </div>
        </div>
        <div class="col-md-2 d-flex" style="height: auto;">
          <div class="vr"></div>
        </div>

    <!-- Bar Chart for Total Amount of Sensors -->
        <!-- <div class="row mb-4"> -->
        <!-- <div class="col-lg-6">
            <h3 class="text-center mb-3">Recent Active Sensor Distribution</h3>
            <div>
            <column-chart :data="sensorBarChartData" download="true"></column-chart>
            </div>
        </div> -->
        <div class="col-md-6">
            <h3 class="text-center mb-3">Recent Active Sensor Types</h3>
            <!-- Pie Chart for Total Amount of Sensors -->
            <div>
              <pie-chart :data="sensorPieChartData" download="true" donut="true"></pie-chart>
            </div>
        </div>
      </div>

</div>
</template>
  
<script>
  
  export default {
    data() {
      return {
        buildings: [],
        selectedBuilding: '',
        loading: false,
        error: null,
        sensors: {},
        sensorTypes: {
          0: 'Panic',
          1: 'Temperature',
          2: 'People Counter'
        },
      }
    },
    async created() {
      await this.fetchBuildings();
      try {
        const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/backup');
        const rawData = await response.json();
        this.sensors = rawData.reduce((acc, curr) => {
          if (!acc[curr.deviceName]) {
            acc[curr.deviceName] = [];
          }
          acc[curr.deviceName].push(curr);
          return acc;
        }, {});
      } catch (error) {
        console.error("Error fetching sensors:", error);
      }
    },
    methods: {
      async fetchBuildings() {
        this.loading = true;
        try {
          const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/building');
          if (!response.ok) {
            throw new Error('Network response was not ok.');
          }
          const text = await response.text();
          // Sanitize the response text to remove ObjectId references
          const sanitizedText = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
          const data = JSON.parse(sanitizedText);
          this.buildings = data.map(item => ({
            building_name: item.building.building_name,
            floors: item.building.floors.map(floor => ({
              floor_name: floor.floor_name,
              floor_level: floor.floor_level,
              rooms: floor.rooms
            }))
          }));
        } catch (err) {
          console.error(err);
          this.error = 'Failed to load buildings data: ' + err.message;
        } finally {
          this.loading = false;
        }
      },
        formatDate(date) {
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based in JavaScript
            const day = String(date.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    },
    computed: {
      sensorBarChartData() {
        const data = {};
        Object.keys(this.sensorTypes).forEach(type => {
          data[this.sensorTypes[type]] = Object.values(this.sensors).filter(sensor => sensor[0].type == type).length;
        });
        return data;
      },
      sensorPieChartData() {
        const data = {};
        Object.keys(this.sensorTypes).forEach(type => {
          data[this.sensorTypes[type]] = Object.values(this.sensors).filter(sensor => sensor[0].type == type).length;
        });
        return data;
      },
      averageTemperature() {
      const temperatures = [];
      const today = this.formatDate(new Date());
      
      Object.values(this.sensors).forEach(sensor => {
        if (sensor[0].type == 1) { // 1 is for Temperature
          sensor.forEach(data => {
            if (this.formatDate(new Date(data.time)) === today) {
              temperatures.push(parseFloat(data.data.split(',')[0]));
            }
          });
        }
      });

      return temperatures.length > 0
        ? (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(2)
        : "No data";
    },
    averageHumidity() {
      const humidities = [];
      const today = this.formatDate(new Date());

      Object.values(this.sensors).forEach(sensor => {
        if (sensor[0].type == 1) { // 1 is for Temperature
          sensor.forEach(data => {
            if (this.formatDate(new Date(data.time)) === today) {
              humidities.push(parseFloat(data.data.split(',')[1]));
            }
          });
        }
      });

      return humidities.length > 0
        ? (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(2)
        : "No data";
    },
    totalPeople() {
      let total = 0;
      const today = this.formatDate(new Date());

      Object.values(this.sensors).forEach(sensor => {
        if (sensor[0].type == 2) { // 2 is for People Counter
          sensor.forEach(data => {
            if (data.time.split("T")[0] === today) {
              total += parseInt(data.data);
            }
          });
        }
      });

      return total;
     }
    }
  }
  </script>

<style scoped>
/* Global Styles */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f7f6;
  color: #333;
}

/* Container */
.container {
  max-width: 1200px;
}

/* Title */
h1.display-4 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
}

/* Cards */
.card {
    background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 0.375rem;
}

.card-text {
  font-size: 1.25rem;
  color: #555; /* Slightly lighter color for the text */
}

.card-header {
  background-color: #e9ecef;
  border-bottom: 1px solid #dee2e6;
  padding: 0.75rem 1.25rem;
  font-weight: bold;
  font-size: 1.25rem;
  color: #ffffff;

}

/* Charts */
column-chart,
pie-chart {
  max-width: 100%;
  height: auto;
}

@media (max-width: 767.98px) {
  .b-col {
    margin-bottom: 1.5rem;
  }

  .card {
    margin-bottom: 1rem;
  }
}

</style>
  