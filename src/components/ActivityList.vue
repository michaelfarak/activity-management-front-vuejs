<template>
  <div class="main-container">
    <h1 class="main-title">Activities view {{ versionName }}</h1>

    <div class="autocomplete-container">
      <h1>Timeline</h1>
      <md-field>
        <md-autocomplete
          md-input-placeholder="Search timeline"
          v-model="searchTerm"
          :md-options="activityNames"
          :md-search-text.sync="searchTerm"
          :md-loading="isLoading"
          md-min-length="1"
          md-select-on-keypress
          md-remote-delay="300"
          @md-selected="onSelectActivity"
        >
          <div class="magnifying-glass-container">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </div>
          <template slot="md-autocomplete-item" slot-scope="{ item }">
            <span>{{ item }}</span>
          </template>
        </md-autocomplete>
      </md-field>
    </div>
    <div class="filter-by">Filter by:</div>
    <div class="filters">
      <button @click="toggleFilter(null)" :class="{ active: isFilterActive(null) }">
        <font-awesome-icon
          v-if="isFilterActive(null)"
          :icon="['fas', 'circle-check']"
          style="color: #028083;"
        />
        All works
      </button>
      <button
        v-for="resourceType in resourceTypes"
        :key="resourceType"
        @click="toggleFilter(resourceType)"
        :class="{ active: isFilterActive(resourceType) }"
      >
        <font-awesome-icon
          v-if="isFilterActive(resourceType)"
          :icon="['fas', 'circle-check']"
          style="color: #028083;"
        />

        {{ parseToReadableLabel(resourceType) }}
      </button>
    </div>

    <div
      class="activities-group"
      v-for="(group, month, groupIndex) in groupedActivities"
      :key="month"
    >
      <div class="month">
        {{ month }}
      </div>
      <ul class="activities-list">
        <li v-for="(activity, index) in group" :key="activity.id" class="activity-item">
          <Activity
            :activity="activity"
            :isFirstActivity="isFirstActivity(index)"
            :isLastActivity="isLastActivity(index, group, groupIndex)"
            :activityName="readableActivityName(activity)"
            :isViewable="isViewable(activity)"
            :hidden="isActivityHidden(activity.id)"
            @toggleHidden="toggleActivityHidden(activity.id)"
          />
        </li>
      </ul>
      <span class="vertical-line-group"></span>
    </div>
    <div v-if="filteredActivities.length === 0">NO ACTIVITY FOUND</div>
    <button v-if="shouldShowLoadMoreButton" @click="loadMore" class="load-more-button">
      <font-awesome-icon :icon="['fas', 'chevron-down']" />
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
      let groupedActivities = this.filteredActivities.reduce((result, activity) => {
        const date = new Date(activity.d_created * 1000);
        const month = `${date.toLocaleString("default", {
          month: "long"
        })}`;

        if (!result[month]) {
          result[month] = [];
        }
        result[month].push(activity);
        return result;
      }, {});
      return groupedActivities;
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
    },

    isFirstActivity(index) {
      return index === 0;
    },

    isLastActivity(index, group, groupIndex) {
      return (
        index === group.length - 1 && groupIndex === Object.keys(this.groupedActivities).length - 1
      );
    }
  }
};
</script>

<style>
h1 {
  text-align: left;
}
.main-container {
  width: 90vw;
  margin-left: auto;
  margin-right: auto;

  .main-title {
    margin-bottom: 40px;
    font-weight: 900;
  }

  .filter-by {
    text-align: left;
    margin-bottom: 10px;
  }

  .filters {
    text-align: left;
    margin-bottom: 1rem;
  }

  .filters button {
    color: #4aa3a4;
    background: none;
    font-weight: bold;
    margin-right: 0.5rem;
    border: 2px solid #4aa3a4;
    border-radius: 5px;
    padding: 7px;
    cursor: pointer;
  }

  .filters .active {
    background-color: #edfdfc;
  }

  .autocomplete-container {
    width: 400px;
    margin: 20px 0;
    .md-field:after {
      height: 0;
    }
    .md-field {
      margin: 0;
      padding: 0;
      &.md-theme-default:before {
        background-color: transparent;
      }
      .md-input-action {
        right: 41px;
      }
    }
    .md-menu {
      padding: 5px;
      border-color: #cccccc;
      border-style: solid;
      border-width: 1px 0 1px 1px;
      border-radius: 5px 0 0 5px;
      align-items: center;

      .md-input {
        color: #757575;
        font-weight: bold;
      }
    }
    .magnifying-glass-container {
      color: white;
      width: 46px;
      background-color: #028081;
      font-size: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #028081;
      border-radius: 0 5px 5px 0;
    }
  }

  .activities-group {
    text-align: left;
    .month {
      position: relative;
      display: inline-block;
      width: 120px;
      text-align: center;
      padding: 5px;
      background-color: #fcf8e5;
      border-radius: 20px;
    }
    .activities-list {
      list-style-type: none;
      padding: 0;
      .activity-item {
        position: relative;
      }
    }
  }
  .load-more-button {
    color: #028083;
    font-weight: bold;
    border: none;
    background: none;
    cursor: pointer;
  }
}

.md-menu-content {
  width: 400px !important;
  max-width: unset !important;
}
</style>
