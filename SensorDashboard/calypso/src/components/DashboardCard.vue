<!-- DashboardCard.vue -->
<template>
    <div class="dashboard-card">
      <div class="card-header">
        <font-awesome-icon :icon="icon" size="lg" />
        <h5 class="card-title">{{ title }}</h5>
      </div>
      <div class="card-body">
        <slot></slot> <!-- This is where custom content will go -->
      </div>
    </div>
  </template>
  
  <script>
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  export default {
    components: {
        FontAwesomeIcon,
    },
    props: {
      title: {
        type: String,
        required: true,
      },
      icon: {
        type: Array,
        required: true,
      },
    },
  };
  </script>
  
  <style scoped>
  .dashboard-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }
  
  .dashboard-card-header {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #e0e0e0;
  }

  .dashboard-card-icon {
    margin-right: 10px;
    font-size: 24px;
  }

  .dashboard-card-title {
    font-weight: bold;
    font-size: 18px;
  }

  .dashboard-card-body {
    padding: 16px;
  }

  .dashboard-card-chart {
    height: 150px;
  }

  .dashboard-card:hover {
    transform: translateY(-5px);
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
  }
  
  .dashboard-card.water {
    border-left: 5px solid #3498db;
  }

  .dashboard-card.electricity {
    border-left: 5px solid #f1c40f;
  }

  .dashboard-card.efficiency {
    border-left: 5px solid #2ecc71;
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
  
  
  .card-body {
    flex: 1; /* Allow the body to fill the rest of the space */
    display: flex; /* Align the text in the center */
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  </style>
  