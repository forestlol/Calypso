<!-- SensorOverviewCard.vue -->
<template>
    <div class="sensor-overview">
        <div class="sensor-cards-container">
            <!-- Sensor Cards -->
            <div class="sensor-detail-card panic-alert-card" :class="{'bg-danger': isPanicAlert}">
                <h5 class="card-header">Panic Alert</h5>
                <div class="card-body">
                    <p class="card-text">{{ panicMessage }}</p>
                    <router-link v-if="isPanicAlert" to="/sensors" class="btn btn-primary">Check Sensors</router-link>
                </div>
            </div>
            <div class="row">
                <!-- Temperature Card -->
                <div class="col-md-4">
                    <div class="sensor-card temperature-card">
                    <font-awesome-icon :icon="['fas', 'temperature-high']" />
                    <div class="sensor-card-content">
                        <p>{{ averageTemperature }}°C</p>
                        <h5>Average Temperature</h5>
                    </div>
                    </div>
                </div>
                
                <!-- Humidity Card -->
                <div class="col-md-4">
                    <div class="sensor-card humidity-card">
                    <font-awesome-icon :icon="['fas', 'droplet']" />
                    <div class="sensor-card-content">
                        <p>{{ averageHumidity }}%</p>
                        <h5>Average Humidity</h5>
                    </div>
                    </div>
                </div>
        
                <!-- People Card -->
                <div class="col-md-4">
                    <div class="sensor-card people-card">
                    <font-awesome-icon :icon="['fas', 'users']" />
                    <div class="sensor-card-content">
                        <p>{{ totalPeople }}</p>
                        <h5>Total People</h5>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    
        <!-- Sensor Details Section -->
        <div class="sensor-details-container">
            <div class="row">
                <div class="chart-toggle-buttons">
                    <!-- Buttons for toggling charts -->
                    <button v-for="hours in [1, 3, 8, 12, 24]" 
                            :key="`btn-${hours}h`" 
                            :class="{'active': activeChart === hours}" 
                            :disabled="isChartLoading"
                            @click="setActiveChart(hours)">
                        {{ hours }}h
                    </button>
                </div>
                <!-- Panic Alert and Active Sensor Types -->
                <div class="col-lg-6 d-flex flex-column">
                    <div class="chart-container sensor-types-card flex-grow-1">
                        <div class="card-header">
                            <h5>Recent Active Sensor Types</h5>
                            <button class="minimize-button" v-if="!minimizedCards.sensorTypes" @click="minimizeCard('sensorTypes')">-</button>
                            <button class="minimize-button" v-else @click="minimizeCard('sensorTypes')">+</button>
                        </div>
                        <div class="card-body" v-show="!minimizedCards.sensorTypes" >
                            <pie-chart :data="sensorPieChartData" :options="pieChartOptions"></pie-chart>
                        </div>
                    </div>
                </div>

                <!-- Chart Containers -->
                <div class="col-lg-6 d-flex flex-column">
                    <div class="chart-container temperature-chart flex-grow-1">
                        <div class="card-header">
                            <h5>Temperature Charts</h5>
                            <button class="minimize-button" v-if="!minimizedCards.temperature" @click="minimizeCard('temperature')">-</button>
                            <button class="minimize-button" v-else @click="minimizeCard('temperature')">+</button>
                        </div>
                        <div class="card-body" v-show="!minimizedCards.temperature">
                            <canvas id="temperatureChartCanvas"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6 d-flex flex-column">
                    <div class="chart-container humidity-chart flex-grow-1">
                        <div class="card-header">
                            <h5>Humidity Charts</h5>
                            <button class="minimize-button" v-if="!minimizedCards.humidity" @click="minimizeCard('humidity')">-</button>
                            <button class="minimize-button" v-else @click="minimizeCard('humidity')">+</button>
                        </div>
                        <div class="card-body" v-show="!minimizedCards.humidity">
                            <canvas id="humidityChartCanvas"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6 d-flex flex-column">
                    <div class="chart-container people-chart flex-grow-1">
                        <div class="card-header">
                            <h5>People Counter Charts</h5>
                            <button class="minimize-button" v-if="!minimizedCards.people" @click="minimizeCard('people')">-</button>
                            <button class="minimize-button" v-else @click="minimizeCard('people')">+</button>
                        </div>
                        <div class="card-body" v-show="!minimizedCards.people">
                            <canvas id="peopleChartCanvas"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
    import DashboardCard from '../DashboardCard.vue';
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
    import AdvancedOptionsModal from './AdvancedOptionsModal.vue';
    import { Chart, registerables } from 'chart.js';
    Chart.register(...registerables);

    export default {
        components: {
            DashboardCard,
            AdvancedOptionsModal,
            FontAwesomeIcon
        },
        props: ['averageTemperature', 'averageHumidity', 'totalPeople', 'data', 'options'],
        data(){
            return {
                pieChartOptions: {
                    responsive: true,
                    maintainAspectRatio: false,
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
                minimizedCards: {
                    sensorTypes: false,
                    temperature: false,
                    humidity: false,
                    people: false
                },
                intervalTemperatures: {},
                isChartLoading: false,
                processedData: {},
                activeChart: 1,
                charts: {},
                sensors: {},
                sensorTypes: {
                    0: 'Panic',
                    1: 'Temperature',
                    2: 'People Counter'
                },
                panicAlertMessage: '',
                showAdvancedOptions: false,
            }
        },
        async created() {
            await this.fetchSensors();
        },
        mounted() {
            // Fetch and process data
            this.fetchAndProcessSensorData().then(() => {
                const allSensorReadings = Object.values(this.sensors).flat();
                this.intervalTemperatures = this.processSensorDataForIntervals(allSensorReadings);
            });
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
                    if (this.formatDate(new Date(data.time)) === today) {
                        total += parseInt(data.data);
                    }
                    });
                }
                });

                return total;
            },
        },
        methods:{
            async fetchSensors()
            {
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

                    const parsedData = rawData.map(item => {
                    // Convert time string to Date object
                    if (item.time && typeof item.time === 'string') {
                        item.time = new Date(item.time); 
                    }
                    return item;
                    });

                    this.sensors = parsedData.reduce((acc, curr) => {
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
            formatDate(date) {
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based in JavaScript
                const day = String(date.getUTCDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            },
            async fetchAndProcessSensorData() {
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
                const now = new Date();
                const intervals = [1, 3, 8, 12, 24];
                const processedData = {};
                const eightHoursInMilliseconds = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
                const thresholdInMilliseconds = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

                intervals.forEach(interval => {
                    const filteredData = rawData.filter(data => {
                        let sensorTime = new Date(data.time);

                        // Check if the sensor time is ahead of current time by a threshold (e.g., 2 hours)
                        if (sensorTime - now > thresholdInMilliseconds) {
                            sensorTime = new Date(sensorTime.getTime() - eightHoursInMilliseconds);
                        }

                        const elapsedTimeInMinutes = (now - sensorTime) / (1000 * 60);
                        return elapsedTimeInMinutes >= 0 && elapsedTimeInMinutes <= 24 * 60;
                    });
                    processedData[interval] = this.processSensorDataForCharts(filteredData, interval);
                });
                this.processedData = processedData;
                
                this.updateCharts();

                } catch (error) {
                    console.error("Error fetching and processing sensor data:", error);
                }
            },

            processSensorDataForCharts(sensorData, intervalHours = 1) {
                const intervalMinutes = intervalHours === 1 ? 10 : 60;
                const intervalsCount = (intervalHours * 60) / intervalMinutes;

                const now = new Date();
                let processedData = Array.from({ length: intervalsCount }, () => ({
                    temperatureData: [],
                    humidityData: [],
                    peopleCountData: []
                }));
                
                sensorData.forEach(data => {
                    const sensorTime = new Date(data.time);
                    const elapsedTimeInMinutes = (now - sensorTime) / (1000 * 60);

                    if (elapsedTimeInMinutes < 0 || elapsedTimeInMinutes > intervalHours * 60) {
                        return;
                    }
                    const intervalIndex = Math.floor(elapsedTimeInMinutes / intervalMinutes);
                    if(data.type == 1)
                    {
                        if (intervalIndex >= 0 && intervalIndex < intervalsCount) {
                            const temperature = parseFloat(data.data.split(',')[0]);
                            const humidity = parseFloat(data.data.split(',')[1]);
                            if (!isNaN(temperature)) {
                                processedData[intervalIndex].temperatureData.push(temperature);
                            }
                            if (!isNaN(humidity)) {
                                processedData[intervalIndex].humidityData.push(humidity);
                            }
                        } else {
                            console.error(`Invalid intervalIndex: ${intervalIndex} for sensor time: ${sensorTime}`);
                        }
                    }
                    else if(data.type == 2)
                    {
                        if (intervalIndex >= 0 && intervalIndex < intervalsCount) {
                            const peopleCount = parseInt(data.data);
                            if (peopleCount !== null) {
                                processedData[intervalIndex].peopleCountData.push(peopleCount);
                            }
                        } else {
                            console.error(`Invalid intervalIndex: ${intervalIndex} for sensor time: ${sensorTime}`);
                        }   
                    }
                });
                return processedData.map(interval => {
                    return {
                        temperatureAvg: this.calculateAverage(interval.temperatureData),
                        humidityAvg: this.calculateAverage(interval.humidityData),
                        peopleCountTotal: interval.peopleCountData.reduce((total, count) => total + count, 0)
                    };
                });
            },
            processSensorDataForIntervals(sensorData) {

                if (!Array.isArray(sensorData)) {
                    console.error('sensorData is not an array:', sensorData);
                    return;
                }

                // Define the intervals and initialize the structure
                const intervals = [1, 3, 8, 12, 24]; // in hours
                const intervalTemperatures = intervals.reduce((acc, interval) => {
                    acc[interval + 'h'] = [];
                    return acc;
                }, {});

                // Current time
                const now = new Date();

                // Process each sensor reading
                sensorData.forEach(data => {
                    if (data.type === 1) { // Assuming '1' is the type for temperature sensors
                        const readingTime = new Date(data.time);
                        const temperature = parseFloat(data.temperature); // Assuming temperature is a direct property

                        // Determine which intervals this reading belongs to
                        intervals.forEach(interval => {
                            if (now - readingTime <= interval * 3600000) {
                                intervalTemperatures[interval + 'h'].push(temperature);
                            }
                        });
                    }
                });

                return intervalTemperatures;
            },
            setActiveChart(selectedInterval) {
                this.activeChart = selectedInterval;
                this.updateCharts();
            },
            minimizeCard(cardName) {
                this.minimizedCards[cardName] = !this.minimizedCards[cardName];
            },
            calculateAverage(dataArray) {
                if (dataArray.length === 0) return 0;
                const sum = dataArray.reduce((a, b) => a + b, 0);
                return (sum / dataArray.length).toFixed(2);
            },
            updateCharts() {
                const chartInterval = this.activeChart.toString();
                if (this.processedData && this.processedData[chartInterval]) {
                    const intervalData = this.processedData[chartInterval];

                    // Initialize the arrays to store the accumulated data and labels
                    let temperatureDataPoints = [];
                    let humidityDataPoints = [];
                    let peopleCountDataPoints = [];
                    let labels = [];

                    const generateLabels = (interval, count) => {
                        let labelArray = [];
                        if (interval === '1') {
                            // For 1h interval, use 10-minute increments
                            for (let i = 0; i < count; i++) {
                                labelArray.push(`${(i + 1) * 10}min`);
                            }
                        } else {
                            // For other intervals, use 1-hour increments
                            for (let i = 0; i < count; i++) {
                                labelArray.push(`${i + 1}h`);
                            }
                        }
                        return labelArray;
                    };
                    
                    labels = generateLabels(chartInterval, intervalData.length);

                    // Accumulate data points and labels for each data point in the interval
                    intervalData.forEach((dataPoint, index) => {
                        temperatureDataPoints.push(dataPoint.temperatureAvg);
                        humidityDataPoints.push(dataPoint.humidityAvg);
                        peopleCountDataPoints.push(dataPoint.peopleCountTotal);
                    });
                    // Now call createOrUpdateChart with the full array of data points and labels
                    this.createOrUpdateChart('Temperature', temperatureDataPoints, labels);
                    this.createOrUpdateChart('Humidity', humidityDataPoints, labels);
                    this.createOrUpdateChart('People', peopleCountDataPoints, labels);
                } else {
                    console.error(`No processed data available for interval: ${chartInterval}`);
                }
            },

            async createOrUpdateChart(chartType, dataPoints, labels) {
                this.isChartLoading = true;
                if (this.charts[chartType]) {
                    this.charts[chartType].destroy();
                    await this.$nextTick();
                }

                const canvasId = `${chartType.toLowerCase()}ChartCanvas`;
                const canvas = document.getElementById(canvasId);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    // Assuming destroy/create process is synchronous
                    // If not, wrap in a promise or use await on async calls
                    if (this.charts[chartType]) {
                        await this.charts[chartType].destroy(); // Make sure this is awaited if asynchronous
                        }
                        this.charts[chartType] = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                            label: chartType,
                            data: dataPoints,
                            fill: false,
                            borderColor: this.getBorderColorByChartType(chartType),
                            tension: 0.1
                            }]
                        },
                        options: this.lineChartOptions
                    });
                    setTimeout(() => {
                        this.isChartLoading = false;
                    }, 1200); // Adjust time as needed
                } else {
                    console.error(`Canvas element not found for chart type: '${chartType}'`);
                }
            },

            getBorderColorByChartType(chartType) {
                // Define border colors for each chart type
                const colors = {
                    'Temperature': 'rgb(255, 99, 132)',
                    'Humidity': 'rgb(54, 162, 235)',
                    'PeopleCount': 'rgb(75, 192, 192)'
                };
                return colors[chartType] || 'rgb(201, 203, 207)'; // Default color
            },
        },
    };
