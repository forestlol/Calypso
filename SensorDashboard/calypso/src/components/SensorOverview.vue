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
        <h3 v-if="selectedBuilding" class="display-4 text-center">{{selectedBuilding}} <br> Overview</h3>
        <h3 v-else class="display-4 text-center">Overview</h3>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <dashboard-card title="Sensors Overview" :icon="['fas', 'satellite-dish']">
          <div class="row mt-4">
            <div class="col-md-3">
              <div class="card-group">
                <h5 class="mb-3 text-center">Sensors Overview</h5>
                <div class="card mb-4 text-center bg-secondary">
                  <h5 class="card-header">Average Temperature</h5>
                  <div class="card-body">
                    <font-awesome-icon :icon="['fas', 'temperature-high']" />
                    <p class="card-text display-6">{{ averageTemperature }}°C</p>
                  </div>
                </div>

                <div class="card mb-4 text-center bg-secondary">
                  <h5 class="card-header">Average Humidity</h5>
                  <div class="card-body">
                    <font-awesome-icon :icon="['fas', 'droplet']" />
                    <p class="card-text display-6">{{ averageHumidity }}%</p>
                  </div>
                </div>

                <div class="card mb-4 text-center bg-secondary">
                  <h5 class="card-header">Total People</h5>
                  <div class="card-body">
                    <font-awesome-icon :icon="['fas', 'users']" />
                    <p class="card-text display-6">{{ totalPeople }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-9">
              <div class="row">
                <div class="col-lg-6 col-md-12">
                  <div class="col-lg-12 col-md-12">
                    <div class="card text-center mb-4" :class="{'bg-danger': isPanicAlert, 'bg-secondary': !isPanicAlert}">
                      <div class="card-header">
                        Panic Alert
                      </div>
                      <div class="card-body">
                        <p class="card-text display-6">
                          {{ panicMessage }}
                        </p>
                        <!-- Only show the button if there is a panic alert -->
                        <router-link v-if="isPanicAlert" to="/sensors" class="btn btn-primary">
                          Check Sensors
                        </router-link>
                      </div>
                    </div>
                  </div>
                  <div class="pie-chart-container">
                    <h3 class="chart-title text-center mb-3">Recent Active Sensor Types</h3>
                    <pie-chart :data="sensorPieChartData" :options="pieChartOptions"></pie-chart>
                  </div>
                </div>
                <div class="col-lg-6 col-md-6">
                  <div class="line-charts-column">
                    <h5 class="mb-3 text-center">Temperature Charts</h5>
                    <div v-for="hours in [1, 3, 8, 12, 24]" :key="`line-chart-container-${hours}h`">
                      <div class="line-chart-container">
                        <canvas :id="`canvas${hours}h`"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </dashboard-card>
      </div>  
      <div class="col-lg-4">
        <dashboard-card title="Electrical & Water Consumption" :icon="['fas', 'house-user']">
        <canvas :id="`waterConsumptionChart-${_uid}`"></canvas>
        <canvas :id="`electricalConsumptionChart-${_uid}`"></canvas>
      </dashboard-card>
      </div>
    </div>
  </div>
</template>
  
<script>
  import DashboardCard from './DashboardCard.vue';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import { Chart, registerables } from 'chart.js';
  Chart.register(...registerables);

  export default {
    components: {
      DashboardCard,
      FontAwesomeIcon
    },
    props: ['data', 'options'],
    data() {
      return {
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
        lineChartOptions: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 3,
        },
        barChartOptions: {
          responsive: true,
          maintainAspectRatio: true,
        },
        waterChart: null,
        electricalChart: null,
        buildings: [],
        panicAlertMessage: '',
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
    mounted() {
      this.$nextTick(() => {
        [1, 3, 8, 12, 24].forEach(hours => {
          this.createLineChart(hours);
        });
        this.createWaterConsumptionChart();
        this.createElectricalConsumptionChart();
      });
    },
    beforeDestroy() {
      if (this.waterChart) {
        this.waterChart.destroy();
      }
      if (this.electricalChart) {
        this.electricalChart.destroy();
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
      },
      createLineChart(hours) {
        this.$nextTick(() => {
          const canvasId = `canvas${hours}h`;
          const canvasElement = document.getElementById(canvasId);

          if (canvasElement && canvasElement.getContext) {
            const ctx = canvasElement.getContext('2d');
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: [...Array(hours).keys()].map(num => `${num}h`),
                datasets: [{
                  label: `${hours} Hour Temperature`,
                  data: [...Array(hours)].map(() => Math.random() * (30 - 20) + 20),
                  fill: false,
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1
                }]
              },
              options: this.lineChartOptions
            });
          }
          else {
            console.error(`Canvas or getContext not available for '${canvasId}'`);
          }
        });
      },
      getWaterChartId() {
        return this.waterChartId + this._uid; // _uid is a unique identifier for each Vue component instance
      },
      getElectricalChartId() {
        return this.electricalChartId + this._uid;
      },
      createWaterConsumptionChart() {
        const waterCanvasId = `waterConsumptionChart-${this._uid}`;
        const waterCanvas = document.getElementById(waterCanvasId);
        
        if(waterCanvas){
          const ctx = waterCanvas.getContext('2d');
          this.waterChart = new Chart(ctx, {
            type: 'bar',
              data: {
                labels: this.generateLast24HoursLabels(),
                datasets: [{
                  label: 'Water Consumption (Liters)',
                  data: this.generateRandomData(24, 100, 500),
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1
                }]
              },
            options: this.barChartOptions
          });
        }
        else{
          console.error('Water consumption canvas element not found');
        }
      },

      createElectricalConsumptionChart() {
        const electricalCanvasId = `electricalConsumptionChart-${this._uid}`;
        const electricalCanvas = document.getElementById(electricalCanvasId);
        if (electricalCanvas) {
          const ctx = electricalCanvas.getContext('2d');
          this.electricalChart = new Chart(ctx, {
            type: 'bar',
              data: {
                labels: this.generateLast24HoursLabels(),
                datasets: [{
                  label: 'Electrical Consumption (kWh)',
                  data: this.generateRandomData(24, 200, 1500),
                  backgroundColor: 'rgba(255, 206, 86, 0.2)',
                  borderColor: 'rgba(255, 206, 86, 1)',
                  borderWidth: 1
                }]
              },
            options: this.barChartOptions
          });
        }
        else{
          console.error('Electrical consumption canvas element not found');
        }
      },

      // Helper methods
      generateLast24HoursLabels() {
        let labels = [];
          let currentHour = new Date().getHours();

          for (let i = 0; i < 24; i++) {
            // Format the hour in 12-hour format and add AM/PM
            let hour = (currentHour - i + 24) % 24; // adjust for negative hours
            let suffix = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12;
            hour = hour ? hour : 12; // the hour '0' should be '12'
            labels.unshift(`${hour} ${suffix}`); // unshift to add to the front
          }

          return labels;
      },

      generateRandomData(count, min, max) {
        return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
      },
    },
    computed: {
      isPanicAlert() {
        const sensors = {};
        Object.keys(this.sensorTypes).forEach(type => {
          sensors[this.sensorTypes[type]] = Object.values(this.sensors).filter(sensor => sensor[0].type == type).length;
        });
        return sensors['Panic'] > 0;
      },
      panicMessage() {
        return this.isPanicAlert ? 'Panic detected!' : 'No emergency detected.';
      },
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
      },
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
  max-width: 1600px;
  padding: 20px 40px; /* top and bottom padding of 20px, left and right padding of 40px */
  margin: auto;
}

