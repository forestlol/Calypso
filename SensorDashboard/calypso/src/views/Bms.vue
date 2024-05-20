<template>
  <div class="container mt-5">
    <h2 class="mb-3">BMS Groups Dashboard</h2>
    <!-- Search box -->
    <div class="mb-4">
      <input type="text" v-model="search" class="form-control" placeholder="Search for a group name...">
    </div>

    <div v-if="loading" class="alert alert-info">Loading...</div>
    <div v-if="error" class="alert alert-danger">Error: {{ error }}</div>
    <transition-group name="fade" tag="div" class="row">
      <div v-for="(group, index) in filteredGroups" :key="group._id" class="mb-4">
        <h3>{{ group.name }}</h3>
        <div class="d-flex flex-wrap">
          <div v-for="(id, index) in group.group" :key="id" class="m-2" style="width: 18rem;">
            <div v-if="findLatestDataById(id)" class="card">
              <div class="card-body">
                <h5 class="card-title">{{ findLatestDataById(id).Name || 'Data Unavailable' }}</h5>
                <p class="card-text">
                  <span :class="{'status-label': true, 'ok': findLatestDataById(id).Status === 'OK', 'not-ok': findLatestDataById(id).Status !== 'OK'}">
                    Connection: {{ findLatestDataById(id).Status || 'N/A' }}
                  </span>
                  <br>
                  <span v-if="shouldShowStatus(findLatestDataById(id).Name || '')"
                        :class="{'status-label': true,
                                'ok': getActiveValue(id) === 'On' || getActiveValue(id) === 'Open',
                                'not-ok': getActiveValue(id) === 'Off' || getActiveValue(id) === 'Close'}">
                    Status: {{ getActiveValue(id) || 'N/A' }}
                  </span>
                  <br>
                  Value: {{ getPresentValue(id) }} {{ group.units[index] || '' }}
                  <br>
                  Date: {{ findLatestDataById(id).dateTime || 'N/A' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>



<script>

import * as CacheManager from '@/CacheManager.js';


export default {
  data() {
    return {
      groups: [],
      loading: true, // Add a loading state
      error: null, // Track any errors
      latestData: [],
      refreshInternal: null,
      search: '',
    }
  },
  async created(){
    if(CacheManager.getItem('bms') != null){
        this.latestData == CacheManager.getItem('bms')
        await this.fetchLatestData();
        await this.fetchData();
      }else{
        await this.fetchLatestData();
        await this.fetchData();
      }
      this.setRefreshInterval();
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  computed:{
    filteredGroups() {
      const searchTerm = this.search.toLowerCase();
      return this.groups.filter(group => group.name.toLowerCase().includes(searchTerm));
    },
  },
  methods: {
    setRefreshInterval() {
      // Set up an interval to fetch data every 2 minutes
      this.refreshInterval = setInterval(() => {
        this.fetchLatestData();
      }, 120000); // 120000 milliseconds = 2 minutes
    },
    async fetchData() {
      this.loading = true;
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/Bacnet/api/get/bms/groups');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        let textData = await response.text();
        textData = textData.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
        const data = JSON.parse(textData);
        console.log(data);
        this.groups = data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async fetchLatestData() {
      this.loading = true;
      try {
        const response = await fetch('https://hammerhead-app-kva7n.ondigitalocean.app/Bacnet/api/get/all/latest/data');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        let textData = await response.text();
        // Replace MongoDB ObjectId and ISODate to be JSON-compatible
        textData = textData.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
        textData = textData.replace(/ISODate\("([^"]+)"\)/g, '"$1"');
        const data = JSON.parse(textData);
        console.log(data);
        this.latestData = data;
        
        CacheManager.setItem('bms', this.latestData);

      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    findLatestDataById(objectId) {
      const filteredData = this.latestData.filter(data => data.ObjectId === objectId);
      return filteredData.length > 0 ? filteredData[filteredData.length - 1] : {};
    },
    
    getActiveValue(id) {
      const latestData = this.findLatestDataById(id);
      if (latestData.Name && latestData.Name.includes('Status')) {
        return latestData.Value >= 1 ? 'On' : 'Off';
      } else if (latestData.Name && latestData.Name.includes('_GD')) {
        return latestData.Value >= 1 ? 'Close' : 'Open';
      } else if (latestData.Name && latestData.Name.includes('_SD')) {
        return latestData.Value >= 1 ? 'Close' : 'Open';
      }
      // Fall back to raw value if not a status field
      return 'Active';
    },

    getPresentValue(id) {
      const latestData = this.findLatestDataById(id);
      // Fall back to raw value if not a status field
      return latestData.Value;
    },

    shouldShowStatus(name) {
      return name && (name.includes('Status') || name.includes('_GD') || name.includes('_SD'));
    }
  }
}
</script>


<style>
/* Additional CSS styles for hover effect and transitions */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* Transition styles for fade effect */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.status-label {
  display: inline-block;
  padding: 0.25em 0.6em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem; /* Rounded corners */
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
              border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.ok {
  color: #fff;
  background-color: #28a745; /* Green background for 'OK' status */
}

.not-ok {
  color: #fff;
  background-color: #dc3545; /* Red background for non-'OK' statuses */
}
</style>

  
  