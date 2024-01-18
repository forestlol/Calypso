<template>
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ room.name }}</h2>
      </div>
      <div class="card-body">
        <p class="mb-2">Average Temperature: {{ room.temperature }}°C</p>
        <p>People Count: {{ room.people }}</p>
        <button @click="goToRoomDetail(room.id)" class="btn btn-primary mt-2">View Details</button>
      </div>
    </div>
  </template> 
  
  <script>
  export default {
    props: ['room'],
    methods: {
      goToRoomDetail(id) {
        this.$router.push(`/room/${id}`);
      }
    }
  }
  </script>
  