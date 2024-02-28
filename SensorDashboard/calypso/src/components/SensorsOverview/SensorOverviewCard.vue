<!-- eslint-disable vue/no-dupe-keys -->
<!-- SensorOverviewCard.vue -->
<template>
    <div class="sensor-overview">
        <div class="sensor-cards-container">
            <!-- Sensor Cards -->
            <div class="sensor-detail-card panic-alert-card" :class="{ 'bg-danger': isPanicAlert }">
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
                        <div class="icon-container">
                            <font-awesome-icon :icon="['fas', 'temperature-high']" size="3x" />
                        </div>
                        <div class="sensor-card-content">
                            <p>{{ averageTemperature }}°C</p>
                            <h5>Average Temperature</h5>
                        </div>
                    </div>
                </div>

                <!-- Humidity Card -->
                <div class="col-md-4">
                    <div class="sensor-card humidity-card">
                        <div class="icon-container">
                            <font-awesome-icon :icon="['fas', 'droplet']" size="3x" />
                        </div>
                        <div class="sensor-card-content">
                            <p>{{ averageHumidity }}%</p>
                            <h5>Average Humidity</h5>
                        </div>
                    </div>
                </div>

                <!-- People Card -->
                <div class="col-md-4">
                    <div class="sensor-card people-card">
                        <div class="icon-container">
                            <font-awesome-icon :icon="['fas', 'users']" size="3x" />
                        </div>
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
            <div class="chart-toggle-buttons">
                <!-- Buttons for toggling charts -->
                <button v-for="hours in [1, 3, 8, 12, 24]" :key="`btn-${hours}h`"
                    :class="{ 'active': activeChart === hours }" :disabled="isChartLoading" @click="setActiveChart(hours)">
                    {{ hours }}h
                </button>
            </div>
            <draggable class="row" @end="onEnd" :list="cards" item-key="name">
                <template #item="{ element }">
                    <div class="col-12 col-lg-6 d-flex flex-column">
                        <div
                            :class="['chart-container', element.type + '-chart', minimizedCards[element.name] ? 'minimized-card' : '']">
                            <div class="card-header">
                                <h5>{{ formatChartName(element.name) }} Charts</h5>
                                <button class="minimize-button" @click="minimizeCard(element.name)">
                                    {{ minimizedCards[element.name] ? '+' : '-' }}
                                </button>
                            </div>
                            <div class="card-body" v-show="!minimizedCards[element.name]">
                                <pie-chart v-if="element.type === 'pie-chart'" :data="sensorPieChartData"
                                    :options="pieChartOptions" />
                                <canvas v-else-if="element.type === 'line-chart'"
                                    :id="`${element.name}ChartCanvas`"></canvas>
                            </div>
                        </div>
                    </div>
                </template>
            </draggable>
        </div>
    </div>
</template>
  
<script>
import DashboardCard from '../DashboardCard.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import draggable from 'vuedraggable';
import { Chart, registerables } from 'chart.js';
import * as CacheManager from '@/CacheManager.js';

Chart.register(...registerables);

