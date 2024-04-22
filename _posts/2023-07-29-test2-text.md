---
title: 浅谈 Web Storage
author: xuejingpan
date: 2019-08-10 20:57:01 +0800
categories: [前端, 浏览器]
tags: [localStorage, sessionStorage]
pin: false
---
- 一、 简介

- 二、localStorage 和 sessionStorage

- - 2.1、区别
  - 2.2、浏览器兼容性

- 三、使用说明

- - 3.1、API介绍
  - 3.2、浏览器查看
  - 3.3、监听

- 四、存储

- - 4.1、存储容量
  - 4.2、存储性能

- 五、应用

- - 5.1、使用习惯记录
  - 5.2、首次打开提示
  - 5.3、减少重复访问接口

- 六、总结

## 一、 简介

浏览器本地存储是指浏览器提供的一种机制，允许 Web 应用程序在浏览器端存储数据，以便在用户下次访问时可以快速获取和使用这些数据。一共两种存储方式：localStorage 和 sessionStorage。下面介绍下两种缓存的特性和在内部平台的一些应用。

## 二、localStorage 和 sessionStorage

### 2.1、区别

localStorage 和 sessionStorage 的主要区别是生命周期，具体区别如下：

|          | localStorage                                     | sessionStorage                         |
| :------- | :----------------------------------------------- | :------------------------------------- |
| 生命周期 | 持久化存储：除非自行删除或清除缓存，否则一直存在 | 会话级别的存储：浏览器标签页或窗口关闭 |
| 作用域   | 相同浏览器，同域名，不同标签，不同窗口           | 相同浏览器，同域名，同源窗口           |
| 获取方式 | window.localStorage                              | window.sessionStorage                  |
| 存储容量 | 5M                                               | 5M                                     |

容量限制的目的是防止滥用本地存储空间，导致用户浏览器变慢。

### 2.2、浏览器兼容性

1）现在的浏览器基本上都是支持这两种 Storage 特性的。各浏览器支持版本如下：

|                | Chrome | Firefox | IE   | Opera | Safari | Android | Opera Mobile | Safari Mobile |
| :------------- | :----- | :------ | :--- | :---- | :----- | :------ | :----------- | :------------ |
| localStorage   | 4      | 3.5     | 8    | 10.5  | 4      | 2.1     | 11           | iOS 3.2       |
| sessionStorage | 5      | 2       | 8    | 10.5  | 4      | 2.1     | 11           | iOS 3.2       |

2）如果使用的是老式浏览器，比如Internet Explorer 6、7 或者其他，就需要在使用前检测浏览器是否支持本地存储或者是否被禁用。以 localStorage 为例：

```js
if(window.localStorage){
  alert("浏览器支持 localStorage");
} else {
  alert("浏览器不支持 localStorage");
}
```

3）某些浏览器版本使用过程中，会出现 Storage 不能正常使用的情况，记得添加 try/catch。以 localStorage 为例：

```js
if(window.localStorage){
  try {
    localStorage.setItem("username", "name");
    alert("浏览器支持 localStorage");
  } catch (e) {
    alert("浏览器支持 localStorage 后不可使用");
  }
} else {
  alert("浏览器不支持 localStorage");
}
```

## 三、使用说明

### 3.1、API介绍

localStorage 和 sessionStorage 提供了相同的方法进行存储、检索和删除。常用的方法如下：

1. 设置数据：setItem(key, value)

存储的值可以是字符串、数字、布尔、数组和对象。对象和数组必须转换为 string 进行存储。JSON.parse() 和 JSON.stringify() 方法可以将数组、对象等值类型转换为字符串类型，从而存储到 Storage 中；

```js
localStorage.setItem("username", "name"); // "name"
localStorage.setItem("count", 1); // "1"
localStorage.setItem("isOnline", true); // "true"
sessionStorage.setItem("username", "name");
// user 存储时，先使用 JSON 序列化，否则保存的是[object Object]
const user = { "username": "name" };
localStorage.setItem("user", JSON.stringify(user));
sessionStorage.setItem("user", JSON.stringify(user));
```

