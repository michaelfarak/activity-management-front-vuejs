<template>
  <md-app>
    <md-app-content>
      <ActivityList :activities="activities" :versionName="versionName" />
    </md-app-content>
  </md-app>
</template>

<script>
import axios from "axios";
import ActivityList from "../components/ActivityList.vue";

export default {
  name: "V1",
  components: {
    ActivityList
  },
  data() {
    return {
      activities: [],
      activityNames: [],
      versionName: "V1"
    };
  },
  created() {
    this.fetchActivities();
  },
  methods: {
    fetchActivities() {
      axios
        .get("http://localhost:3000/activities/v1")
        .then(response => {
          this.activities = response.data;
        })
        .catch(error => {
          console.error("Error fetching activities:", error);
        });
    }
  }
};
</script>

<style></style>
