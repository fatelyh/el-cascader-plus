import elCascaderPlus from "@/elementPlugin/elCascaderPlus/index";

// 为组件添加 install 方法，用于按需引入
elCascaderPlus.install = function (Vue) {
  Vue.component(elCascaderPlus.name, elCascaderPlus);
};

// const components = [elCascaderPlus];
/*
 *  install的固定写法
 */
// const install = (Vue) => {
//   if (install.installed) return; // 判断是否安装注册过
//   install.installed = true;
//   components.forEach((component) => Vue.component(component.name, component)); // 遍历并注册组件
// };

// if (typeof window !== "undefined" && window.Vue) {
//   install(window.Vue); // window中有Vue时去install()
// }

// export default {
//   install,
//   ...components,
// };
export default elCascaderPlus;
