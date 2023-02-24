// 递归为选项列表
const changeToSelectOpt = (data, childrenProp) => {
  // 选项分离为有children和无children
  let hasChild = false;
  let filterHasChildTreeList = [];
  let filterNoChildTreeList = [];
  filterNoChildTreeList = data.filter((select) => {
    if (
      (select && !select[childrenProp || "children"]) ||
      (select &&
        select[childrenProp || "children"] &&
        !select[childrenProp || "children"].length)
    ) {
      return true;
    } else {
      hasChild = true;
      return false;
    }
  });

  filterHasChildTreeList = data.filter((select) => {
    if (
      (select && !select[childrenProp || "children"]) ||
      (select &&
        select[childrenProp || "children"] &&
        !select[childrenProp || "children"].length)
    ) {
      return false;
    } else {
      hasChild = true;
      return true;
    }
  });
  if (hasChild) {
    let tempTreeList = filterHasChildTreeList.map((select) => {
      let obj = {
        ...select,
      };
      delete obj[childrenProp || "children"];
      // 父子处理为同一级
      return [obj].concat(
        changeToSelectOpt(select[childrenProp || "children"])
      );
    });
    // 格式化处理
    let resultTreeList = [].concat(...tempTreeList);
    // 过滤好的无children时的select与处理完的父子集select拼接返回
    return resultTreeList.concat(filterNoChildTreeList);
  } else {
    // 无children时返回过滤好的的无children选项
    return filterNoChildTreeList;
  }
};

// 获取选项列表
export const getTreeListAndFormat = async (treeList, childrenProp) => {
  let selectList = [];

  let data = [];
  if (treeList && Object.keys(treeList).length) {
    data = treeList || [];
  }
  if (data && data.length) {
    selectList = changeToSelectOpt(data, childrenProp);
  }

  return selectList;
};

// 数组转树
export const arrListToTree = (
  data,
  { parentprop, valueProp, childrenProp }
) => {
  let result = [];
  let map = {};
  data.forEach((item) => {
    map[item[valueProp || "value"]] = item;
  });
  data.forEach((item) => {
    let parent = map[item[parentprop] || "parentId"];
    if (parent) {
      (parent[childrenProp] || (parent[childrenProp || "children"] = [])).push(
        item
      );
    } else {
      result.push(item);
    }
  });
  return result;
};

// 深度合并
export const deepMerge = (a, b) => {
  let k;
  for (k in b) {
    a[k] =
      a[k] && a[k].toString() === "[object Object]"
        ? deepMerge(a[k], b[k])
        : (a[k] = b[k]);
  }
  return a;
};

export const isPromise = (val) => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};

export const isObject = (val) => {
  return typeof val === "object";
};
export const isFunction = (val) => {
  return typeof val === "function";
};
