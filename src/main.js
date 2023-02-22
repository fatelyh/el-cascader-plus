import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { Cascader } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(Cascader);
// import elCascaderPlus from "el-cascader-plus";
// Vue.use(elCascaderPlus);
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
