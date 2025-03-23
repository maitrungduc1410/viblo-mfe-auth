import { createRouter, createWebHistory } from "vue-router";

import Foo from "./components/appview/Foo.vue";
import Bar from "./components/appview/Bar.vue";

const routes = [
  { path: "/foo", component: Foo },
  { path: "/bar", component: Bar },
  { path: "/:pathMatch(.*)*", redirect: "/foo" },
];

const router = createRouter({
  history: createWebHistory('/main/vue-app'),
  routes,
  
});

export default router;
