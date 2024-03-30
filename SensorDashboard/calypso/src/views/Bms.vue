<template>
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <div class="card shadow mb-4">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">Device Data Overview</h6>
            </div>
            <div class="card-body">
              <div class="row">
                <!-- Device Cards -->
                <div class="col-md-6 mb-4" v-for="(deviceGroup, deviceId) in groupedDevices" :key="deviceId">
                  <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                      <h6 class="m-0">Device: {{ deviceId }}</h6>
                    </div>
                    <div class="card-body">
                      <!-- Object Data -->
                      <div v-for="(objGroup, objectId) in deviceGroup" :key="objectId">
                        <h6 class="text-uppercase mb-2">{{ formatName(objectId) }}</h6>
                        <p>Status: <span :class="`badge ${objGroup.lastReading.Status === 'OK' ? 'bg-success' : 'bg-danger'}`">{{ objGroup.lastReading.Status }}</span></p>
                        <p class="mb-1">Average Value: {{ objGroup.average.toFixed(2) }}</p>
                        <p class="mb-1">Last Reading: {{ objGroup.lastReading.dateTime }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isDarkMode: false,
        groupedDevices: {}, // Structured data for display
      };
    },
    mounted() {
      this.fetchDeviceData();
    },
    methods: {
        async fetchDeviceData() {
            try {
                const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/Bacnet/api/get/all/data');
                if (!response.ok) throw new Error('Failed to fetch');
                const rawData = await response.text();
                const cleanedData = this.cleanResponse(rawData);
                const parsedData = JSON.parse(cleanedData);
                this.processData(parsedData);
            } catch (error) {
                console.error('Error fetching device data:', error);
            }
        },
        cleanResponse(rawData) {
            return rawData
                .replace(/ObjectId\("([^"]+)"\)/g, '"$1"') // Convert ObjectId to string
                .replace(/ISODate\("([^"]+)"\)/g, '"$1"');  // Convert ISODate to string
        },
      processData(devices) {
        const grouped = {};
        devices.forEach(({ Device, Name, Value, Status, dateTime }) => {
          if (!grouped[Device]) grouped[Device] = {};
          if (!grouped[Device][Name]) grouped[Device][Name] = { chartData: {}, entries: [], average: 0, lastReading: {} };
          const value = parseFloat(Value);
          const formattedDateTime = dateTime.toLocaleString();
  
          const group = grouped[Device][Name];
          group.chartData[formattedDateTime] = value;
          group.entries.push({ dateTime: formattedDateTime, value });
          group.lastReading = { Value, Time: formattedDateTime, Status };
  
          // Recalculate the average
          const total = group.entries.reduce((acc, curr) => acc + curr.value, 0);
          group.average = total / group.entries.length;
        });
        this.groupedDevices = grouped;
      },
      formatName(name) {
        // Format name as required
        // For example, replacing underscores with spaces
        return name.replace(/_/g, ' ');
    },
      toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
      },
    },
  };
  </script>

<style>
/* Additional CSS styles */
.card-header h6 {
  margin-bottom: 0;
}
.card-body {
  padding: 1.5rem;
}
.card-body h6 {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
.card-body p {
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}
</style>
  
  