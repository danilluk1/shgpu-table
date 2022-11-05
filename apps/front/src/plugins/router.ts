import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  routes: [
    {
      path: "/",
      component: () => import("../pages/Home.vue"),
    },
    {
      path: "/table",
      component: () => import("../pages/Table.vue"),
    },
    // {
    //   path: '/donate',
    //   c
    // }
    {
      name: "404",
      path: "/pathMatch(.*)*",
      component: () => import("../pages/NotFound.vue"),
    },
  ],
  history: createWebHistory(),
});