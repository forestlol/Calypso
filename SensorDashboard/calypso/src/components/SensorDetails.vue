<template>
    <div class="container mt-5">
        <div class="header-row">
            <h2 class="mb-4">{{ sensorName }}</h2>
            <button @click="downloadSensorData" class="btn btn-primary">Download Sensor Data</button>
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
        
        <!-- Chart Display -->
        <div class="sensor-card" v-if="sensorType === 1">
            <h4>Temperature (°C)</h4>
            <area-chart :data="temperatureData" :xtitle="'Hours'" :ytitle="'Temperature (°C)'" :library="chartOptions"></area-chart>

            <h4 class="mt-4">Humidity (%)</h4>
            <area-chart :data="humidityData" :xtitle="'Hours'" :ytitle="'Humidity (%)'" :library="chartOptions"></area-chart>
        </div>

        <div v-else class="sensor-card">
            <h4>Sensor Data</h4>
            <area-chart :data="sensorData" :xtitle="'Hours'" :ytitle="'Value'" :library="chartOptions"></area-chart>
        </div>
    </div>
</template>
  

<script>
  export default {
    data() {
      return {
        temperatureData: {},
        humidityData: {},
        sensorData: {},
        sensorType: null,
        sensorName: this.$route.params.id
      };
    },
    async created() {
        try {
            const today = new Date();
            const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/readings');
            
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }

            let text = await response.text();

            // Replace ObjectId and ISODate formats with valid JSON
            text = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
            text = text.replace(/ISODate\("([^"]+)"\)/g, '"$1"');

            const rawData = JSON.parse(text);

            const todaysData = rawData.filter(data => {
            const date = new Date(data.time);
            return date.getUTCDate() === today.getUTCDate() &&
                    date.getUTCMonth() === today.getUTCMonth() &&
                    date.getUTCFullYear() === today.getUTCFullYear() &&
                    data.deviceName === this.sensorName;
            });

            if (todaysData.length > 0) {
            this.sensorType = todaysData[0].type;

            // If Temperature Sensor, split the data for Temperature and Humidity
            if (this.sensorType === 1) {
                this.temperatureData = this.extractHourlyData(todaysData, 0);
                this.humidityData = this.extractHourlyData(todaysData, 1);
            } else {
                this.sensorData = this.extractHourlyData(todaysData);
            }
            }
        } catch (error) {
            console.error("Error fetching sensor data:", error);
        }
    },
    computed: {
        averageTemperature() 
        {
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
        calculateAverage(data) {
        const sum = Object.values(data).reduce((acc, value) => acc + (value || 0), 0);
        const count = Object.values(data).filter(value => value !== null).length;
        return sum / count;
    },
    extractHourlyData(data, index = null) {
        let hourlyData = {};
        for (let hour = 0; hour <= 24; hour++) {
            const adjustedHour = (hour) % 24;
            const hourData = data.filter(d => new Date(d.time).getUTCHours() === hour);
            let hour12Format = (adjustedHour % 12) || 12; // Convert 24-hour format to 12-hour format
            hour12Format += adjustedHour < 12 ? ' AM' : ' PM';
            if (hourData.length > 0) {
                let value = index !== null ? hourData[0].data.split(',')[index] : hourData[0].data;
                
                // Check if this is temperature data and then round off to 2 decimal places
                if (this.sensorType === 1 && index === 0) {
                    value = parseFloat(value).toFixed(2);
                }
                if (this.sensorType === 2) { // People Counter
                    value = Math.max(...hourData.map(d => parseInt(d.data, 10)));
                } else {
                    value = index !== null ? hourData[0].data.split(',')[index] : hourData[0].data;
                }
                hourlyData[hour12Format] = parseFloat(value);
            } else {
                hourlyData[hour12Format] = null;
                }
            }
            return hourlyData;
        },
        async downloadSensorData() 
        {
            try {
                const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/backup');
                const rawData = await response.json();
                const todaysData = rawData.filter(data => {
                    const date = new Date(data.time);
                    return date.toDateString() === new Date().toDateString() && data.deviceName === this.sensorName;
                });

                if (todaysData.length === 0) {
                    alert('No data available for today');
                    return;
                }

                let csvContent = "data:text/csv;charset=utf-8,";

                // Determine the sensor type and format CSV content accordingly
                switch(this.sensorType) {
                    case 1: // Temperature and Humidity Sensor
                        csvContent += "Time,Temperature,Humidity\n";
                        todaysData.forEach(row => {
                            const date = new Date(row.time);
                            const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                            const [temperature, humidity] = row.data.split(',');
                            csvContent += `${time},${temperature},${humidity}\n`;
                        });
                        break;
                    case 2: // People Counter
                        csvContent += "Time,People Count\n";
                        todaysData.forEach(row => {
                            const date = new Date(row.time);
                            const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                            const peopleCount = row.data;
                            csvContent += `${time},${peopleCount}\n`;
                        });
                        break;
                    case 3: // Panic Button
                        csvContent += "Time\n";
                        todaysData.forEach(row => {
                            if(row.data === "1") {
                                const date = new Date(row.time);
                                const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                                csvContent += `${time}\n`;
                            }
                        });
                        break;
                    default:
                        alert('Sensor type not recognized');
                        return;
                }

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
        }
    }
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

    h2, h4, h5 {
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

    .sensor-card, .average-card {
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
    .average-card, .sensor-card {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
        transition: all 0.3s;
    }

    .average-card:hover, .sensor-card:hover {
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

    h4, h5 {
        color: #34495e;
    }

</style>