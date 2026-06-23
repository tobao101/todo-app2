"use client";

import { useEffect, useState } from "react";

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

const STORAGE_KEY = "my-todo-app:todos";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);

  // 初回マウント時に localStorage から読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTodos(JSON.parse(saved));
      }
    } catch {
      // 読み込み失敗時は何もしない
    }
    setLoaded(true);
  }, []);

  // 変更があるたびに localStorage へ保存
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, loaded]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    const newTodo: Todo = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      text,
      done: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="container">
      <div className="card">
        <header className="header">
          <h1 className="title">やることリスト</h1>
          <p className="subtitle">
            {todos.length === 0
              ? "タスクを追加しましょう"
              : `残り ${remaining} 件 / 全 ${todos.length} 件`}
          </p>
        </header>

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            addTodo();
          }}
        >
          <input
            className="input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="新しいタスクを入力..."
            aria-label="新しいタスク"
          />
          <button className="add-button" type="submit" aria-label="追加">
            追加
          </button>
        </form>

        <ul className="list">
          {todos.length === 0 ? (
            <li className="empty">まだタスクがありません 🌱</li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className={`item ${todo.done ? "item-done" : ""}`}
              >
                <label className="check-label">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span className="checkmark" aria-hidden="true" />
                  <span className="item-text">{todo.text}</span>
                </label>
                <button
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="削除"
                  title="削除"
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
      <footer className="footer">Next.js で作ったシンプルなTodoアプリ</footer>
    </main>
  );
}
