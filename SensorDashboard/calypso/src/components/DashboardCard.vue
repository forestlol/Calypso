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
    /* Add styles for your dashboard card here */
    background: #333740;
    color: #fbffff;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    transition: box-shadow 0.3s ease-in-out;
    /* other styles */
  }
  
  .dashboard-card:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
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
  