/* Title */
h1.display-4, h3.display-4 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3590f3 !important;
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
  min-width: 100%;
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
  flex-direction: column;
}

.card-text {
  font-size: 1.25rem;
  /* margin: 0; */
  color: #fbffff;
}

.card-header, .card-text, h1.display-4, h3.display-4 {
  font-family: 'Roboto', sans-serif; /* Apply the font only to these classes and elements */
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  /* Additional responsive and layout styling as needed */
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

.line-chart-container {
  width: 100%;
  height: auto; 
}

.bg-danger {
  background-color: #dc3545; /* Bootstrap's default danger color */
  color: white; /* Text color for better contrast */
}

.chart-container h3 {
  margin-bottom: 1rem;
}

.chart-title {
  color: #3590f3; /* Blue color for headings */
}

#waterConsumptionChart, #electricalConsumptionChart {
  max-width: 400px;
  height: auto;
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
  
  .dashboard-cards {
    grid-template-columns: 1fr; /* Stack cards vertically */
  }
  
  .container {
    padding: 10px; /* Less padding on smaller screens */
  }

  .card
  {
    max-width: 100%;
  }
  .card-group .card {
    margin-bottom: 1rem;
  }

  .card-group {
    flex-direction: column;
  }

  .line-chart-container {
    flex-direction: column;
  }
}

@media (max-width: 1200px) {
  .dashboard-cards {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

</style>
  