</script>

<style>
    /* Global card styles */
    .sensor-cards-container .sensor-card,
    .sensor-detail-card, 
    .chart-container {
        border-radius: 15px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        margin: 10px;
        color: white;
    }

    /* Specific gradient backgrounds for sensor cards */
    .temperature-card {
        background: linear-gradient(to right, #ff6e7f, #bfe9ff);
    }
    
    .humidity-card {
        background: linear-gradient(to right, #00c6ff, #0072ff);
    }
    
    .people-card {
        background: linear-gradient(to right, #f7971e, #ffd200);
    }
    
    .panic-alert-card {
        background: #333;
    }

    /* Layout for sensor cards */
    .sensor-card {
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .sensor-card .sensor-card-content {
        font-size: 1.2rem; /* Adjusted font size for the header */
        margin-bottom: 0.5rem;
    }

    .sensor-card .sensor-card-content p {
        font-size: 3rem; /* Size for the large numbers */
        font-weight: bold;
    }

    /* Layout for detail and chart containers */
    .sensor-detail-card, .chart-container {
        flex: 1 1 calc(50% - 20px); /* Set the width and account for margins */
        padding: 20px;
        display: flex;
        flex-direction: column;
    }

    /* Style for the card header where the minimize button will be */
    .sensor-detail-card .card-header, 
    .chart-container .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    /* Add a default background for chart containers if they are not sensor-detail-cards */
    .chart-container {
        background: #333;
    }

    /* Style for the minimize/maximize buttons */
    .minimize-button {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
    }

    /* Style adjustments for minimized cards */
    .minimized-card .card-header {
        /* No change needed here; just ensure it remains visible */
    }

    .minimized-card .card-body {
        /* Hide the card body when minimized */
        display: none;
    }

    .chart-container.minimized-card, 
    .sensor-detail-card.minimized-card {
        /* Adjust the minimized card itself */
        padding-top: 20px; /* Keep padding for the header */
        padding-bottom: 0; /* Remove bottom padding */
        height: 50px; /* Height to accommodate the header */
        overflow: hidden; /* Hide any overflow content */
    }

    /* Button styles for toggling charts */
    .chart-toggle-buttons button {
        padding: 10px;
        margin: 5px;
        border: none;
        background-color: #444; /* Non-active color */
        color: white;
    }

    .chart-toggle-buttons button.active {
        background-color: red; /* Active button color */
    }
</style>

