<template>
  <div class="electricity-data-card">
    <h3>Electrical Data</h3>
    <div style="position: relative; height: 400px; width: 100%;">
      <canvas id="electricityChart"></canvas>
    </div>
  </div>
</template>


<script>
import { Chart } from 'chart.js';

export default {
  name: 'ElectricityChart',
  data() {
    return {
      av40Data: [],
      chart: null
    };
  },
  mounted() {
    this.fetchData();
    setInterval(this.fetchData, 60 * 60 * 1000);
  },
  methods: {
    async fetchData() {
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/Bacnet/api/get/all/latest/data');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let text = await response.text();

        text = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
        text = text.replace(/ISODate\("([^"]+)"\)/g, '"$1"');

        const data = JSON.parse(text);

        console.log(data);

        // Filter the data to get only the objects with ObjectId 'AV:43'
        const filteredData = data.filter(item => item.ObjectId === 'AV:43').map(item => {
          return {
            value: parseFloat(item.Value),
            time: item.Time
          };
        });

        this.av40Data = [...this.av40Data, ...filteredData];

        this.createChart();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    createChart() {
      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = document.getElementById('electricityChart').getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }

      // Prepare the data for the chart
      const labels = this.av40Data.map(item => item.time);
      const values = this.av40Data.map(item => item.value);

      if (labels.length === 0 || values.length === 0) {
        console.warn('No data available to draw the chart');
        return;
      }

      // Create the chart
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Electricity Data for Smart FM KW',
            data: values,
            borderColor: 'rgba(255, 255, 0, 1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Value'
              }
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
:root {
  --dark-bg: #333;
  --light-text: #ffffff;
  --shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  --radius: 15px;
}

#electricityChart {
  max-width: 800px;
  height: 400px;
  margin: 0 auto;
  background-color: var(--dark-bg);
  color: var(--light-text);
  box-shadow: var(--shadow);
  border-radius: var(--radius);
}

.electricity-data-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 3px 16px 0 rgba(60, 60, 80, 0.10);
  padding: 32px 30px 24px 30px;
  border: 1px solid #e5e8ef;
  margin-bottom: 22px;
  width: 96%;
  max-width: 100%;
  /* Make the card expand to available width */
  margin-left: 1%;
}

.electricity-data-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f2937;
}

#electricityChart {
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
  background-color: #fff;
  /* remove dark background so chart fits card style */
  color: #222;
  border-radius: 14px;
  box-shadow: none;
}
</style>
