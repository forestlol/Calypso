<template>
  <div class="sensor-details-container">
    <draggable class="row" @end="onEnd" :list="cards" item-key="name">
      <template #item="{ element }">
        <div class="col-lg-6 d-flex flex-column">
          <div :class="['chart-container', element.type + '-chart', minimizedCards[element.name] ? 'minimized-chart-container' : '']">
            <div class="card-header">
              <h5>{{ formatChartName(element.name) }}</h5>
              <button class="minimize-button" @click="minimizeCard(element.name)">
                {{ minimizedCards[element.name] ? '+' : '-' }}
              </button>
            </div>
            <div class="card-body" v-show="!minimizedCards[element.name]">
              <canvas :id="element.name === 'electricity' ? electricityChartId : waterChartId"></canvas>
            </div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  components: {
    draggable
  },
  props: {
    electricityData: Array,
    waterData: Array
  },
  data() {
    return {
      cards: [
        { name: 'electricity', type: 'line-chart', minimized: false },
        { name: 'water', type: 'line-chart', minimized: false }
      ],
      minimizedCards: {
        electricity: false,
        water: false
      },
      electricityChart: null,
      waterChart: null,
      barChartOptions: {
        responsive: true,
        maintainAspectRatio: true,
      },
    };
  },
  computed: {
    electricityChartId() {
      return `electricityConsumptionChart-${this._uid}`;
    },
    waterChartId() {
      return `waterConsumptionChart-${this._uid}`;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.createWaterConsumptionChart();
      this.createElectricalConsumptionChart();
    });
  },
  methods: {
    createWaterConsumptionChart() {
      const waterCanvasId = `waterConsumptionChart-${this._uid}`;
      const waterCanvas = document.getElementById(waterCanvasId);

      if (waterCanvas) {
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
      else {
        console.error('Water consumption canvas element not found');
      }
    },
    minimizeCard(cardName) {
      this.minimizedCards[cardName] = !this.minimizedCards[cardName];
    },
    formatChartName(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    },
    onEnd(event) {
      console.log('Drag ended', event);
      // Implement the logic you want to execute when the drag ends
    },
    createElectricalConsumptionChart() {
      const electricalCanvasId = `electricityConsumptionChart-${this._uid}`;
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
      else {
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
  beforeUnmount() {
    if (this.electricityChart) {
      this.electricityChart.destroy();
    }
    if (this.waterChart) {
      this.waterChart.destroy();
    }
  }
};
</script>

<style scoped>
.chart-container {
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  margin: 10px;
  color: var(--light-text);
  background: var(--dark-bg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto; /* Allow the container to grow and shrink */
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: bold;
}

.card-body {
  flex-grow: 0;
}

.minimize-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: var(--light-text);
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
  transition: background-color 0.3s;
}

.minimize-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Specific styles for electricity and water charts */
.electricity-chart {
  background: linear-gradient(to right, #ffeaa7, #fdcb6e);
  /* Gradient for electricity */
}

.water-chart {
  background: linear-gradient(to right, #a1c4fd, #c2e9fb);
  /* Gradient for water */
}

.minimized-chart-container {
  height: auto; /* Adjust the height to fit the header */
  overflow: hidden; /* Hide the overflow content */
  flex: 0 0 auto; /* Do not grow, do not shrink, base size on the height given */
}

.sensor-details-container .col-lg-6 {
  flex: 1; /* Override Bootstrap's flex properties if necessary */
  min-width: 0; /* This ensures that the column can shrink past content size */
}
</style>
