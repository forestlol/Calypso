<template>
    <div class="container mt-5">
        <div class="header-row">
            <h2 class="mb-4">{{ sensorName }}</h2>
            <button @click="downloadSensorData" class="btn btn-primary">Download Sensor Data</button>
        </div>

        <div class="date-picker-container">
            <label for="datePicker">Select Date: </label>
            <input 
            type="date" 
            id="datePicker" 
            v-model="selectedDate" 
            @change="fetchDataForSelectedDate" 
            :min="minDate"
            :max="maxDate"
            />
        </div>

        <!-- Loading State -->
        <div v-if="isLoading">
            <p>Loading data...</p>
        </div>

        <!-- Error State -->
        <div v-if="error">
            <p class="error-message">Failed to fetch data. Please try again later.</p>
        </div>

        <!-- Average Values -->
        <div class="row mb-5">
            <!-- Temperature -->
            <div v-if="sensorType === 1" class="col-md-6">
                <div class="average-card">
                    <h5>Average Temperature</h5>
                    <p>{{ averageTemperature.toFixed(2) }} °C</p>
                </div>
            </div>

            <!-- Humidity -->
            <div v-if="sensorType === 1" class="col-md-6">
                <div class="average-card">
                    <h5>Average Humidity</h5>
                    <p>{{ averageHumidity.toFixed(2) }} %</p>
                </div>
            </div>

            <!-- People Sensor or Other Types -->
            <div v-if="sensorType !== 1" class="col-md-6">
                <div class="average-card">
                    <h5>Average Value</h5>
                    <p>{{ averageSensorData.toFixed(2) }}</p>
                </div>
            </div>
        </div>
        <div class="row mb-5">
            <div class="col">
                <div class="average-card">
                    <h5>Sensor Controls</h5>
                    <div class="row" v-if="sensorType === 1">
                        <div class="col">
                            <div>Set Temperature </div>
                            <input type="number" class="form-control " id="temperature" placeholder="°C" @change="setTemperature()">
                            
                        </div>
                        <div class="col">
                            <div>Humidity Toggle</div>
                            <div class="form-check form-switch form-control-lg">
                                <input class="form-check-input" type="checkbox" role="switch" id="humidity_toggle" @change="humidityToggle()">
                                <label class="form-check-label" id="label_humidity_toggle" for="humidity_toggle">Off</label>
                            </div>
                        </div>
                    </div>
                    <div class="row" v-if="sensorType !== 1">
                        <!-- Add controls for other sensor types -->
                        <div class="col">
                            <div>Toggle</div>
                            <div class="form-check form-switch form-control-lg">
                                <input class="form-check-input" type="checkbox" role="switch" id="sensor_toggle" @change="sensorToggle()">
                                <label class="form-check-label" id="label_sensor_toggle" for="sensor_toggle">Off</label>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- Chart Display -->
        <div class="sensor-card" v-if="sensorType === 1">
            <div class="col-12">
                <h4>Temperature (°C)</h4>
                <area-chart :data="temperatureData" :xtitle="'Hours'" :ytitle="'Temperature (°C)'" :library="chartOptions"></area-chart>
            </div>
        </div>

        <div class="sensor-card" v-if="sensorType === 1">
            <div class="col-12">
                <h4>Humidity (%)</h4>
                <area-chart :data="humidityData" :xtitle="'Hours'" :ytitle="'Humidity (%)'" :library="chartOptions"></area-chart>
            </div>
        </div>

        <div v-else class="sensor-card">
            <h4>Sensor Data</h4>
            <area-chart :data="sensorData" :xtitle="'Hours'" :ytitle="'Value'" :library="chartOptions"></area-chart>
        </div>

        <!-- Downtime Chart -->
        <div class="sensor-card">
            <div class="row">
                <div class="col-12">
                    <h4>Downtime Data</h4>
                    <div class="chart-container">
                        <canvas id="downtimeChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <!-- Consumption Charts -->
        <div class="sensor-card">
            <div class="row">
                <div class="col-12">
                    <h4>Water Consumption Data</h4>
                    <div class="chart-container">
                        <canvas id="waterConsumptionChart"></canvas>
                    </div>
                </div>
                <div class="col-12">
                    <h4>Electrical Consumption Data</h4>
                    <div class="chart-container">
                        <canvas id="electricalConsumptionChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
  

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
    data() {
        const today = new Date();
        const apiStartDate = new Date("2023-12-11"); // Assuming API data starts from December 11, 2023
        return {
            selectedDate: today.toISOString().substring(0, 10),
            minDate: apiStartDate.toISOString().substring(0, 10),
            maxDate: today.toISOString().substring(0, 10),
            temperatureData: {},
            humidityData: {},
            sensorData: {},
            sensorType: null,
            sensorName: this.$route.params.id,
            //averageTemperature: 22, // Example average
            //averageHumidity: 45, // Example average
            //averageSensorData: 50, // Example average for non-temperature/humidity sensors
            waterConsumptionData: [], // Placeholder for water consumption data
            electricalConsumptionData: [], // Placeholder for electrical consumption data
            
        };
    },
    mounted() {
        this.initWaterConsumptionChart();
        this.initElectricalConsumptionChart();
        this.initDownTimeChart(); // sensorType is initialised in fetchDataForSelectedDate() which is called after initDownTimeChart()
    },
    async created() {
        this.fetchDataForSelectedDate();
    },
    computed: {
        averageTemperature() {
            return this.calculateAverage(this.temperatureData);
        },
        averageHumidity() {
            return this.calculateAverage(this.humidityData);
        },
        averageSensorData() {
            return this.calculateAverage(this.sensorData);
        }
    },
    methods: {
        async fetchDataForSelectedDate() {
            try {
                const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/readings/byDevice/' + this.sensorName);
                if (!response.ok) throw new Error('Network response was not ok.');

                let text = await response.text();

                // Replace ObjectId and ISODate formats with valid JSON
                text = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
                text = text.replace(/ISODate\("([^"]+)"\)/g, '"$1"');

                let rawData;
                try {
                    rawData = JSON.parse(text);
                } catch (e) {
                    throw new Error('Error parsing JSON data');
                }

                if (!this.selectedDate || !this.sensorName) {
                    throw new Error('Selected date or sensor name is not defined');
                }

                const selectedData = rawData.filter(data => {
                    const dataDate = new Date(data.time).toISOString().substring(0, 10);
                    return dataDate === this.selectedDate;
                });

                // Reset the data
                this.temperatureData = {};
                this.humidityData = {};
                this.sensorData = {};

                if (selectedData.length > 0) {
                    this.sensorType = selectedData[0].type;

                    // Split the data for Temperature and Humidity if applicable
                    if (this.sensorType === 1) {
                        this.temperatureData = this.extractHourlyData(selectedData, 0);
                        this.humidityData = this.extractHourlyData(selectedData, 1);
                    } else {
                        this.sensorData = this.extractHourlyData(selectedData);
                    }
                }
            } catch (error) {
                console.error("Error fetching sensor data:", error);
            }
        },
        calculateAverage(data) {
            const values = Object.values(data)
                .map(value => parseFloat(value))
                .filter(value => !isNaN(value) && value !== 0);
            const sum = values.reduce((acc, value) => acc + value, 0);
            const count = values.length;
            return count > 0 ? sum / count : 0;
        },
        extractHourlyData(data, index = null) {
            let hourlyData = {};
            for (let hour = 0; hour < 24; hour++) {
                const hourData = data.filter(d => new Date(d.time).getUTCHours() === hour);
                let hour12Format = (hour % 12) || 12; // Convert 24-hour format to 12-hour format
                hour12Format += hour < 12 ? ' AM' : ' PM';

                if (hourData.length > 0) {
                    let value = index !== null ? hourData[0].data.split(',')[index] : hourData[0].data;

                    if (this.sensorType === 1 && index === 0) {
                        // Temperature data, round off to 2 decimal places
                        value = parseFloat(value).toFixed(2);
                    } else if (this.sensorType === 2) {
                        // People Counter
                        value = Math.max(...hourData.map(d => parseInt(d.data, 10)));
                        console.log(value);
                    } else {
                        // Other sensor data
                        value = parseFloat(value);
                    }

                    hourlyData[hour12Format] = value;
                } else {
                    hourlyData[hour12Format] = null;
                }
            }
            return hourlyData;
        },
        async downloadSensorData() {
            try {
                const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/readings/byDevice/' + this.sensorName);
                if (!response.ok) throw new Error('Network response was not ok.');

                let text = await response.text();

                // Replace ObjectId and ISODate formats with valid JSON
                text = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
                text = text.replace(/ISODate\("([^"]+)"\)/g, '"$1"');

                const rawData = JSON.parse(text);

                const todaysData = rawData.filter(data => {
                    const date = new Date(data.time);

                    return date.toDateString() === new Date().toDateString();
                });

                if (todaysData.length === 0) {
                    alert('No data available for today');
                    return;
                }

                let csvContent = "data:text/csv;charset=utf-8,";

                // Determine the sensor type and format CSV content accordingly
                // ... [rest of your switch case logic] ...

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "sensor_data.csv");
                document.body.appendChild(link);

                link.click();
                document.body.removeChild(link);

            } catch (error) {
                console.error("Error downloading sensor data:", error);
            }
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
        sensorDowntimeData(){
            // static fake data for 24 hours
            // returns ([panicAlert], [temperature], [peopleCounter]) 
            return [0,0,5,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            
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
        initDownTimeChart(){
            const ctxSensorMonitor = document.getElementById('downtimeChart').getContext('2d');
            new Chart(ctxSensorMonitor, {
                type: 'line',
                data: {
                labels: this.generateLast24HoursLabels(),
                datasets: [{
                    label: 'Down Time',
                    data: this.sensorDowntimeData(), // Use static fake data
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
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
        generateLast24HoursLabels() {
            return [...Array(24).keys()].map(hour => `${hour}:00`);
        },
        humidityToggle(){
            const humidityToggle = document.getElementById('humidity_toggle');
            const labelHumidityToggle = document.getElementById('label_humidity_toggle');
            if (humidityToggle.checked) {
                labelHumidityToggle.textContent = 'On';
            } else {
                labelHumidityToggle.textContent = 'Off';
            }
        },
        setTemperature(){
            const temperature = document.getElementById('temperature');
            // connect to sensor and set temperature
        },
        sensorToggle(){
            const sensorToggle = document.getElementById('sensor_toggle');
            const labelSensorToggle = document.getElementById('label_sensor_toggle');
            if (sensorToggle.checked) {
                labelSensorToggle.textContent = 'On';
            } else {
                labelSensorToggle.textContent = 'Off';
            }
        }
    },
};
</script>
  
<style scoped>
/* Typography */
body {
    font-family: 'Nunito', sans-serif;
    font-size: 16px;
    color: #333;
    background-color: #f7f9fc;
}

h2,
h4,
h5 {
    font-weight: 600;
    margin-bottom: 20px;
}

h5 {
    font-size: 1.1rem;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

h2.mb-4 {
    margin-bottom: 0;
}

/* Containers and Spacing */
.container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 30px 15px;
}

.sensor-card,
.average-card {
    padding: 20px;
    margin-bottom: 30px;
}

.row {
    margin-left: -15px;
    margin-right: -15px;
}

.col-md-6 {
    padding-left: 15px;
    padding-right: 15px;
    margin-bottom: 20px;
}

/* Cards and Shadows */
.average-card,
.sensor-card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
}

.average-card:hover,
.sensor-card:hover {
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-5px);
}

/* Loading and Error State */
.error-message {
    color: #e74c3c;
    background-color: #fee;
    padding: 15px;
    border-radius: 5px;
}

.btn {
    padding: 10px 15px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary {
    background-color: #3498db;
    color: white;
}

.btn-primary:hover {
    background-color: #2980b9;
}

/* Additional Color Scheme */
h2 {
    color: #2c3e50;
}

h4,
h5 {
    color: #34495e;
}

p{
    color: #34495e;
}

.chart-container {
    width: 100%;
    /* Full width of its container */
    height: auto;
    /* Adjust height as necessary */
    padding: 15px;
    /* Add some padding if needed */
}

canvas {
    width: 100% !important;
    height: auto !important;
    max-height: 400px;
    /* Or any other height */
}

.date-picker-container {
  margin-bottom: 20px;
}

.date-picker-container label {
  margin-right: 10px;
  font-weight: bold;
  color: rgb(150,150,150);
}

.date-picker-container input[type="date"] {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

/* Custom styles for the checkbox toggle */
/* .form-check-input[type="checkbox"] {
    
    width: 50px;
    height: 30px;
} */



</style>