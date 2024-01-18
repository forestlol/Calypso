<template>
  <div class="container mt-5 bg-dark text-white">

  <div class="row mb-4 align-items-center">
    <div class="col-lg-6">
      <select class="form-select bg-secondary text-white" v-model="selectedBuilding">
        <option disabled value="">Select your building</option>
        <option v-for="building in buildings" :key="building.building_name" :value="building.building_name">
          {{ building.building_name }}
        </option>
      </select>
    </div>
    <div class="col-lg-6">
      <h3 v-if="selectedBuilding" class="display-4 text-center">{{selectedBuilding}} Sensors Overview</h3>
      <h3 v-else class="display-4 text-center">Sensors Overview</h3>
    </div>
  </div>

  <div class="row">
    <div class="col-md-6">
      <div class="card-group">
        <div class="card mb-4 text-center bg-secondary">
          <h5 class="card-header">Average Temperature</h5>
          <div class="card-body">
            <p class="card-text display-6">{{ averageTemperature }}°C</p>
          </div>
        </div>

        <div class="card mb-4 text-center bg-secondary">
          <h5 class="card-header">Average Humidity</h5>
          <div class="card-body">
            <p class="card-text display-6">{{ averageHumidity }}%</p>
          </div>
        </div>

        <div class="card mb-4 text-center bg-secondary">
          <h5 class="card-header">Total People</h5>
          <div class="card-body">
            <p class="card-text display-6">{{ totalPeople }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="pie-chart-container">
        <h3 class="chart-title text-center mb-3">Recent Active Sensor Types</h3>
        <pie-chart :data="sensorPieChartData" :options="pieChartOptions"></pie-chart>
      </div>
    </div>
  </div>

  </div>
</template>
  
<script>
  import { Pie } from 'vue-chartjs';
  export default {
    extends: Pie,
    props: ['data', 'options'],
    data() {
      return {
        chartData: null,
        pieChartOptions: {
          responsive: true,
          maintainAspectRatio: false, // Add this to maintain aspect ratio
          legend: {
            labels: {
              fontColor: '#fbffff', // this should match your light color for dark background
            },
            position: 'bottom',
          },
          // Define color of the pie sections
          backgroundColor: ['#3590f3', '#5d91c9', '#004fa3'],
        },
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

.display-6 {
  font-size: 2rem; /* Larger font size for key data */
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #2c323c;
  color: #fbffff;
}

/* Container */
.container {
  max-width: 1200px;
  padding: 20px 40px; /* top and bottom padding of 20px, left and right padding of 40px */
  margin: auto;
}

/* Title */
h1.display-4, h3.display-4 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3590f3;
}

.form-select.bg-secondary {
  border: none;
  border-radius: 8px;
  appearance: none; /* Removes default browser dropdown arrow */
  background-image: url('dropdown-arrow.svg'); /* Custom arrow icon */
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
}

/* Cards */
.card {
  min-width: 80%;
  display: flex; /* Make the card a flex container */
  flex-direction: column; /* Stack children vertically */
  margin-bottom: 20px;
  padding: 1rem;
  background: #333740; /* Slightly lighter to contrast with the dark background */
  color: #fbffff;
  border-radius: 0.5rem;
  border: none; /* Remove borders for a cleaner look */
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.card-header {
  background-color: #3590f3;
  color: #ffffff;
  padding: 0.75rem 1rem;
  font-size: 1.25rem;
  border-radius: 0.5rem 0.5rem 0 0;
  height: 60px; /* Fixed height for all headers */
  display: flex; /* Align the text in the center */
  align-items: center;
  justify-content: center;
}

.card:hover {
  background: #353b45; /* Slightly lighter on hover for interaction */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* Deeper shadow on hover */
}

.card-group {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  justify-items: center;
}

.card-group .card:hover {
  transform: translateY(-5px);
}

.card-body {
  flex: 1; /* Allow the body to fill the rest of the space */
  display: flex; /* Align the text in the center */
  align-items: center;
  justify-content: center;
}

.card-text {
  font-size: 1.25rem;
  /* margin: 0; */
  color: #fbffff;
}

/* Charts */
column-chart,
pie-chart {
  min-width: 100%;
  height: auto;
}

.pie-chart-container {
  padding: 1rem;
  background-color: #333; /* Dark background for the container */
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 2rem;
}

.chart-container h3 {
  margin-bottom: 1rem;
}

.chart-title {
  color: #3590f3; /* Blue color for headings */
}

@media (max-width: 767.98px) {
  .b-col {
    margin-bottom: 1.5rem;
  }

  .card-group
  {
    grid-template-columns: 1fr;
  }
  .card {
    margin-bottom: 1rem;
    max-width: 100%;
  }

  .card-text {
    font-size: 1.25rem;
  }
}

@media (max-width: 991.98px) {
  
  .container {
    padding: 10px; /* Less padding on smaller screens */
  }

  .card-group .card {
    margin-bottom: 1rem;
  }

  .card-group {
    flex-direction: column;
  }
}

</style>
  