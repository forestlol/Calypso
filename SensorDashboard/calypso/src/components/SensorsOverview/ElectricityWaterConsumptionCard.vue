<template>
  <div class="consumption-card">
    <div class="card-header">Electricity Consumption</div>
    <div class="card-body">
      <canvas :id="electricityChartId"></canvas>
    </div>
    <div class="card-header">Water Consumption</div>
    <div class="card-body">
      <canvas :id="waterChartId"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  props: {
    electricityData: Array,
    waterData: Array
  },
  data() {
    return {
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
.consumption-card {
  /* Styles for the card */
}

.card-header {
  /* Styles for card headers */
}

.card-body {
  /* Styles for card bodies */
}

/* Include any other styles specific to these consumption charts */
</style>
