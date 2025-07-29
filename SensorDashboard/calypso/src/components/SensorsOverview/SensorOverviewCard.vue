<template>
    <div class="sensor-overview">
        <!-- Top Row: Environment Summary + Panic Alert -->
        <div class="card-row">
            <!-- Environment Summary Card -->
            <div class="stats-summary-card">
                <div class="summary-header">
                    <font-awesome-icon :icon="['fas', 'chart-line']" class="summary-icon" />
                    <div>
                        <h3>Environment Summary</h3>
                        <span class="subtitle">Live Averages &amp; Current People Count</span>
                    </div>
                </div>
                <div class="summary-content">
                    <div class="summary-row">
                        <font-awesome-icon :icon="['fas', 'temperature-high']" class="item-icon temperature" />
                        <span>
                            Temperature:
                            <b>{{ averageTemperature }}</b><span class="unit">°C</span>
                        </span>
                    </div>
                    <div class="summary-row">
                        <font-awesome-icon :icon="['fas', 'droplet']" class="item-icon humidity" />
                        <span>
                            Humidity:
                            <b>{{ averageHumidity }}</b><span class="unit">%</span>
                        </span>
                    </div>
                    <div class="summary-row">
                        <font-awesome-icon :icon="['fas', 'users']" class="item-icon people" />
                        <span>
                            People Detected:
                            <b>{{ totalPeople }}</b>
                        </span>
                    </div>
                </div>
            </div>
            <!-- Panic Alert Card -->
            <div class="panic-alert-card" :class="{ 'bg-danger': isPanicAlert }">
                <div class="panic-content">
                    <span class="panic-title">
                        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="panic-icon" />
                        Panic Alert
                    </span>
                    <span class="panic-message">{{ panicMessage }}</span>
                    <router-link v-if="isPanicAlert" to="/sensors" class="btn btn-sm btn-outline-light ms-auto">Check
                        Sensors</router-link>
                </div>
            </div>
        </div>
        <!-- Charts Section -->
        <div class="sensor-details-container">
            <div class="chart-toggle-buttons">
                <button v-for="hours in [1, 3, 8, 12, 24]" :key="`btn-${hours}h`"
                    :class="{ active: activeChart === hours }" :disabled="isChartLoading"
                    @click="setActiveChart(hours)">
                    {{ hours }}h
                </button>
            </div>
            <div class="charts-grid">
                <draggable v-model="cards" group="charts" @end="onEnd" item-key="name" tag="div">
                    <template #item="{ element }">
                        <div class="chart-card" :class="{ minimized: minimizedCards[element.name] }">
                            <div class="chart-header">
                                <span>{{ formatChartName(element.name) }} Charts</span>
                                <button class="minimize-button" @click="minimizeCard(element.name)">
                                    <font-awesome-icon
                                        :icon="['fas', minimizedCards[element.name] ? 'plus' : 'minus']" />
                                </button>
                            </div>
                            <div class="chart-body" v-show="!minimizedCards[element.name]">
                                <pie-chart v-if="element.name === 'sensorTypes'" :data="sensorPieChartData"
                                    :options="pieChartOptions" />
                                <canvas v-else :id="element.name + 'ChartCanvas'"></canvas>
                            </div>
                        </div>
                    </template>
                </draggable>
            </div>

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

<style scoped>
:root {
    --color-temperature: #f7b267;
    --color-humidity: #70b8ff;
    --color-people: #6fcf97;
    --color-panic: #ff5151;
    --card-radius: 15px;
    --shadow: 0 3px 12px 0 rgba(0, 0, 0, 0.10);
    --card-bg: #fff;
    --card-border: #f0f1f5;
    --header-bg: #fafbfc;
}

.sensor-overview {
    padding: 30px 15px 0 15px;
}


.card-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 32px;
    align-items: stretch;
}

.stats-summary-card,
.panic-alert-card {
    width: 100%;
    max-width: none;
    /* Remove previous max-width */
    min-width: 0;
    box-sizing: border-box;
    margin: 0;
}

.stats-summary-card,
.panic-alert-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}

.stats-summary-card {
    background: linear-gradient(135deg, #1e293b, #304a75);
    color: white;
    border-radius: 14px;
    box-shadow: 0 3px 16px 0 rgba(60, 60, 80, 0.10);
    padding: 32px 30px 24px 30px;
    min-width: 100%;
    max-width: 420px;
    margin: 0 auto 22px auto;
    border: 1px solid #e5e8ef;
}

.stats-summary-card .summary-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 18px;
}

.stats-summary-card .summary-icon {
    font-size: 2rem;
    opacity: 0.7;
    margin-top: 3px;
}

.stats-summary-card h3 {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 2px 0;
}

.stats-summary-card .subtitle {
    font-size: 1rem;
    color: #818ca9;
}

.stats-summary-card .summary-content {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.stats-summary-card .summary-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.08rem;
    margin-bottom: 3px;
}

