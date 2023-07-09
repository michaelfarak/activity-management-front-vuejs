<template>
  <div>
    <h2>Activity List {{ versionName }}</h2>

    <div class="filters">
      <button @click="toggleFilter(null)" :class="{ active: isFilterActive(null) }">
        <i v-show="isFilterActive(null)" class="fa fa-check-circle"></i>
        All works
      </button>
      <button
        v-for="resourceType in resourceTypes"
        :key="resourceType"
        @click="toggleFilter(resourceType)"
        :class="{ active: isFilterActive(resourceType) }"
      >
        <i v-show="isFilterActive(resourceType)" class="fa fa-check-circle"></i>
        {{ parseToReadableLabel(resourceType) }}
      </button>
    </div>
    <div class="autocomplete-container">
      <md-field>
        <label>Search Timeline</label>
        <md-autocomplete
          v-model="searchTerm"
          :md-options="activityNames"
          :md-search-text.sync="searchTerm"
          :md-loading="isLoading"
          md-min-length="1"
          md-select-on-keypress
          md-remote-delay="300"
          md-clear-on-select
          @md-selected="onSelectActivity"
        >
          <template slot="md-autocomplete-item" slot-scope="{ item }">
            <span>{{ item }}</span>
          </template>
        </md-autocomplete>
      </md-field>
    </div>

    <div v-for="(group, month) in groupedActivities" :key="month">
      <div class="month">
        {{ month }}
        <span class="vertical-line"></span>
      </div>
      <ul style="list-style-type: none;">
        <li v-for="activity in group" :key="activity.id">
          <Activity
            :activity="activity"
            :activityName="readableActivityName(activity)"
            :isViewable="isViewable(activity)"
            :hidden="isActivityHidden(activity.id)"
            @toggleHidden="toggleActivityHidden(activity.id)"
          />
        </li>
      </ul>
    </div>
    <button v-if="shouldShowLoadMoreButton" @click="loadMore" class="load-more-button">
      <i class="fa fa-chevron-down"></i>
      Load More
    </button>
  </div>
</template>

<script>
import Activity from "./Activity.vue";
export default {
  components: {
    Activity
  },
  props: {
    activities: Array,
    versionName: String
  },
  data() {
    return {
      searchTerm: "",
      isLoading: false,
      selectedFilter: null,
      activeFilters: [],
      activitiesPerPage: 10,
      paginationStep: 10,
      hiddenActivities: []
    };
  },
  computed: {
    activitiesToBeDisplayed() {
      return activityList => {
        return activityList.slice(0, this.activitiesPerPage);
      };
    },

    resourceTypes() {
      const types = [
        ...new Set(
          this.activitiesToBeDisplayed(this.activities).map(activity => activity.resource_type)
        )
      ];
      return types.filter(Boolean);
    },

    activityNames() {
      const uniqueActivityNames = Array.from(
        new Set(
          this.activitiesToBeDisplayed(this.activities).map(activity =>
            this.readableActivityName(activity)
          )
        )
      ).sort();
      return uniqueActivityNames;
    },

    filteredActivities() {
      let activities = this.activitiesToBeDisplayed(this.activities);

      if (this.activeFilters.length > 0) {
        activities = activities.filter(activity =>
          this.activeFilters.includes(activity.resource_type)
        );
      }

      if (this.searchTerm) {
        activities = activities.filter(
          activity => this.searchTerm === this.readableActivityName(activity)
        );
      }
      return activities;
    },

    groupedActivities() {
      return this.filteredActivities.reduce((result, activity) => {
        const date = new Date(activity.d_created * 1000);
        const monthYear = `${date.toLocaleString("default", {
          month: "long"
        })} ${date.getFullYear()}`;

        if (!result[monthYear]) {
          result[monthYear] = [];
        }
        result[monthYear].push(activity);
        return result;
      }, {});
    },

    readableActivityName() {
      return activity => {
        return `${this.parseToReadableLabel(activity.topic_data.name)} ${this.parseToReadableLabel(
          activity.resource_type
        )}`;
      };
    },

    parseToReadableLabel() {
      return resourceType => {
        if (resourceType.includes("_a_")) {
          const words = resourceType.split("_");
          const transformedWords = words.map((word, index) => {
            if (index === 0 || index === words.length - 1) {
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            } else {
              return word.charAt(0).toLowerCase();
            }
          });
          return transformedWords.join("-");
        } else {
          const words = resourceType
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
          return words.join(" ");
        }
      };
    },

    isViewable() {
      return activity => {
        const authorizedViewables = [
          "quiz",
          "easy_quiz",
          "challenge",
          "make_a_map",
          "make_a_movie",
          "wordplay",
          "draw_about_it"
        ];
        return authorizedViewables.includes(activity.resource_type);
      };
    },

    shouldShowLoadMoreButton() {
      return this.activitiesPerPage <= this.activities.length;
    }
  },

  mounted() {
    this.loadHiddenActivities();
  },

  methods: {
    onSelectActivity(item) {
      this.searchTerm = item;
    },

    toggleFilter(filter) {
      if (filter === null) {
        this.activeFilters = [];
        return;
      }
      if (this.isFilterActive(filter)) {
        this.activeFilters = this.activeFilters.filter(activeFilter => activeFilter !== filter);
      } else {
        this.activeFilters.push(filter);
      }
    },

    isFilterActive(filter) {
      if (filter === null) {
        return this.activeFilters.length === 0;
      }
      return this.activeFilters.includes(filter);
    },

    loadMore() {
      this.activitiesPerPage = this.activitiesPerPage + this.paginationStep;
    },

    toggleActivityHidden(activityId) {
      const index = this.hiddenActivities.indexOf(activityId);
      if (index > -1) {
        this.hiddenActivities.splice(index, 1);
      } else {
        this.hiddenActivities.push(activityId);
      }
      this.saveHiddenActivities();
    },

    saveHiddenActivities() {
      localStorage.setItem("hiddenActivities", JSON.stringify(this.hiddenActivities));
    },

    isActivityHidden(activityId) {
      return this.hiddenActivities.includes(activityId);
    },

    loadHiddenActivities() {
      const storedHiddenActivities = localStorage.getItem("hiddenActivities");
      if (storedHiddenActivities) {
        this.hiddenActivities = JSON.parse(storedHiddenActivities);
      }
    }
  }
};
</script>

<style>
.filters {
  margin-bottom: 1rem;
}

.filters button {
  color: #028083;
  background: none;
  margin-right: 0.5rem;
  border: 2px solid #028083;
  padding: 5px;
  cursor: pointer;
}

.filters .active {
  background-color: lightblue;
}

.load-more-button {
  color: #028083;
  font-weight: bold;
  border: none;
  background: none;
  cursor: pointer;
}
.autocomplete-container {
  width: 300px;
}

.md-menu-content {
  max-width: 300px !important;
}

.month {
  position: relative;
  display: inline-block;
  padding: 5px;
  background-color: #fcf8e5;
  border-radius: 10px;
}

.vertical-line {
  position: absolute;
  left: 50%;
  top: 100%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  height: 14px;
  width: 1px;
  background-color: #000;
}
</style>
