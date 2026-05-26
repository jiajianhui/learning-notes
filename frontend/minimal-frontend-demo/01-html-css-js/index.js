
// ==============================
// 计数器
// ==============================

// 获取html元素
const spanEl = document.querySelector("#span");
const btnEl = document.querySelector("#btn");

let total = 0;

// 添加点击事件
btnEl.addEventListener("click", () => {
  total += 1;
  spanEl.textContent = String(total);
});


// ==============================
// 待办
// ==============================

// 获取元素
const inputEl = document.querySelector("#input");
const addBtnEl = document.querySelector("#addBtn");
const ulEl = document.querySelector("#ul");

const todos = [];

// 点击事件
addBtnEl.addEventListener("click", () => {
  // 移除空格的字符串
  const content = inputEl.value.trim();

  // 为输入、输入空格，就return
  if (!content) {
    return;
  }

  // 加入 todo
  todos.push(content);

  // 重置输入框
  inputEl.value = "";

  // 渲染列表
  renderList();
  console.log(todos);
});

// 渲染列表
function renderList() {
  // textContent —— 设置或读取元素里面的纯文本内容
  // innerHTML —— 设置或读取元素内部的 HTML 内容
  // value —— 读取或设置表单元素的值
  // splice —— 从数组里删除指定位置的元素
  // appendChild —— 添加一个真实 DOM 元素

  ulEl.innerHTML = "";

  todos.forEach((item, index) => {
    // 1、创建 li、button 元素
    const li = document.createElement("li");
    const delBtn = document.createElement("button");

    // 2、将内容放进 li、button 元素
    li.textContent = item;
    delBtn.textContent = "删除";

    // 3、为 button 添加点击事件
    delBtn.addEventListener("click", () => {
      todos.splice(index, 1);

      // 重新渲染
      renderList();
    });

    // 4、将 button 放入 li，将 li 放入 ul
    li.appendChild(delBtn);
    ulEl.appendChild(li);
  });
}
