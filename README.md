# el-cascader-plus
>经常碰到懒加载不回显的问题，使用起来很不方便，于是花了些时间二次开发了这个组件，希望对遇到相同问题的人有帮助。

> el-cascader-plus基于 element-ui 级联二次封装，弥补了原 element-ui 级联组件懒加载经常无法回显的不足，用法与原级联组件一致。

> 使用前请确保安装了 vue 和 element ui （或者已单独按需引入 element ui 的级联 Cascader）

>版本推荐 "vue": "^2.6.11","element-ui": "^2.15.13",

配置参数同 ElementUI 的 Cascader 级联选择器，可参考其文档[ElementUI 官方文档](https://element.eleme.cn/#/zh-CN/component/cascader)


新增的属性
|参数|说明|类型|可选值|默认值|是否必须|
|---|---|---|---|---|---|
|maxLevel|懒加载最大层级，最小值0 |Number|整数|1000|否|


优化点：

>  1、修复原组件懒加载单选数据加载延迟的情况下不响应数据变动、不触发回显的问题

>  2、修复原组件懒加载多选不响应数据变动、不触发回显的问题
 
>  3、单选懒加载做了回显速度优化，比原组件单选懒加载回显速度会快一些
 
>  4、新增一个prop属性：maxLevel,可限制懒加载最大层级，整数，最小值0,默认值1000

>  5、props中的lazyLoad在原基础上对resolve做了一点小修改。


```javascript

      props{

        lazy:true,

        lazyLoad:this.getNode

      }

      getNode(node, resolve) {

     //根据node获取子集操作

      resolve(params)

   }

// 其中params可为普通数据和promise(要有resolve值)

```

## 效果预览

![image](https://upload-images.jianshu.io/upload_images/28792289-21b26d3f58ec10dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## install 安装

```shell

npm i el-cascader-plus --save

```

## 使用

在 main.js 中写入下面的代码就可以全局使用

```javascript

import elCascaderPlus from "el-cascader-plus";

Vue.use(elCascaderPlus);

```

在组件中单独使用

```javascript

import elCascaderPlus from "el-cascader-plus";

export default {

  name: "demo",

  components: {

    elCascaderPlus,

  },

};

```

### 代码示例

```javascript

<template>

  <div class="demo">

    <div class="mg20 title">el-cascader-plus</div>

    <div class="mg20">

      <div class="mg20">el-cascader-plus单选</div>

      <el-cascader-plus

        style="width: 400px"

        ref="cascader"

        v-model="value"

        @change="change"

        :options="options"

      ></el-cascader-plus>

    </div>

    <div class="mg20">

      <div class="mg20">el-cascader-plus单选不关联</div>

      <el-cascader-plus

        style="width: 400px"

        ref="cascader"

        v-model="value1"

        :props="{ checkStrictly: true }"

        @change="change"

        :options="options"

      ></el-cascader-plus>

    </div>

    <div class="mg20">

      <div class="mg20">el-cascader-plus多选</div>

      <el-cascader-plus

        style="width: 400px"

        ref="cascader"

        v-model="multipleValue"

        :props="{ multiple: true }"

        @change="change"

        :options="options"

      ></el-cascader-plus>

    </div>

    <div class="mg20">

      <div class="mg20">el-cascader-plus多选不关联</div>

      <el-cascader-plus

        style="width: 400px"

        ref="cascader"

        v-model="multipleValue1"

        :props="{ multiple: true, checkStrictly: true }"

        @change="change"

        :options="options"

      ></el-cascader-plus>

    </div>

    <div class="mg20">

      <div class="mg20">el-cascader-plus懒加载单选</div>

      <el-cascader-plus

        style="width: 400px"

        ref="cascader"

        v-model="value"

        :props="props"

        @change="change"

      ></el-cascader-plus>

    </div>

    <div class="mg20">

      <div class="mg20">el-cascader-plus懒加载单选不关联</div>

      <el-cascader-plus

        style="width: 400px"

        ref="cascader"

        v-model="value1"

        :props="{ ...props, checkStrictly: true }"

        @change="change"

      ></el-cascader-plus>

    </div>

    <div class="mg20">

      <div class="mg20">el-cascader-plus懒加载多选</div>

      <el-cascader-plus

        style="width: 400px"

        ref="cascader"

        v-model="multipleValue"

        :props="{ ...props, multiple: true }"

        @change="change"

      ></el-cascader-plus>

    </div>

    <div class="mg20">

      <div class="mg20">el-cascader-plus懒加载多选不关联</div>

      <el-cascader-plus

        style="width: 400px"

        ref="cascader"

        v-model="multipleValue1"

        :props="{ ...props, multiple: true, checkStrictly: true }"

        @change="change"

      ></el-cascader-plus>

    </div>

    <div class="mg20">

      <div class="mg20">el-cascader-plus懒加载设置maxLevel为1</div>

      <el-cascader-plus

        :maxLevel="1"

        style="width: 400px"

        v-model="value2"

        :props="props"

      ></el-cascader-plus>

    </div>

  </div>

</template>

<script>

import elCascaderPlus from "el-cascader-plus";

export default {

  name: "demo",

  components: {

    elCascaderPlus,

  },

  data() {

    return {

      res: [],

      // 级联懒加载

      props: {

        multiple: false,

        lazy: true,

        lazyLoad: this.getNode,

      },

      value: [17, 18, 19],

      value1: [17, 18, 19],

      value2: [],

      multipleValue: [[17, 18, 19]],

      multipleValue1: [[17, 18, 19]],

      options: [

        {

          value: 1,

          label: "东南",

          children: [

            {

              value: 2,

              label: "上海",

              children: [

                {

                  value: 3,

                  label: "普陀",

                  leaf: true,

                },

                {

                  value: 4,

                  label: "黄埔",

                  leaf: true,

                },

                {

                  value: 5,

                  label: "徐汇",

                  leaf: true,

                },

              ],

            },

            {

              value: 7,

              label: "江苏",

              children: [

                {

                  value: 8,

                  label: "南京",

                  leaf: true,

                },

                {

                  value: 9,

                  label: "苏州",

                  leaf: true,

                },

                {

                  value: 10,

                  label: "无锡",

                  leaf: true,

                },

              ],

            },

            {

              value: 12,

              label: "浙江",

              children: [

                {

                  value: 13,

                  label: "杭州",

                  leaf: true,

                },

                {

                  value: 14,

                  label: "宁波",

                  leaf: true,

                },

                {

                  value: 15,

                  label: "嘉兴",

                  leaf: true,

                },

              ],

            },

          ],

        },

        {

          value: 17,

          label: "西北",

          children: [

            {

              value: 18,

              label: "陕西",

              children: [

                {

                  value: 19,

                  label: "西安",

                  leaf: true,

                },

                {

                  value: 20,

                  label: "延安",

                  leaf: true,

                },

              ],

            },

            {

              value: 21,

              label: "新疆维吾尔族自治区",

              children: [

                {

                  value: 22,

                  label: "乌鲁木齐",

                  leaf: true,

                },

                {

                  value: 23,

                  label: "克拉玛依",

                  leaf: true,

                },

              ],

            },

          ],

        },

      ],

    };

  },

  watch: {},

  methods: {

    change(e) {

      console.log(e);

    },

    // 获取当前点击节点的子node,根据node数据和后端交互，此处为模拟后端请求

    async getNode(node, resolve) {

      const {

        level, //层级

        value,

        data,

      } = node;

      // 模拟后端请求

      // 0级处理

      if (level == 0) {

        let options = JSON.parse(JSON.stringify(this.options));

        let nodes = options.map((v, index) => {

          delete v.children;

          return {

            ...v,

          };

        });

        setTimeout(() => resolve(nodes), 500);

      } else {

        this.res = [];

        let options = JSON.parse(JSON.stringify(this.options));

        for (let i = 0; i < options.length; i++) {

          this.findChildren(options[i], value);

        }

        // 去除子集的children

        let nodes = [];

        if (this.res.length) {

          nodes = this.res.map((v, index) => {

            delete v.children;

            return {

              ...v,

            };

          });

        }

        setTimeout(() => resolve(nodes), 500);

      }

    },

    //  找到某个树节点并返回子集

    findChildren(item, cid, flag = false) {

      if (item.value == cid) {

        flag = true;

      }

      if (flag && item.children && item.children.length) {

        this.res = [];

        this.res = item.children;

      }

      if (!item.children) {

        return;

      } else {

        item.children.forEach((child) => {

          this.findChildren(child, cid, false);

        });

      }

    },

  },

};

</script>

<style>

.mg20 {

  margin-top: 20px;

}

.title {

  font-weight: bold;

  font-size: 26px;

}

</style>

```
