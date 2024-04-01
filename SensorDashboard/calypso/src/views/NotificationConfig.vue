<template>
  <div class="configure-container">
    <h1 class="configure-title">Configure Notifications</h1>
    <form @submit.prevent="saveConfiguration" class="configure-form">
      <!-- Threshold Editor -->
      <div class="form-group">
        <label for="lowerTemperatureThreshold">Lower Temperature Threshold (°C):</label>
        <input type="number" id="lowerTemperatureThreshold" v-model="lowerTemperatureThreshold" min="0" step="0.1" class="form-control"/>
      </div>

      <div class="form-group">
        <label for="upperTemperatureThreshold">Upper Temperature Threshold (°C):</label>
        <input type="number" id="upperTemperatureThreshold" v-model="upperTemperatureThreshold" min="0" step="0.1" class="form-control"/>
      </div>

      <!-- Recipients Editor -->
      <div class="form-group">
        <label for="recipients">Notification Recipients:</label>
        <div class="recipients-list">
          <span v-for="recipient in recipients" :key="recipient" class="recipient-pill">
            {{ recipient }}
            <button @click.prevent="removeRecipient(recipient)" type="button" class="remove-recipient">x</button>
          </span>
        </div>
        <input type="email" v-model="newRecipient" placeholder="Add recipient" class="form-control"/>
        <button @click.prevent="addRecipient" type="button" class="btn-add-recipient">Add</button>
      </div>

      <!-- Execution Schedule Editor -->
      <div class="form-group">
        <label for="executionSchedule">Execution Schedule:</label>
        <select id="executionSchedule" v-model="selectedInterval" @change="updateNextExecutionTime" class="form-control">
          <option v-for="hour in Array.from({ length: 24 }, (_, i) => i + 1)" :key = "hour" :value="hour * 60">Every {{ hour }} hour</option>
        </select>
      </div>

      <div class="form-group">
        <label>Next Execution Time:</label>
        <p style="color: black;">{{ nextExecutionTime }}</p>
      </div>

      <!-- Message Body Editor -->
      <div class="form-group">
        <label for="messageBody">Message Body:</label>
        <textarea id="messageBody" v-model="messageBody" rows="4" class="form-control" placeholder="Add instructions"></textarea>
      </div>

    <div class="configure-buttons">
        <button type="submit" class="btn-save">Save</button>
        <button @click="cancelConfiguration" class="btn-cancel">Cancel</button>
    </div>
    </form>
  </div>

  <!-- Success Modal -->
  <div v-if="showSuccessModal" class="modal-overlay">
    <div class="modal-content">
      <p>Notifications have been updated successfully!</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
        recipients: [], 
        newRecipient: '',
        lowerTemperatureThreshold: 22.0, 
        upperTemperatureThreshold: 27.0, 
        peopleCountThreshold: 4, 
        selectedInterval: '', 
        nextExecutionTime: '',
        messageBody: "", 
        showSuccessModal: false
    };
  },
  methods: {
    fetchSettings() {
      // API call to get the notification settings
      axios.get('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/notification')
        .then(response => {
          const sanitizedDataString = response.data.replace(/ObjectId\("([^"]+)"\)/g, '"$1"').replace(/ISODate\("([^"]+)"\)/g, '"$1"');
          try {
            const settingsArray = JSON.parse(sanitizedDataString);
            const settings = settingsArray[0];

            this.recipients = settings.notifcationRecipients; 
            this.lowerTemperatureThreshold = settings.lowerTemperatureThreshold;
            this.upperTemperatureThreshold = settings.upperTemperatureThreshold;       
            this.peopleCountThreshold = settings.peopleCountThreshold;
            this.messageBody = settings.messageBody;
            this.selectedInterval = settings.interval;
            const nextExecutionDate = new Date(settings.nextExecutionTime);
            this.nextExecutionTime = this.formatDate(nextExecutionDate);
          } catch (error) {
            console.error('Error parsing settings:', error);
          }
        })
        .catch(error => {
          console.error('Error fetching settings:', error);
        });
    },
    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return date.toLocaleDateString('en-US', options);
    },
    addRecipient() {
      if (this.newRecipient && this.isValidEmail(this.newRecipient)) {
        // Check if the email already exists in the list
        if (!this.recipients.includes(this.newRecipient)) {
          this.recipients.push(this.newRecipient);
          this.newRecipient = ''; // Reset the input
        } else {
          alert('This email is already in the list.');
        }
      } else {
        alert('Please enter a valid email address.');
      }
    },
    removeRecipient(email) {
      this.recipients = this.recipients.filter(recipient => recipient !== email);
    },
    updateNextExecutionTime() {
      const currentTime = new Date();
      const intervalMilliseconds = this.selectedInterval * 60000; 
      const nextExecution = new Date(currentTime.getTime() + intervalMilliseconds);
      this.nextExecutionTime = nextExecution.toLocaleString(); 
    },
    saveConfiguration() {
      // Calculate the next execution time based on the selected interval
      const currentTime = new Date();
      const intervalMilliseconds = this.selectedInterval * 60000; // Convert mins to milliseconds
      const nextExecution = new Date(currentTime.getTime() + intervalMilliseconds);
      const nextExecutionISOString = nextExecution.toISOString(); // Convert to ISO string for storage
      const payload = {
        upperTemperatureThreshold: this.upperTemperatureThreshold.toString(),
        lowerTemperatureThreshold: this.lowerTemperatureThreshold.toString(),
        peopleCountThreshold: this.peopleCountThreshold,
        notifcationRecipients: this.recipients,
        messageBody: this.messageBody,
        interval: this.selectedInterval,
        nextExecutionTime: nextExecutionISOString 
      };

      axios.post('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/post/notification', payload)
        .then(response => {
          // Handle the successful response here
          this.showSuccessModal = true;
          setTimeout(() => {
            this.showSuccessModal = false;
            this.$router.push({ name: 'Sensors' });
          }, 2000); // Show the modal for 2 seconds
        })
        .catch(error => {
          // Handle errors here
          console.error('Failed to save configuration:', error);
          alert('Failed to save configuration: ' + error.message);
        });
    },
    isValidEmail(email) {
      // Simple regex for email validation
      const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      return regex.test(email);
    },
    cancelConfiguration() {
      this.$router.push({ name: 'Sensors' });
    }
  },
  mounted() {
    this.fetchSettings();
  }
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
    color: #34495e !important;
}

.configure-form label {
    color: #34495e; 
    font-weight: bold; 
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

.configure-buttons {
    display: flex;
    justify-content: center;
    gap: 10px; 
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

.btn-cancel {
    width: 100%;
    padding: 10px;
    border: none;    
    background-color: #f44336; 
    color: white;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-cancel:hover {
    background-color: #d32f2f;
}

.recipients-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
}

.recipient-pill {
    display: flex;
    align-items: center;
    background-color: #e0e0e0;
    border-radius: 16px;
    padding: 5px 10px;
    font-size: 14px;
    color: black;
}

.remove-recipient {
    background: none;
    border: none;
    margin-left: 8px;
    cursor: pointer;
    font-weight: bold;
}

.btn-add-recipient {
    margin-top: 10px;
    padding: 10px 15px;
    background-color: #3498db;
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
}

.btn-add-recipient:hover {
    background-color: #2980b9;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    width: 40%;
    background: #5cb85c;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    color: #fff;
    font-weight: bold;
}
</style>