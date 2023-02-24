<template>
  <el-cascader
    :key="key"
    v-on="$listeners"
    :style="$vnode.data.staticStyle"
    :class="$vnode.data.staticClass"
    :options="innerOptions"
    v-model="innerValue"
    v-bind="$attrs"
    ref="cascader"
    :props="innerProps"
    :separator="separator"
    :placeholder="placeholder"
    @remove-tag="removeTag"
    @expand-change="expandChange"
    @change="handleChange"
    @visible-change="visibleChange"
  >
    <template #default="allprops">
      <div class="label" @click="clickLabel(allprops)">
        <!-- <slot v-bind="allprops">  -->
        {{ allprops.data[innerProps.label] }}
        <!-- </slot> -->
      </div>
    </template>

    <template #empty>
      <template>
        <slot name="empty">
          <li class="el-cascader__empty-text">无匹配数据</li>
        </slot>
      </template>
    </template>
  </el-cascader>
</template>
<script>
import {
  getTreeListAndFormat,
  arrListToTree,
  deepMerge,
  isPromise,
} from "./utils.js";
export default {
  name: "elCascaderPlus",
  computed: {
    isMultiple() {
      return this.innerProps.multiple == true;
    },
  },
  props: {
    maxLevel: {
      type: Number,
      default() {
        return 1000;
      },
    },
    value: {
      type: [Array, String],
      default() {
        return [];
      },
    },
    // 分隔符号
    separator: {
      type: String,
      default() {
        return " / ";
      },
    },
    placeholder: {
      type: String,
      default() {
        return "请选择";
      },
    },
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    props: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  watch: {
    value: {
      async handler(val, oldVal) {
        this.allSingleCheckedArr = [
          ...new Set([...this.allSingleCheckedArr, ...this.innerValue]),
        ];
        // 将回显与弹窗功能分离，互不影响
        if (!this.isPopOpen && this.props.lazy == true) {
          // val长度大于0避免空值触发不回显的bug
          if (Array.isArray(val) == true && val.length) {
            // 新值和内部值长度不一样则直接手动触发getnode，相同时则比对各个值是否一一对应，空值则直接重新渲染
            if (this.innerValue.length != val.length) {
              this.levelChildNodes = [];
              this.isEmitRequestZero = false;
            } else {
              if (this.innerOptions.length) {
                // innerOptions树结构扁平化
                let selectList = await getTreeListAndFormat(
                  JSON.parse(JSON.stringify(this.innerOptions)),
                  this.innerProps.children
                );
                selectList = selectList.map(
                  (opt) => opt[this.innerProps.value]
                );
                this.selectList = selectList;
                const same = [];
                for (const item of val) {
                  if (selectList.includes(item)) {
                    same.push(true);
                  } else {
                    same.push(false);
                  }
                }
                // 如果innerOptions中没有对应选项,回显不正确，则手动触发getnode，
                if (!same.every((v) => v == true)) {
                  this.levelChildNodes = [];
                  this.isEmitRequestZero = false;
                }
              } else {
                // 其他情况对比val判断
                if (this.innerValue.length) {
                  if (val.join("") !== this.innerValue.join("")) {
                    this.levelChildNodes = [];
                    this.isEmitRequestZero = false;
                  }
                } else {
                  this.levelChildNodes = [];
                  this.isEmitRequestZero = false;
                }
              }
            }
            // 赋值完改变innerOptions则会触发自动回显
            // 得到第一次数据变动的同时清空赋值第一层选项启动回显
            // 初次响应到value变化触发第一级回显功能，后面几个会自动触发，其他时候则不触发

            if (!this.isEmitRequestZero) {
              // 此处有可能因为系统默认触发的getnode的的值没返回来导致没0级数据而请求两次0级出现bug
              // 加一个isEmitRequestZero开关参数来避免请求两次0级
              if (!this.levelChildNodes.length) {
                if (this.isMultiple) {
                  // 多选回显处理
                  this.handleMultOpts();
                } else {
                  // 单选处理
                  if (this.innerValue.length) {
                    let valCompare = val.slice(0, -1);
                    //数据没被选过才重新获取options
                    if (
                      !this.allSingleCheckedArr
                        .join()
                        .includes(valCompare.join())
                    ) {
                      this.handleOpts();
                    } else {
                      this.innerValue = JSON.parse(JSON.stringify(val));
                    }
                  } else {
                    this.innerValue = JSON.parse(JSON.stringify(val));
                    this.autoFeedback();
                    // 改变isEmitRequestZero触发第一次0级请求
                    this.isEmitRequestZero = true;
                    this.handleOpts();
                    // this.innerOptions = [];
                  }
                }
              }
            } else {
              if (this.isMultiple) {
                // 多选回显处理
                this.handleMultOpts();
              } else {
                // 单选回显处理
                //数据没被选过才重新获取options
                if (
                  !this.allSingleCheckedArr.join().includes(valCompare.join())
                ) {
                  this.handleOpts();
                } else {
                  this.innerValue = JSON.parse(JSON.stringify(val));
                }
              }
            }
          } else {
            // 触发重新渲染
            this.innerValue = JSON.parse(JSON.stringify(val));
            if (!this.isMultiple) {
              this.autoFeedback();
            }
          }
        } else {
          // 非懒加载直接赋值
          if (this.innerValue.join() != val.join()) {
            this.innerValue = JSON.parse(JSON.stringify(val));
          }
        }
      },
      deep: true,
    },
  },
  data() {
    return {
      key: 0,
      // 所有被选中过的单选值
      allSingleCheckedArr: [],
      // 所有被选中的多选值
      allCheckedArr: [],
      isPopOpen: false,
      isFromOut: true,
      isRemoveTag: false,
      // 自动回显功能开关
      autoFeedBackSwitch: this.props.multiple ? false : true,
      // 回显数组
      inputArr: [],
      // 是否请求0级数据（请求动作）
      isEmitRequestZero: false,
      innerValue: [],
      // 每级对应的当前选项(children)集合
      levelChildNodes: [],
      // 级联懒加载
      innerProps: {
        value: "value",
        label: "label",
        children: "children",
        leaf: "leaf",
        ...this.props,
        lazyLoad: this.getNode,
      },
      innerOptions: this.options,
    };
  },
  created() {
    this.init();
  },
  mounted() {},
  destroyed() {
    this.init();
  },
  methods: {
    // 找到某个树节点进行插入数据操作
    findTreeNode(value, nodes) {
      for (let i = 0; i < this.innerOptions.length; i++) {
        this.findAndInsert(this.innerOptions[i], value, false, nodes);
      }
    },
    // 找到某个树节点，如果节点没有children则添加children数据，有children则返回
    findAndInsert(item, cid, flag = false, nodes) {
      if (item[this.innerProps.value] == cid) {
        flag = true;
      } else {
        flag = false;
      }
      // 找到的节点如果已经有子集则返回
      if (
        flag &&
        item[this.innerProps.children] &&
        item[this.innerProps.children].length
      ) {
        return;
      }
      // 找到的节点如果没有子集则插入子集数据
      else if (
        flag &&
        (!item[this.innerProps.children] ||
          !item[this.innerProps.children].length)
      ) {
        this.$set(item, this.innerProps.children, nodes);
        return;
      }
      // 如果没找到节点则继续查找其他有children的节点
      else if (
        !flag &&
        item[this.innerProps.children] &&
        item[this.innerProps.children].length
      ) {
        for (let i = 0; i < item[this.innerProps.children].length; i++) {
          this.findAndInsert(
            item[this.innerProps.children][i],
            cid,
            false,
            nodes
          );
        }
      }
      // 如果没找到节点且节点无children则返回
      else {
        return;
      }
    },
    // 删除标签
    removeTag(e) {
      this.isRemoveTag = true;
      if (this.props.lazy == true) {
        this.innerProps.lazy = true;
      }
      this.isRemoveTag = false;
      this.$emit("remove-tag", e);
    },
    // 点击标签
    clickLabel(node) {
      if (this.props.lazy == true) {
        // 有子集则不改变lazy状态
        if (
          !node.data[this.innerProps.children] ||
          !node.data[this.innerProps.children].length
        ) {
          this.innerProps.lazy = true;
        } else {
          this.innerProps.lazy = false;
        }
      }
    },

    // 单选回显功能
    async handleOpts() {
      let value = JSON.parse(JSON.stringify(this.value));
      value.pop();
      // 因为获取数据不需要最后一个值，所以去除最后一位
      let valArr = [];
      // 处理值
      valArr = value.map((v, index) => {
        return {
          level: index + 1,
          [this.innerProps.value]: v,
        };
      });
      // 去重
      valArr = valArr.filter(
        (v, index) =>
          index ==
          valArr.findIndex(
            (e) => e[this.innerProps.value] == v[this.innerProps.value]
          )
      );
      this.dealOpts(valArr);
    },
    // 多选回显功能
    async handleMultOpts() {
      let value = JSON.parse(JSON.stringify(this.value));
      let valArr = [];
      // 处理值
      value.forEach((v) => {
        // 因为获取数据不需要最后一个值，所以去除最后一位
        v.pop();
        valArr = valArr.concat(
          v.map((item, index) => {
            return {
              level: index + 1,
              [this.innerProps.value]: item,
            };
          })
        );
      });
      // 去重
      valArr = valArr.filter(
        (v, index) =>
          index ==
          valArr.findIndex(
            (e) => e[this.innerProps.value] == v[this.innerProps.value]
          )
      );
      this.dealOpts(valArr);
    },
    // 获取各层级opt
    dealOpts(valArr) {
      // 先写获取第0级数据的promise
      let optsListPromise = [
        new Promise(async (resolve, reject) => {
          this.props.lazyLoad(
            {
              value: 0,
              level: 0,
            },
            async (result) => {
              result = await this.getResult(result);
              let nodes = result.map((v) => {
                return {
                  ...v,
                  [this.innerProps.value]: v[this.innerProps.value],
                  [this.innerProps.label]: v[this.innerProps.label],
                  [this.innerProps.leaf]: Object.prototype.hasOwnProperty.call(
                    v,
                    this.innerProps.leaf
                  )
                    ? v[this.innerProps.leaf] || 0 >= this.maxLevel
                    : 0 >= this.maxLevel,
                };
              });
              if (!this.innerOptions.length) {
                this.innerOptions = nodes;
              }
              resolve(nodes);
            }
          );
        }),
      ];
      // 其他层级获取
      valArr.forEach((e) => {
        let promise = new Promise(async (resolve, reject) => {
          this.props.lazyLoad(
            {
              value: e[this.innerProps.value],
              level: e.level,
            },
            async (result) => {
              result = await this.getResult(result);
              let nodes = result.map((v) => {
                return {
                  ...v,
                  [this.innerProps.value]: v[this.innerProps.value],
                  [this.innerProps.label]: v[this.innerProps.label],
                  [this.innerProps.leaf]: Object.prototype.hasOwnProperty.call(
                    v,
                    this.innerProps.leaf
                  )
                    ? v[this.innerProps.leaf] || e.level >= this.maxLevel
                    : e.level >= this.maxLevel,
                  parentValue: e[this.innerProps.value],
                };
              });
              resolve(nodes);
            }
          );
        });
        optsListPromise.push(promise);
      });
      Promise.all(optsListPromise).then(async (res) => {
        let optsList = [];
        res.forEach((v, index) => {
          optsList.push(...v);
          if (!this.isMultiple) {
            // 单选把子集nodes直接插入到options中
            if (index != 0) {
              this.findTreeNode(this.value[index - 1], v);
            }
          }
        });
        let treeOptsOrign = JSON.parse(JSON.stringify(this.innerOptions));
        // 数组转树
        let optTree = arrListToTree(JSON.parse(JSON.stringify(optsList)), {
          parentprop: "parentValue",
          valueProp: this.innerProps.value,
          childrenProp: this.innerProps.children,
        });
        // 深度合并
        optTree = Object.keys(optTree).length
          ? JSON.parse(JSON.stringify(deepMerge(treeOptsOrign, optTree)))
          : treeOptsOrign;
        if (Object.keys(optTree).length) {
          //有值的时候再对opt赋值 不赋空值
          // 多选的时候改变options，单选采用直接插入到options中
          if (this.isMultiple) {
            this.innerOptions = optTree;
            this.key++;
          }
          this.$nextTick(() => {
            // 最后在赋值选中项
            this.innerValue = [];
            this.innerValue = JSON.parse(JSON.stringify(this.value));
          });
        }
      });
    },

    // 弹窗显示隐藏，显示的时候关闭自动回显功能，避免选项看起来混乱
    visibleChange(val) {
      this.isFromOut = !val;
      if (this.props.lazy == true) {
        this.innerProps.lazy = true;
      }
      this.isPopOpen = val;
      this.isRemoveTag = false;
      if (val) {
        if (this.isMultiple) {
          let checkedValueArr = JSON.parse(
            JSON.stringify(this.$refs.cascader.checkedValue)
          );
          let valArr = [];
          // 处理值
          checkedValueArr.forEach((v) => {
            valArr = valArr.concat(v);
          });
          // 去重
          this.allCheckedArr = [...new Set([...this.allCheckedArr, ...valArr])];
          this.$nextTick(() => {
            if (checkedValueArr.length) {
              this.innerProps.lazy = false;
            } else {
              // 修复一开始点击不获取数据
              if (this.props.lazy == true) {
                this.innerProps.lazy = true;
              }
            }
          });
        }
      } else {
        if (this.props.lazy == true) {
          this.innerProps.lazy = true;
        }
      }
      if (this.isMultiple) {
        // 因为自动回显功能是针对单选写的，所以多选的时候关闭
        this.autoFeedBackSwitch = false;
        // 多选点击的时候去掉外部响应变化
        this.isFromOut = !val;
      } else {
        this.autoFeedBackSwitch = !val;
      }
      this.$emit("visible-change", val);
    },

    // 初始化
    init() {
      this.levelChildNodes = [];
      this.innerOptions = this.options;
      this.isEmitRequestZero = false;
      // 一开始就已经存在value值的处理，此时watch无响应，更改value值手动触发watch
      if (this.value.length && this.props.lazy == true) {
        // 外部删除value，重新触发watch
        const value = this.value;
        this.$emit("input", []);
        setTimeout(() => {
          this.$emit("input", value);
        }, 50);
      } else {
        // 非懒加载直接赋值
        this.innerValue = this.value;
      }
    },
    // 点击加载下级菜单的时候
    expandChange(val) {
      this.$nextTick(() => {
        if (this.props.lazy == true) {
          this.innerProps.lazy = true;
        }
      });
      this.$emit("expand-change", val);
    },
    async handleChange(value) {
      // 只在数值类型正确的时候执行
      if (Array.isArray(this.innerValue) == true) {
        this.$nextTick(() => {
          if (!this.isFromOut) {
            this.$emit("input", value);
            this.$emit("change", value);
          }
        });
        if (this.props.lazy == true) {
          this.innerProps.lazy = true;
          // 补充单选label,选中值收集
          if (!this.isMultiple) {
            this.allSingleCheckedArr = [
              ...new Set([...this.allSingleCheckedArr, ...value]),
            ];
            // this.innerProps.lazy = false;
            value.forEach((v, index) => {
              this.levelChildNodes.forEach((e) => {
                e.forEach((item) => {
                  if (item.value == v) {
                    this.$set(this.inputArr, index, item.label);
                  }
                });
              });
            });
            this.autoFeedback();
          }
          //  多选
          if (this.isMultiple) {
            let arr = [];
            value.forEach((v) => {
              arr.push(...v);
            });
            arr = [...new Set(arr)];
            if (arr.every((v) => this.allCheckedArr.includes(v))) {
              // 如果已有选项则关闭lazy，修复取消点击依然全选
              this.$nextTick(() => {
                // 1、删除标签会出现清空已选项的情况修复，2、重复点击选择选中失效修复
                if (
                  this.isRemoveTag == true ||
                  this.innerProps.checkStrictly == true
                ) {
                  this.innerProps.lazy = true;
                  this.isRemoveTag == false;
                } else {
                  this.innerProps.lazy = false;
                }
              });
            } else {
              if (this.props.lazy == true) {
                this.innerProps.lazy = true;
              }
            }
          }
        }
      }
    },
    async getNode(node, resolve) {
      const { level, label } = node;
      // 叶子节点不请求直接resolve
      if (node.data && node.data[this.innerProps.leaf]) {
        resolve();
      }
      // 多选和单选分开处理
      if (this.isMultiple) {
        if (
          level == 0 ||
          (node.data && !node.data[this.innerProps.children]) ||
          (node.data && !node.data[this.innerProps.children].length)
        ) {
          this.props.lazyLoad(node, async (result) => {
            result = await this.getResult(result);
            let nodes = result.map((v) => {
              return {
                ...v,
                [this.innerProps.value]: v[this.innerProps.value],
                [this.innerProps.label]: v[this.innerProps.label],
                [this.innerProps.leaf]: Object.prototype.hasOwnProperty.call(
                  v,
                  this.innerProps.leaf
                )
                  ? v[this.innerProps.leaf] || level >= this.maxLevel
                  : level >= this.maxLevel,
                parentValue: node.value,
              };
            });
            this.$nextTick(() => {
              resolve(nodes);
            });
          });
        } else {
          resolve();
        }
      } else if (!this.isMultiple) {
        // 保存label回显用
        if (!this.isMultiple && label) {
          this.$set(this.inputArr, [level - 1], label);
        }
        // 只在数值类型正确的时候加载下拉数据
        if (Array.isArray(this.innerValue) == true) {
          let nodes = [];
          // 判断是否获取api数据，避免数据重复
          // 0级的时候有innerOptions则用opt数值，没有则通过事件调用数据
          if (level == 0 && this.innerOptions.length) {
            // 赋值完下拉再赋值选中数据
            let innerOptions = [];
            innerOptions =
              this.levelChildNodes.length &&
              Object.keys(this.levelChildNodes[0]).length
                ? JSON.parse(JSON.stringify(this.levelChildNodes[0]))
                : JSON.parse(JSON.stringify(this.innerOptions));

            // 关键在于这个this.$nextTick,在页面加载完成后再回填子选项则可以自动响应下一级，
            // 没加则无法响应回显下一级
            this.autoFeedBackSwitch &&
              this.autoFeedback() &&
              this.getLabel(innerOptions, level);
            this.$nextTick(() => {
              resolve(innerOptions);
            });
          } else if (
            level == 0 &&
            !this.innerOptions.length &&
            this.levelChildNodes.length &&
            Object.keys(this.levelChildNodes[0]).length
            // 如果有第0级数据则直接赋值减少一次请求
          ) {
            // 赋值完下拉再赋值选中数据可以引起请求下一级数据
            let innerOptions = [];
            innerOptions =
              this.levelChildNodes.length &&
              Object.keys(this.levelChildNodes[0]).length
                ? JSON.parse(JSON.stringify(this.levelChildNodes[0]))
                : [];

            this.autoFeedBackSwitch &&
              this.autoFeedback() &&
              this.getLabel(innerOptions, level);
            this.$nextTick(() => {
              resolve(innerOptions);
            });
          } else if (level == 0 && !this.innerOptions.length) {
            // 调用当前选中项的下级数据并填充
            // isEmitRequestZero限制第一次默认请求，第一次请求交给watch中的vulue值变化来处理
            // 如果是value初始值为[]也请求
            if (this.isEmitRequestZero || !this.value.length) {
              this.props.lazyLoad(node, async (result) => {
                result = await this.getResult(result);
                nodes = this.dealResult(result, level);
                // 因为第一次启动总会调用一次getNode,所以0级数据存起来可以重复利用
                this.levelChildNodes[0] = JSON.parse(JSON.stringify(nodes));
                this.autoFeedBackSwitch &&
                  this.autoFeedback() &&
                  this.getLabel(nodes, level);
                this.$nextTick(() => {
                  resolve(nodes);
                });
              });
            }
          } else {
            // 非0级处理
            // 当前被点击的选项已有children则不再获取下一级nodes,直接resolve
            if (
              node.data &&
              node.data[this.innerProps.children] &&
              node.data[this.innerProps.children].length
            ) {
              if (
                this.levelChildNodes.length &&
                this.levelChildNodes[level - 1] &&
                Object.keys(this.levelChildNodes[level - 1]).length
              ) {
                this.autoFeedBackSwitch &&
                  this.autoFeedback() &&
                  this.getLabel(this.levelChildNodes[level], level);
              }
              resolve();
            } else {
              // 非0级点击下级无数据时
              this.props.lazyLoad(node, async (result) => {
                result = await this.getResult(result);
                nodes = this.dealResult(result, level);
                this.levelChildNodes[level] = nodes;
                this.autoFeedBackSwitch &&
                  this.autoFeedback() &&
                  this.getLabel(nodes, level);
                // 通过调用resolve将子节点数据返回，通知组件数据加载完成
                this.$nextTick(() => {
                  resolve(nodes);
                });
              });
            }
          }
        }
      } else {
        resolve();
      }
    },
    async getResult(result) {
      if (typeof result === "function") {
        try {
          result = await result();
          return result;
        } catch (err) {
          console.log(err);
        }
      } else if (isPromise(result)) {
        try {
          result = await result;
          return result;
        } catch (err) {
          console.log(err);
        }
      } else {
        return result;
      }
    },
    dealResult(result, level) {
      result = result.map((v) => {
        return {
          ...v,
          [this.innerProps.value]: v[this.innerProps.value],
          [this.innerProps.label]: v[this.innerProps.label],
          [this.innerProps.leaf]: Object.prototype.hasOwnProperty.call(
            v,
            this.innerProps.leaf
          )
            ? v[this.innerProps.leaf] || level >= this.maxLevel
            : level >= this.maxLevel,
        };
      });
      return result;
    },
    // 从获取的nodes节点中得到当前level的选项值对应的label
    getLabel(nodes, level) {
      let input = nodes.find((node) => this.innerValue[level] === node.value);
      input = input ? input.label : "";
      if (input) {
        this.$set(this.inputArr, level, input);
      }
    },
    // 单选提前回显,可提高回显速度
    autoFeedback() {
      // 不关联的时候因为本身就有实时响应功能无需手动回显
      let inputArr = JSON.parse(JSON.stringify(this.inputArr));
      if (this.$refs && this.$refs.cascader && !this.props.checkStrictly) {
        this.$nextTick(() => {
          this.$refs.cascader.inputValue = inputArr.join(this.separator);
        });
      }
    },
  },
};
</script>
<style scoped>
.label {
  width: 100%;
}
</style>