export default {
    components: {
        draggable,
        DashboardCard,
        FontAwesomeIcon
    },
    props: ['averageTemperature', 'averageHumidity', 'totalPeople', 'data', 'options'],
    data() {
        return {
            pieChartOptions: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: "white",
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontColor: "white",
                        }
                    }]
                },
                legend: {
                    labels: {
                        fontColor: '#fbffff',
                    },
                    position: 'bottom',
                },
                backgroundColor: ['#e67e22', '#1abc9c', '#4682B4'],
            },
            lineChartOptions: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: [{
                        beginAtZero: true,
                        ticks: {
                            fontColor: "white",
                        }
                    }],
                    x: [{
                        ticks: {
                            fontColor: "white",
                        }
                    }]
                },
                legend: {
                    labels: {
                        fontColor: '#fbffff', // this should match your light color for dark background
                    },
                    position: 'bottom',
                },
                aspectRatio: 3,
            },
            cards: [
                { name: 'sensorTypes', type: 'pie-chart', minimized: false },
                { name: 'temperature', type: 'line-chart', minimized: false },
                { name: 'humidity', type: 'line-chart', minimized: false },
                { name: 'people', type: 'line-chart', minimized: false }
            ],
            minimizedCards: {
                sensorTypes: false,
                temperature: false,
                humidity: false,
                people: false
            },
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
        }
    },
    async created() {
        if (CacheManager.getItem('sensors') != null) {
            this.sensors == CacheManager.getItem('sensors');
            await this.fetchSensors();
            CacheManager.setItem('sensors', this.sensors);
        } else {
            await this.fetchSensors();
            CacheManager.setItem('sensors', this.sensors);
        }
    },
    mounted() {
        this.fetchAndProcessSensorData();
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
                if (sensor[0].type == 1) { // 1 is for Temperature & Humidity
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
                if (sensor[0].type == 1) { // 1 is for Temperature & Humidity
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
    methods: {
        async fetchSensors() {
            try {
                const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/latest/readings');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                let text = await response.text();

                text = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
                text = text.replace(/ISODate\("([^"]+)"\)/g, '"$1"');

                const rawData = JSON.parse(text);

                const parsedData = rawData.map(item => {
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
                if (data.type == 1) {
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
                else if (data.type == 2) {
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
        setActiveChart(selectedInterval) {
            this.activeChart = selectedInterval;
            this.updateCharts();
        },
        minimizeCard(cardName) {
            this.minimizedCards[cardName] = !this.minimizedCards[cardName];
        },
        formatChartName(name) {
            return name
                .split(/(?=[A-Z])/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
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

                let temperatureDataPoints = [];
                let humidityDataPoints = [];
                let peopleCountDataPoints = [];
                let labels = [];

                const generateLabels = (interval, count) => {
                    let labelArray = [];
                    if (interval === '1') {
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

                intervalData.forEach((dataPoint) => {
                    temperatureDataPoints.push(dataPoint.temperatureAvg);
                    humidityDataPoints.push(dataPoint.humidityAvg);
                    peopleCountDataPoints.push(dataPoint.peopleCountTotal);
                });
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

            this.$nextTick(async () => {
                const canvasId = `${chartType.toLowerCase()}ChartCanvas`;
                const canvas = document.getElementById(canvasId);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (this.charts[chartType]) {
                        await this.charts[chartType].destroy();
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
                    }, 1200);
                } else {
                    console.error(`Canvas element not found for chart type: '${chartType}'`);
                }
            });
        },

        getBorderColorByChartType(chartType) {
            const colors = {
                'Temperature': '#e67e22',
                'Humidity': '#1abc9c',
                'People': '#4682B4'
            };
            return colors[chartType] || 'rgb(201, 203, 207)'; // Default color
        },
        onEnd(event) { // This is what we want to implement when the cards are dragged, maybe save it in database?
        },
    },
};
</script>

<style>
:root {
    --dark-bg: #333;
    --light-text: #ffffff;
    --shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    --radius: 15px;
    --color-temperature: #e67e22;
    --color-humidity: #1abc9c;
    --color-people: #4682B4;
}

.sensor-cards-container .sensor-card,
.sensor-detail-card,
.chart-container {
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    margin: 10px;
    color: var(--light-text);
}

.temperature-card {
    background: linear-gradient(to right, #f9d08b, var(--color-temperature));
}

.humidity-card {
    background: linear-gradient(to right, #66d1ca, var(--color-humidity));
}

.people-card {
    background: linear-gradient(to right, #6e9ecf, var(--color-people));
}


.panic-alert-card {
    background: var(--dark-bg);
}

.sensor-card {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.sensor-card-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    text-align: left;
}

.sensor-card .sensor-card-content h5 {
    margin: 0;
    padding: 0 10px;
}

.sensor-card .sensor-card-content p {
    margin: 0;
    padding: 0 10px;
}

.sensor-card .icon-container {
    width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.sensor-card .sensor-card-content {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
}

.sensor-card .sensor-card-content p {
    font-size: 2.5rem;
    font-weight: bold;
}

.sensor-detail-card,
.chart-container {
    flex: 1 1 calc(50% - 20px);
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.card-header {
    margin: 0;
}

.sensor-detail-card .card-header,
.chart-container .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.icon-container {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.chart-container {
    background: var(--dark-bg);
}

.minimize-button {
    background-color: #ffffff;
    color: var(--dark-bg);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    margin-right: 8px;
    transition: background-color 0.3s;
}

.minimize-button:hover {
    background-color: #f0f0f0;
    /* Slightly different background on hover */
}

/* Additional style to increase visibility when the button is on a dark background */
.chart-container .minimize-button,
.sensor-detail-card .minimize-button {
    color: #ffffff;
    /* White symbol for dark backgrounds */
    background-color: rgba(255, 255, 255, 0.2);
    /* Semi-transparent background */
}

.chart-container .minimize-button:hover,
.sensor-detail-card .minimize-button:hover {
    background-color: rgba(255, 255, 255, 0.3);
}

.minimized-card {
    flex: 0 0 auto;
    /* Do not grow, do not shrink, based on the content size */
}


.chart-container.minimized-card,
.sensor-detail-card.minimized-card {
    padding-top: 20px;
    padding-bottom: 20px;
    height: auto;
    overflow: hidden;
}

.chart-toggle-buttons {
    display: flex;
    justify-content: center;
    padding: 10px 0;
    flex-wrap: wrap;
}

.chart-toggle-buttons button {
    padding: 10px 50px;
    margin: 10px;
    border: none;
    background-color: #444;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.chart-toggle-buttons button:hover {
    background-color: #555;
}

.chart-toggle-buttons button.active {
    background-color: red;
}

@media (max-width: 768px) {
    .sensor-card {
        flex-direction: column;
    }

    .icon-container {
        width: auto;
        margin-bottom: 10px;
    }

    .sensor-card-content {
        align-items: center;
        text-align: center;
    }

    .col-lg-6 {
        /* This will make the element take 100% of the container's width */
        flex: 0 0 100%;
        max-width: 100%;
    }
}
</style>