<template>
  <div class="overview-content">
    <div class="header-row">
      <h2 class="dashboard-title">Home</h2>
      <nav class="breadcrumb">
        <span class="breadcrumb-item">Cavill</span>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-item">Menu</span>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-item active">Home</span>
      </nav>
    </div>
    <div class="row mb-4 align-items-center">
      <div class="col-lg-6">
        <select class="form-select bg-secondary text-white" v-model="selectedBuilding">
          <option disabled value="">Select your building</option>
          <option v-for="building in buildings" :key="building.building_name" :value="building.building_name">
            {{ building.building_name }}
          </option>
        </select>
      </div>
      <!-- <div class="col-lg-6">
        <h3 v-if="selectedBuilding" class="display-4 text-center">{{selectedBuilding}} <br> Overview</h3>
        <h3 v-else class="display-4 text-center">Overview</h3>
      </div> -->
    </div>

    <div class="row">
      <div class="col-lg-12 mb-4">
        <sensor-overview-card :averageTemperature="averageTemperature" :averageHumidity="averageHumidity"
          :totalPeople="totalPeople"></sensor-overview-card>
      </div>
      <!--       
      <div class="col-md-12 mb-4">
        <electricity-water-consumption-card :electricity-data="electricityData"
          :water-data="waterData"></electricity-water-consumption-card>
      </div> -->
    </div>
  </div>
</template>

<script>
import DashboardCard from './DashboardCard.vue';
import SensorOverviewCard from './SensorsOverview/SensorOverviewCard.vue';
import ElectricityWaterConsumptionCard from './SensorsOverview/ElectricityWaterConsumptionCard.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import * as CacheManager from '@/CacheManager.js';

export default {
  components: {
    DashboardCard,
    SensorOverviewCard,
    ElectricityWaterConsumptionCard,
    FontAwesomeIcon
  },
  data() {
    return {
      buildings: [],
      selectedBuilding: '',
      loading: false,
      error: null,
      alerts: [], // Data for notifications and alerts
      dashboardConfigurations: {}, // Settings for custom dashboard configurations
      advancedReports: [],
    }
  },
  async created() {
    if (CacheManager.getItem('buildings') != null) {
      this.buildings == CacheManager.getItem('buildings')
      await this.fetchBuildings();
      CacheManager.setItem('buildings', this.buildings);
    } else {
      await this.fetchBuildings();
      CacheManager.setItem('buildings', this.buildings);
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
        if (this.buildings.length > 0) {
          this.selectedBuilding = this.buildings[0].building_name;
        }
      } catch (err) {
        console.error(err);
        this.error = 'Failed to load buildings data: ' + err.message;
      } finally {
        this.loading = false;
      }
    },
  }
}
</script>

<style scoped>
.display-6 {
  font-size: 2rem;
  /* Larger font size for key data */
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #2c323c;
  color: #fbffff;
}

/* make overview-content act like container */
.overview-content {
  max-width: 1600px;
}

/* Title */
h1.display-4,
h3.display-4 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3590f3 !important;
}

.form-select.bg-secondary {
  border: none;
  border-radius: 8px;
  appearance: none;
  /* Removes default browser dropdown arrow */
  background-image: url('dropdown-arrow.svg');
  /* Custom arrow icon */
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  color: #ffffff;
  /* Set default color for options */
}

/* Specific style for the disabled option */
.form-select.bg-secondary option:disabled {
  color: lightgrey;
  /* Lighter text color for the placeholder */
}

/* Cards */
.card {
  min-width: 100%;
  display: flex;
  /* Make the card a flex container */
  flex-direction: column;
  /* Stack children vertically */
  margin-bottom: 20px;
  padding: 1rem;
  background: #333740;
  /* Slightly lighter to contrast with the dark background */
  color: #fbffff;
  border-radius: 0.5rem;
  border: none;
  /* Remove borders for a cleaner look */
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.card-header {
  background-color: #3590f3;
  color: #ffffff;
  padding: 0.75rem 1rem;
  font-size: 1.25rem;
  border-radius: 0.5rem 0.5rem 0 0;
  height: 60px;
  /* Fixed height for all headers */
  display: flex;
  /* Align the text in the center */
  align-items: center;
  justify-content: center;
}

.card:hover {
  background: #353b45;
  /* Slightly lighter on hover for interaction */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  /* Deeper shadow on hover */
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
  flex: 1;
  /* Allow the body to fill the rest of the space */
  display: flex;
  /* Align the text in the center */
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.card-text {
  font-size: 1.25rem;
  /* margin: 0; */
  color: #fbffff;
}

.card-header,
.card-text,
h1.display-4,
h3.display-4 {
  font-family: 'Roboto', sans-serif;
  /* Apply the font only to these classes and elements */
}

.notification-alerts,
.custom-dashboard-configurations,
.advanced-reporting {
  /* Styling examples */
  padding: 1rem;
  border-radius: 8px;
  background-color: #404040;
  color: #fff;
  /* Additional styles as needed */
}

/* Charts */
column-chart,
pie-chart {
  min-width: 100%;
  height: auto;
}

.pie-chart-container {
  padding: 1rem;
  background-color: #333;
  /* Dark background for the container */
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 2rem;
}

.line-chart-container {
  width: 100%;
  height: auto;
}

.bg-danger {
  background-color: #dc3545;
  /* Bootstrap's default danger color */
  color: white;
  /* Text color for better contrast */
}

.chart-container h3 {
  margin-bottom: 1rem;
}

.chart-title {
  color: #3590f3;
  /* Blue color for headings */
}

#waterConsumptionChart,
#electricalConsumptionChart {
  max-width: 400px;
  height: auto;
}

.row .col-lg-6 {
  padding-left: 1.7%;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 2%;
  padding-left: 1%;
  padding-right: 2%;
}

.dashboard-title {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #1f2937;
}

.breadcrumb-item {
  color: #4b5563;
}

.breadcrumb-item.active {
  color: #111827;
  font-weight: 600;
}

.breadcrumb-separator {
  margin: 0 8px;
}

/* -----------------------------------
   RESPONSIVE OVERRIDES
------------------------------------*/

/* Below large breakpoint (992px): stack all .col-lg-* to full width */
@media (max-width: 991.98px) {

  .row .col-lg-6,
  .row .col-lg-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

/* Below medium breakpoint (768px): center select and cards, adjust header-row */
@media (max-width: 767.98px) {
  .row.mb-4.align-items-center {
    justify-content: center;
  }

  .row.mb-4 .col-lg-6 {
    max-width: 100%;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .card {
    margin-left: auto;
    margin-right: auto;
  }

  .overview-content {
    padding: 10px 20px;
  }

  .header-row {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 1rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    gap: 0.5rem;
  }

  .dashboard-title {
    font-size: 20px;
  }

  .breadcrumb {
    font-size: 12px;
  }
}

/* Below small breakpoint (576px): tighten paddings, font sizes */
@media (max-width: 575.98px) {
  .overview-content {
    padding: 8px 12px;
  }

  .dashboard-title {
    font-size: 18px;
  }

  .breadcrumb {
    font-size: 11px;
  }

  .chart-container h3 {
    font-size: 0.9rem;
  }

  .form-select.bg-secondary {
    font-size: 0.9rem;
  }
}
</style>