eg：数据没有序列化，导致保存的数据异常![图片](https://mmbiz.qpic.cn/mmbiz_png/DicJKAuVt0L6cWcl4ib6zXzicKH5lmdFHCfDQ9kZnnZsm6ibfZVPyHrUbicp90Uqlliba66y6r2JreFBsicDafeFeicsWw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

1. 获取数据：getItem(key)

如果 key 对应的 value 获取不到，则返回值是 null；

```js
const usernameLocal = localStorage.getItem("username");
const usernameSession = sessionStorage.getItem("username");
// 获取到的数据为string，使用时反序列化数据js
const userLocal = JSON.parse(localStorage.getItem("user"));
const userSession = JSON.parse(sessionStorage.getItem("user"));
```

1. 删除数据：removeItem(key)；

```js
localStorage.removeItem("username");
sessionStorage.removeItem("username");
```

1. 清空数据：clear()；

```js
localStorage.clear();
sessionStorage.clear();
```

1. 在不确定是否存在 key 的情况下，可以使用 hasOwnProperty() 进行检查;

```js
localStorage.hasOwnProperty("userName"); // true
sessionStorage.hasOwnProperty("userName"); // false
```

1. 当然，也可以使用 Object.keys() 查看所有存储数据的键;

```js
Object.keys(localStorage); // ['username']
Object.keys(sessionStorage);
```

### 3.2、浏览器查看

本地存储的内容可以在浏览器中直接查看，以 Chrome 为例，按住键盘 F12 进入开发者工具后，选择 Application，然后就能在左边 Storage 列表中找到 localStorage 和 sessionStorgae。![图片](https://mmbiz.qpic.cn/mmbiz_png/DicJKAuVt0L6cWcl4ib6zXzicKH5lmdFHCfS92ibZh9JJtG3icXLaafBgKJUQDZLJkjgdGXeYggYDibia9ticxmE9icTfjQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 3.3、监听

当存储的数据发生变化时，其他页面通过监听 storage 事件，来获取变更前后的值，以及根据值的变化来处理页面的展示逻辑。

JS 原生监听事件，只能够监听同源非同一个页面中的 storage 事件，如果想监听同一个页面的，需要改写原生方法，抛出自定义事件来监听。具体如下：

1. 监听同源非同一个页面

直接在其他页面添加监听事件即可。

eg：同域下的 A、B 两个页面，A 修改了 localStorage，B 页面可以监听到 storage 事件。

```
window.addEventListener("storage", () => {
  // 监听 username 值变化
  if (e.key === "username") {
    console.log("username 旧值：" + e.oldValue + "，新值：" + e.newValue);
  }
})
```

注：

- 当两次 setItem 更新的值一样时，监听方法是不会触发的；
- storage 事件只能监听到 localStorage 的变化。

1. 监听同一个页面

重写 Storage 的 setItem 事件，同理，也可以监听删除事件 removeItem 和获取事件 getItem。

```
(() => {
  const originalSetItem = localStorage.setItem;
  // 重写 setItem 函数
  localStorage.setItem = function (key, val) {
    let event = new Event("setItemEvent");
    event.key = key;
    event.newValue = val;
    window.dispatchEvent(event);
    originalSetItem.apply(this, arguments);
  };
})();

window.addEventListener("setItemEvent", function (e) {
  // 监听 username 值变化
  if (e.key === "username") {
    const oldValue = localStorage.getItem(e.key);
    console.log("username 旧值：" + oldValue + "，新值：" + e.newValue);
  }
});
```

## 四、存储

浏览器默认能够存储 5M 的数据，但实际上，浏览器并不会为其分配特定的存储空间，而是根据当前浏览器的空闲空间来判断能够分配多少存储空间。

### 4.1、存储容量

可以使用 Storage 的 length 属性，对存储容量进行测算，以 localStorage 为例：

```
let str = "0123456789";
let temp = "";
// 先生成一个 10KB 的字符串
while (str.length !== 10240) {
  str = str + "0123456789";
}
// 清空
localStorage.clear();
// 计算总量
const computedTotal = () => {
  return new Promise((resolve) => {
    // 往 localStorage 中累积存储 10KB
    const timer = setInterval(() => {
      try {
        localStorage.setItem("temp", temp);
      } catch (e) {
        // 报错说明超出最大存储
        resolve(temp.length / 1024);
        clearInterval(timer);
        // 统计完记得清空
        localStorage.clear();
      }
      temp += str;
    }, 0);
  });
};
// 计算使用量
const computedUse = () => {
  let cache = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      cache += localStorage.getItem(key).length;
    }
  }
  return (cache / 1024).toFixed(2);
};

(async () => {
  const total = await computedTotal();
  let use = "0123456789";
  for (let i = 0; i < 1000; i++) {
    use += "0123456789";
  }
  localStorage.setItem("use", use);
  const useCache = computedUse();

  console.log(`最大容量${total}KB`);
  console.log(`已用${useCache}KB`);
  console.log(`剩余可用容量${total - useCache}KB`);
})();
```

可见在 Chrome 浏览器下，localStorage 有 5M 容量。![图片](https://mmbiz.qpic.cn/mmbiz_png/DicJKAuVt0L6cWcl4ib6zXzicKH5lmdFHCfm9n4KwmvIvbKicvXQqGm98icJeCz7Picb27RHxsCcEL4U8xfVQ7DVBkTQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 4.2、存储性能

在某些特殊场景下，需要存储大数据，为了更好的利用 Storage 的存储空间，可以采取以下解决方案，但不应该过于频繁地将大量数据存储在 Storage 中，因为在写入数据时，会对整个页面进行阻塞（不推荐这种方式）。

1. 压缩数据

可以使用数据压缩库对 Storage 中的数据进行压缩，从而减小数据占用的存储空间。

eg：使用 lz-string 库的 compress() 函数将数据进行压缩，并将压缩后的数据存储到 localStorage 中。

```
const LZString = require("lz-string");
const data = "This is a test message";
// 压缩
const compressedData = LZString.compress(data);
localStorage.setItem("test", compressedData);
// 解压
const decompressedData = LZString.decompress(localStorage.getItem("test"));
```

1. 分割数据

将大的数据分割成多个小的片段存储到 Storage 中，从而减小单个数据占用的存储空间。

eg：将用户数据分割为单项存储到 localStorage 中。

```
for (const key in userInfo) {
  localStorage.setItem(key, userInfo[key]);
}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/DicJKAuVt0L6cWcl4ib6zXzicKH5lmdFHCfvLzv4ibkCeXXIR3zftHOzXjIOWibvOCCpgTLiaZbfaU5OP778qm7XNWRQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

1. 取消不必要的数据存储

可以在代码中取消一些不必要的数据存储，从而减小占用空间。

eg：只存储用到的用户名、公司主体和后端所在环境字段信息。

```
for (const key in userInfo) {
  if (["userName", "legalEntityName", "isOnline"].includes(key)) {
    localStorage.setItem(key, userInfo[key]);
  }
}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/DicJKAuVt0L6cWcl4ib6zXzicKH5lmdFHCflaK6xkKSt1iaDErww8D5ghzZLQwwXYriaHR8vX73s3Ws8UOQOmLDlOlQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

1. 设置过期时间

localStorage 是不支持过期时间的，在存储信息过多后，会拖慢浏览器速度，也会因为浏览器存储容量不够而报错，可以封装一层逻辑来实现设置过期时间，以达到清理的目的。

```
// 设置
function set(key, value){
  const time = new Date().getTime(); //获取当前时间
  localStorage.setItem(key, JSON.stringify({value, time})); //转换成json字符串
}
// 获取
function get(key, exp){
  // exp 过期时间
  const value = localStorage.getItem(key); 
  const valueJson = JSON.parse(value); 
  //当前时间 - 存储的创建时间 > 过期时间
  if(new Date().getTime() - valueJson.time > exp){
    console.log("expires"); //提示过期
  } else {
    console.log("value:" + valueJson.value);
  }
}
```

## 五、应用

### 5.1、使用习惯记录

用来缓存一些筛选项数据，保存用户习惯信息，起到避免多次重复操作的作用。

eg：在 beetle 工程列表中，展示了自已权限下所有 beetle 的项目，对于参与项目多和参与项目少的人，操作习惯是不同的，由此，记录收藏功能状态解决了这一问题，让筛选项记住用户选择，方便下次使用。![图片](https://mmbiz.qpic.cn/mmbiz_png/DicJKAuVt0L6cWcl4ib6zXzicKH5lmdFHCfm8cTIzDx7NIicgjaJSE8RN31LT7KYS91VsU4g4hqypVJ6cjOp64q7uQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

![图片](https://mmbiz.qpic.cn/mmbiz_png/DicJKAuVt0L6cWcl4ib6zXzicKH5lmdFHCfywxcibjp4OYpN49ounfGQpddKdfFatRppCRFJpTIRctHOtdsy9nGmpQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在开发使用中，直接获取 localStorage.getItem('isFavor') 作为默认值展示，切换后使用 localStorage.setItem() 方法更新保存内容。

```
// 获取
const isFavor = localStorage.getItem('isFavor');
this.state = {
  isFavor: isFavor !== null ? Number(isFavor) : EngineeringTypeEnum.FAVOR,
};
// 展示默认值
<Form.Item name='isFavor' initialValue={this.state.isFavor}>
  <Select
    placeholder='筛选收藏的工程'
    onChange={(e) => this.changeFavor(e)}
    {...searchSmallFormProps}
  >
      {EngineeringTypeEnum.property.map(e => (<Option key={e.id} value={e.id}>{e.name}</Option>))}
  </Select>
</Form.Item>
// 变更
changeFavor = (e) => {
  localStorage.setItem('isFavor', e);
  this.setState({ isFavor: e });
};
```

### 5.2、首次打开提示

用来缓存用户导览，尤其是只需要出现一次的操作说明弹窗等。

eg：当第一次或者清空缓存后登录，页面需要出现操作指南和用户手册的弹窗说明。![图片](https://mmbiz.qpic.cn/mmbiz_png/DicJKAuVt0L6cWcl4ib6zXzicKH5lmdFHCfQOMrvicYAEoNicZp0aukNszibx05PKfpP3mWCnhjDuU9XEuffw5aMsjDg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在开发使用中，注意存储的数据类型为 string，转成布尔值是为了在插件中方便控制弹窗的显示隐藏。

```
// 获取
const operationVisible = localStorage.getItem('operationVisible');
this.state = {
  operationVisible: operationVisible === null || operationVisible === 'true' ? true : false,
};
// 控制展示
<Modal
  title='操作指南'
  open={this.state.operationVisible}
  onCancel={() => { 
    this.setState({ operationVisible: false }); 
    localStorage.setItem('operationVisible', false); 
  }}
  footer={null}
  destroyOnClose={true}
>
  <Divider orientation='left'>动作</Divider>
  <p>接口 》 用例 》 用例集，3级结构满足不了后续的使用，因此增加【动作】这一层级，【动作】是接口测试的最小单元，多个【动作】可以组合成一个用例，多个用例可以聚合为用例集；</p>
  <Image src={OperationGuidePng} preview={false} />
</Modal>
```

### 5.3、减少重复访问接口

在浏览页面时，会遇到一些经常访问但返回数据不更新的接口，这种特别适合用做页面缓存，只在页面打开的时候访问一次，其他时间获取缓存数据即可。

eg：在我们的一些内部系统中，用户信息是每个页面都要用到的，尤其是 userId 字段，会与每个获取数据接口挂钩，但这个数据是不会变的，一直请求是没有意义的，为减少接口的访问次数，可以将主要数据缓存在 localStorage 内，方便其他接口获取。

## 六、总结

希望通过此篇文章，可以让大家了解 Web Storage 在浏览器数据存储和读取的相关操作，以及相关事件和限制。

它可以用于保存用户的偏好设置、表单数据等，在开发中使用可以方便的存储和读取数据，提高用户体验。当然，在使用时需要特别注意它的限制，以及在存储、读取和删除数据过程中的错误处理。
