"use client";

import { useEffect, useMemo, useState } from "react";

type Priority = "high" | "medium" | "low";
type Category = "work" | "private" | "other";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  note: string;
  date: string; // YYYY-MM-DD（任意）
  startTime: string; // HH:MM（任意）
  endTime: string; // HH:MM（任意）
  priority: Priority;
  category: Category;
  createdAt: number;
};

const STORAGE_KEY = "my-todo-app:todos";

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "work", label: "仕事" },
  { value: "private", label: "プライベート" },
  { value: "other", label: "その他" },
];

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function priorityLabel(p: Priority) {
  return PRIORITIES.find((x) => x.value === p)?.label ?? "中";
}

function categoryLabel(c: Category) {
  return CATEGORIES.find((x) => x.value === c)?.label ?? "その他";
}

function formatSchedule(todo: Todo): string | null {
  const parts: string[] = [];
  if (todo.date) {
    const d = new Date(todo.date + "T00:00:00");
    if (!Number.isNaN(d.getTime())) {
      parts.push(`${d.getMonth() + 1}/${d.getDate()}(${WEEKDAYS[d.getDay()]})`);
    }
  }
  if (todo.startTime || todo.endTime) {
    parts.push(`${todo.startTime || "--:--"}〜${todo.endTime || "--:--"}`);
  }
  return parts.length ? parts.join(" ") : null;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  // フォーム入力
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("work");
  const [showDetails, setShowDetails] = useState(false);

  // フィルター
  const [filterCategory, setFilterCategory] = useState<"all" | Category>("all");
  const [filterPriority, setFilterPriority] = useState<"all" | Priority>("all");

  // アニメーション用の一時状態
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const [celebratingIds, setCelebratingIds] = useState<string[]>([]);

  // 読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Todo>[];
        setTodos(
          parsed.map((t) => ({
            id: t.id ?? String(Date.now() + Math.random()),
            text: t.text ?? "",
            done: t.done ?? false,
            note: t.note ?? "",
            date: t.date ?? "",
            startTime: t.startTime ?? "",
            endTime: t.endTime ?? "",
            priority: (t.priority as Priority) ?? "medium",
            category: (t.category as Category) ?? "other",
            createdAt: t.createdAt ?? Date.now(),
          }))
        );
      }
    } catch {
      // 読み込み失敗時は何もしない
    }
    setLoaded(true);
  }, []);

  // 保存
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, loaded]);

  const addTodo = () => {
    const value = text.trim();
    if (!value) return;
    const newTodo: Todo = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      text: value,
      done: false,
      note: note.trim(),
      date,
      startTime,
      endTime,
      priority,
      category,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    // フォームをリセット
    setText("");
    setNote("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setPriority("medium");
    setCategory("work");
    setShowDetails(false);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
    // 完了にした瞬間だけお祝いアニメーション
    const target = todos.find((t) => t.id === id);
    if (target && !target.done) {
      setCelebratingIds((prev) => [...prev, id]);
      setTimeout(() => {
        setCelebratingIds((prev) => prev.filter((x) => x !== id));
      }, 700);
    }
  };

  const deleteTodo = (id: string) => {
    // 退場アニメーションを再生してから削除
    setRemovingIds((prev) => [...prev, id]);
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setRemovingIds((prev) => prev.filter((x) => x !== id));
    }, 280);
  };

  const filtered = useMemo(() => {
    return todos.filter((t) => {
      if (filterCategory !== "all" && t.category !== filterCategory)
        return false;
      if (filterPriority !== "all" && t.priority !== filterPriority)
        return false;
      return true;
    });
  }, [todos, filterCategory, filterPriority]);

  // 完了率（表示中のタスクが対象）
  const total = filtered.length;
  const doneCount = filtered.filter((t) => t.done).length;
  const rate = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  // 円グラフ用
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (rate / 100) * circumference;

  return (
    <main className="container">
      <div className="card">
        <header className="header">
          <h1 className="title">やることリスト</h1>
          <p className="subtitle">毎日を、すっきり管理しよう</p>
        </header>

        {/* 完了率グラフ */}
        <section className="progress-section">
          <div className="ring-wrap">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle
                className="ring-bg"
                cx="50"
                cy="50"
                r={radius}
                strokeWidth="9"
                fill="none"
              />
              <circle
                className="ring-fg"
                cx="50"
                cy="50"
                r={radius}
                strokeWidth="9"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="ring-label">
              <span className="ring-percent">{rate}%</span>
              <span className="ring-sub">完了</span>
            </div>
          </div>
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-num">{total}</span>
              <span className="stat-label">全タスク</span>
            </div>
            <div className="stat">
              <span className="stat-num">{doneCount}</span>
              <span className="stat-label">完了</span>
            </div>
            <div className="stat">
              <span className="stat-num">{total - doneCount}</span>
              <span className="stat-label">残り</span>
            </div>
          </div>
        </section>

        {/* 追加フォーム */}
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            addTodo();
          }}
        >
          <div className="form-main">
            <input
              className="input"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="新しいタスクを入力..."
              aria-label="新しいタスク"
            />
            <button className="add-button" type="submit" aria-label="追加">
              追加
            </button>
          </div>

          <button
            type="button"
            className="details-toggle"
            onClick={() => setShowDetails((v) => !v)}
            aria-expanded={showDetails}
          >
            {showDetails ? "▲ 詳細を閉じる" : "▼ 詳細を設定（任意）"}
          </button>

          {showDetails && (
            <div className="details-panel">
              <div className="field-row">
                <label className="field">
                  <span className="field-label">カテゴリ</span>
                  <select
                    className="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">優先度</span>
                  <select
                    className="select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="field-row">
                <label className="field">
                  <span className="field-label">日付</span>
                  <input
                    className="select"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
              </div>

              <div className="field-row">
                <label className="field">
                  <span className="field-label">開始時間</span>
                  <input
                    className="select"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field-label">終了時間</span>
                  <input
                    className="select"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </label>
              </div>

              <label className="field">
                <span className="field-label">備考</span>
                <textarea
                  className="textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="メモや詳細を記入..."
                  rows={2}
                />
              </label>
            </div>
          )}
        </form>

        {/* フィルター */}
        <div className="filters">
          <div className="filter-group">
            <span className="filter-title">カテゴリ</span>
            <div className="chips">
              <button
                className={`chip ${filterCategory === "all" ? "chip-on" : ""}`}
                onClick={() => setFilterCategory("all")}
              >
                すべて
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  className={`chip ${
                    filterCategory === c.value ? "chip-on" : ""
                  }`}
                  onClick={() => setFilterCategory(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-title">優先度</span>
            <div className="chips">
              <button
                className={`chip ${filterPriority === "all" ? "chip-on" : ""}`}
                onClick={() => setFilterPriority("all")}
              >
                すべて
              </button>
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  className={`chip ${
                    filterPriority === p.value ? "chip-on" : ""
                  }`}
                  onClick={() => setFilterPriority(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* タスク一覧 */}
        <ul className="list">
          {filtered.length === 0 ? (
            <li className="empty">
              {todos.length === 0
                ? "まだタスクがありません 🌱"
                : "条件に合うタスクがありません 🔍"}
            </li>
          ) : (
            filtered.map((todo) => {
              const schedule = formatSchedule(todo);
              const classes = [
                "item",
                todo.done ? "item-done" : "",
                removingIds.includes(todo.id) ? "item-removing" : "",
                celebratingIds.includes(todo.id) ? "item-celebrate" : "",
                `prio-${todo.priority}`,
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <li key={todo.id} className={classes}>
                  <div className="item-top">
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
                  </div>

                  <div className="badges">
                    <span className={`badge cat-${todo.category}`}>
                      {categoryLabel(todo.category)}
                    </span>
                    <span className={`badge badge-prio prio-badge-${todo.priority}`}>
                      優先度: {priorityLabel(todo.priority)}
                    </span>
                    {schedule && (
                      <span className="badge badge-schedule">🗓 {schedule}</span>
                    )}
                  </div>

                  {todo.note && <p className="item-note">{todo.note}</p>}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </main>
  );
}
