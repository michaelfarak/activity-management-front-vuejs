<template>
  <div
    v-if="!hidden"
    class="activity"
    :class="{ 'first-activity': isFirstActivity, 'last-activity': isLastActivity }"
  >
    <div class="left-side">
      <div class="icon-container">
        <img :src="`${publicPath}${parsedIconPath}`" class="icon" alt="Icon" />
        <div v-if="activity.product === 'bpjr'" class="jr-sticker">Jr.</div>
      </div>
      <div class="details">
        <span class="topic-name">{{ activityName }}</span>
        <span class="date">{{ activity.d_created | formatDate }}</span>
      </div>
    </div>
    <div class="right-side">
      <div v-if="activity.score" class="score">
        <span>Score </span>
        <span style="font-weight: 900;"> {{ activity.score }}/{{ activity.possible_score }}</span>
      </div>
      <button v-if="isViewable" class="view-button" @click="openModal">
        <font-awesome-icon :icon="['fas', 'eye']" />
        View work
      </button>
      <button @click="toggleHidden" class="hide-button">
        <font-awesome-icon :icon="['fas', 'trash']" />
      </button>
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-content">
            <span class="close" @click="closeModal">&times;</span>
            <div class="activity-details">
              <div class="icon-container">
                <img :src="`${publicPath}${parsedIconPath}`" class="icon" alt="Icon" />
                <div v-if="activity.product === 'bpjr'" class="jr-sticker">Jr.</div>
              </div>
              <span class="topic-name">{{ activityName }}</span>
              <span class="date">{{ activity.d_created | formatDate }}</span>
            </div>

            <p class="comment">{{ activity.comment }}</p>
            <div v-if="activity.score" class="score">
              <span>Score </span>
              <span style="font-weight: 900;"
                >{{ activity.score }}/{{ activity.possible_score }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    activity: Object,
    isFirstActivity: Boolean,
    isLastActivity: Boolean,
    activityName: String,
    isViewable: Boolean,
    hidden: Boolean
  },
  data() {
    return {
      parsedIconPath: this.activity.topic_data.icon_path.substring(1),
      publicPath: process.env.BASE_URL,
      dateString: this.activity.d_created,
      showModal: false
    };
  },

  filters: {
    formatDate(value) {
      const date = new Date(value * 1000);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      let hour = date.getHours();
      const minute = date.getMinutes();
      const period = hour >= 12 ? "pm" : "am";
      hour = hour % 12 || 12;
      return `${month} ${day}, ${year} • ${hour}:${minute.toString().padStart(2, "0")}${period}`;
    }
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    toggleHidden() {
      this.$emit("toggleHidden");
    }
  }
};
</script>

<style scoped>
.activity {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  border: 1px solid #cccccc;
  border-radius: 5px;
  justify-content: space-between;
  padding: 10px;
}

.first-activity::before {
  content: "";
  position: absolute;
  left: 60px;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  height: 14px;
  width: 1px;
  background-color: #cccccc;
  top: -14px;
}
.activity::after {
  content: "";
  position: absolute;
  left: 60px;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  height: 14px;
  width: 1px;
  background-color: #cccccc;
}

.activity::after {
  bottom: -14px;
}

.last-activity::after {
  display: none;
}

.left-side {
  display: flex;
  align-items: center;
  height: 70px;
}

.right-side {
  display: flex;

  .view-button,
  .hide-button {
    margin: 0 10px;
    color: #028083;
    font-weight: bold;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 5px;
  }

  .view-button:hover,
  .hide-button:hover {
    background-color: #add8e6;
  }
}

.details {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}

.topic-name {
  font-weight: 900;
}
.date {
  font-size: smaller;
}
.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  background-color: #05cbcb;
  border-radius: 50%;
  position: relative;

  .icon {
    width: 35px;
    height: 35px;
  }

  .jr-sticker {
    border-radius: 50%;
    font-weight: 500;
    font-size: 17px;
    background-color: #ffcc67;
    transform: translateY(50%);
    position: absolute;
    right: -7px;
    bottom: 8px;
    padding: 2px;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;

  .modal {
    background-color: #fff;
    padding: 20px;
    border: 4px solid #a9a9a9;
    overflow: auto;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    transform: translateY(100%);
    width: 60%;
    height: 30vh;
    border-radius: 10px;

    .modal-content {
      .activity-details {
        display: flex;
        flex-direction: column;
        align-items: center;
        .icon-container {
          width: 60px;
          height: 60px;
          .icon {
            width: 40px;
            height: 40px;
          }
        }
        .topic-name {
          font-size: 30px;
          font-weight: 900;
          margin: 15px;
        }
        .date {
          font-size: 14px;
        }
      }
      .comment {
        font-size: 26px;
        font-weight: 500;
        float: left;
      }
      .score {
        font-size: 22px;
        position: absolute;
        bottom: 15px;
      }
      .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        border: 3px solid #aaa;
        border-radius: 50%;
        padding: 2px;
      }
    }
  }
}

.score {
  color: #028083;
}

.details {
  flex: 1;
}

h3 {
  margin-top: 0;
}
</style>