.stats-summary-card .item-icon {
    font-size: 1.15rem;
    opacity: 0.7;
}

.stats-summary-card .item-icon.temperature {
    color: #e58e26;
}

.stats-summary-card .item-icon.humidity {
    color: #368b8b;
}

.stats-summary-card .item-icon.people {
    color: #3a436e;
}

.stats-summary-card .summary-row b {
    font-size: 1.12rem;
    margin-left: 2px;
}

.stats-summary-card .unit {
    font-size: 1.04rem;
    font-weight: 400;
    margin-left: 2px;
    color: #6076a9;
}

.panic-alert-card {
    background: linear-gradient(135deg, #1e293b, #304a75);
    color: white;
    border-radius: 14px;
    box-shadow: 0 3px 16px 0 rgba(60, 60, 80, 0.10);
    padding: 32px 30px 24px 30px;
    min-width: 100%;
    max-width: 420px;
    margin: 0 0 22px 0;
    border: 1px solid #e5e8ef;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.panic-alert-card.bg-danger {
    background: linear-gradient(90deg, #e74c3c 60%, #ffb1b1 100%);
    color: #fff;
    border: none;
}

.panic-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.panic-title {
    font-weight: 700;
    font-size: 1.08rem;
    display: flex;
    align-items: center;
    gap: 7px;
}

.panic-icon {
    color: #e74c3c;
    font-size: 1.25rem;
    margin-right: 7px;
}

.bg-danger .panic-icon {
    color: #fff;
}

.panic-message {
    font-size: 1rem;
    margin-left: 8px;
}

.panic-alert-card .btn-outline-light {
    margin-left: auto;
    border-radius: 6px;
    padding: 5px 18px;
    border: 1px solid #fff;
    color: #fff;
    background: transparent;
    font-weight: 600;
    font-size: 0.99rem;
    transition: background 0.2s, color 0.2s;
}

.panic-alert-card .btn-outline-light:hover {
    background: #fff;
    color: #e74c3c;
}

/* Charts Section Grid */
.sensor-details-container {
    background: var(--header-bg);
    border-radius: var(--card-radius);
    box-shadow: var(--shadow);
    margin-top: 28px;
    padding: 18px 18px 20px 18px;
    border: 1.5px solid #ebecf0;
}

.chart-toggle-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.chart-toggle-buttons button {
    padding: 7px 27px;
    border-radius: 7px;
    border: none;
    background: #f3f6fa;
    color: #3466ad;
    font-size: 1.03rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s, color 0.18s;
}

.chart-toggle-buttons button:hover,
.chart-toggle-buttons button.active {
    background: #3466ad;
    color: #fff;
}

/* 2x2 Responsive Grid for Charts */
.charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 18px;
    /* Fix: make sure the grid fills height */
    min-height: 650px;
    /* Adjust as needed */
}

.charts-grid>div {
    display: contents;
    /* THIS is the magic! */
}

.chart-card {
    background: #fff;
    border-radius: var(--card-radius);
    box-shadow: var(--shadow);
    border: 1px solid #e2e4ed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: box-shadow 0.15s;
    min-width: 0;
    min-height: 0;
}

.chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f7f9fb;
    padding: 10px 16px 8px 16px;
    border-bottom: 1px solid #e9eaf2;
}

.chart-header span {
    font-size: 1.08rem;
    font-weight: 600;
    color: #444b66;
}

.minimize-button {
    background: transparent;
    border: none;
    color: #9da6b8;
    font-size: 18px;
    cursor: pointer;
    margin-left: 8px;
    opacity: 0.9;
    transition: color 0.18s;
}

.minimize-button:hover {
    color: #3466ad;
}

.chart-body {
    padding: 10px 6px 6px 6px;
    height: 100%;
    min-height: 260px;
    max-height: 320px;
    background: #fcfdff;
    display: flex;
    justify-content: center;
    align-items: center;
}

.chart-body>canvas,
.chart-body>.your-chart-component {
    width: 100% !important;
    height: 100% !important;
    max-height: 400px !important;
}

.chart-card.minimized .chart-body {
    display: none;
}

.chart-card.minimized {
    min-height: 36px;
    max-height: 48px;
}

@media (max-width: 1100px) {
    .charts-grid {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(4, 1fr);
    }

    .chart-card {
        min-width: 0;
        max-width: 100%;
    }
}

@media (max-width: 700px) {
    .sensor-overview {
        padding: 7px 2px 0 2px;
    }

    .sensor-details-container {
        padding: 7px 4px 8px 4px;
    }

    .chart-toggle-buttons button {
        padding: 6px 13px;
        font-size: 0.98rem;
    }
}

/* Stack the two cards into one column on small screens */
@media (max-width: 767.98px) {
    .card-row {
        grid-template-columns: 1fr;
        gap: 16px;
        /* a little vertical spacing between cards */
    }

    /* ensure each card fills the row */
    .stats-summary-card,
    .panic-alert-card {
        max-width: 100%;
        margin: 0 auto;
    }
}
</style>