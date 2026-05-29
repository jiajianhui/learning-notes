import { useState } from "react";
function App() {

  // 计数器状态
  const [counter, setCounter] = useState<number>(0)


  // todo状态
  const [input, setInput] = useState<string>("")
  const [todos, setTodos] = useState<string[]>([])

  function addTodo() {
    // 1、数据检查
    const newTodo = input.trim()
    if (!newTodo) {
      return
    }

    // 2、加入 todos
    setTodos((prevTodos) => [...prevTodos, newTodo])

    // 3、清空输入框
    setInput("")
    
  }

  function removeTodo(index:number) {
    setTodos((prevTodos) => prevTodos.filter((_, currentIndex) => currentIndex !== index))
  }

  return (
    <>
      <h1>计数器</h1>
      <section>
        <span>当前计数：{counter}</span>
        <button onClick={() => setCounter((prevCounter) => prevCounter + 1)}>+1</button>
      </section>

      <hr />

      <h1>待办</h1>
      <section>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          type="text" 
        />

        {/* 函数没有参数的话，可以不使用箭头函数 */}
        <button onClick={ addTodo }>添加</button>

        <ul>
          {
            todos.map((todo: string, index: number) => (
              <li key={index}>
                 {todo} 
                 <button onClick={() => removeTodo(index)}>删除</button>
              </li>
              

            ))
          }

        </ul>
      </section>
    </>
  )
}

export default App
