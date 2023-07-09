import Vue from "vue";
import VueRouter from "vue-router";
import V1 from "../views/V1.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "",
    redirect: "/v1"
  },
  {
    path: "/v1",
    name: "V1",
    component: V1
  },
  {
    path: "/v2",
    name: "V2",
    component: () => import(/* webpackChunkName: "v2" */ "../views/V2.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
