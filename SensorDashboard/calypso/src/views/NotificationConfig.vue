<template>
  <div class="configure-container">
    <h1 class="configure-title">Configure Notifications</h1>
    <form @submit.prevent="updateConfiguration" class="configure-form">
      <div class="form-group">
        <label for="temperatureThreshold">Temperature Threshold (°C):</label>
        <input type="number" id="temperatureThreshold" v-model="config.temperatureThreshold" min="0" class="form-control"/>
      </div>

      <div class="form-group">
        <label for="peopleCountThreshold">People Count Threshold:</label>
        <input type="number" id="peopleCountThreshold" v-model="config.peopleCountThreshold" min="0" class="form-control"/>
      </div>

      <div class="form-group">
        <label for="messageBody">Message Body:</label>
        <textarea id="messageBody" v-model="config.messageBody" rows="4" class="form-control"></textarea>
      </div>

      <button type="submit" class="btn-save">Save Changes</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      config: {
        temperatureThreshold: 26.5, // Default threshold
        peopleCountThreshold: 4, // Default threshold
        messageBody: "Notification message...", // Default message
      },
    };
  },
  methods: {
    async updateConfiguration() {
      // Need implement the update logic here -> making an API call to save the configuration changes to the server
      console.log("Configuration updated", this.config);
      // Show a success message or handle errors 
    },
  },
};
</script>

<style scoped>
.configure-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
}

.configure-title {
  text-align: center;
  margin-bottom: 30px;
}

.configure-form .form-group {
  margin-bottom: 15px;
}

.configure-form .form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.btn-save {
  width: 100%;
  padding: 10px;
  border: none;
  background-color: #5cb85c;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-save:hover {
  background-color: #4cae4c;
}
</style>
