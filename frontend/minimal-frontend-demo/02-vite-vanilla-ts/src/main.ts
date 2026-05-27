// ==============================
// 计数器
// ==============================

// 获取元素
const spanEl = document.querySelector<HTMLSpanElement>("#span")
const btnEl = document.querySelector<HTMLButtonElement>("#btn")


if (!spanEl) { throw new Error("span 元素不存在") }
if (!btnEl) { throw new Error("btn 元素不存在") }

let counter = 0

// 添加事件
btnEl.addEventListener("click", () =>{
  counter ++
  spanEl.textContent = String(counter)

})



// ==============================
// 待办
// ==============================

// 获取元素
const inputEl = document.querySelector<HTMLInputElement>("#input")
const addBtnEl = document.querySelector<HTMLButtonElement>("#addBtn")
const ulEl = document.querySelector<HTMLUListElement>("#ul")

// querySelector 返回的是 Element 或者 null，所以要解包
if (!inputEl) { throw new Error("input 元素不存在") }
if (!addBtnEl) { throw new Error("addButton 元素不存在") }

// 定义数据
const todos: string[] = []

// 添加事件
addBtnEl.addEventListener("click", () => {

  // 输入检查
  const todo = inputEl.value.trim()
  
  if (!todo) { return }

  // 加入 todos
  todos.push(todo)
  console.log(todos);

  // 清空输入框
  inputEl.value = ""

  // 渲染列表
  renderList()

})

// 渲染列表函数
function renderList() {
  

  if (!ulEl) { throw new Error("ul 元素不存在") }

  // 0、先清空旧列表，避免重新渲染时重复追加 li
  ulEl.innerHTML = ""
  
  todos.forEach((todo, index) => {
    // 1、创建 li 、button 元素
    const li = document.createElement("li")
    const delBtn = document.createElement("button")

    // 2、给元素填充内容
    li.textContent = todo
    delBtn.textContent = "删除"

    // 3、删除元素
    delBtn.addEventListener("click", () => {
      todos.splice(index, 1)
      renderList()
    })

    // 4、delBtn 加入 li；li 加入 ul
    li.appendChild(delBtn)
    ulEl.appendChild(li)
  });
}
