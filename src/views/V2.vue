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
  name: "V2",
  components: {
    ActivityList
  },
  data() {
    return {
      activities: [],
      activityNames: [],
      versionName: "V2"
    };
  },
  created() {
    this.fetchActivities();
  },
  methods: {
    fetchActivities() {
      axios
        .get("http://localhost:3000/activities/v2")
        .then(response => {
          this.activities = response.data.flatMap(groupedActivities => {
            return groupedActivities.activities.map(activity => ({
              ...activity,
              resource_type: groupedActivities.resource_type
            }));
          });
        })
        .catch(error => {
          console.error("Error fetching activities:", error);
        });
    }
  }
};
</script>

<style></style>
