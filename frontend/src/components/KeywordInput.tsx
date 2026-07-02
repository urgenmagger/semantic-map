import { useState } from "react";

interface Props {
  onAnalyze: (keywords: string[]) => void;
  loading: boolean;
}

export default function KeywordInput({ onAnalyze, loading }: Props) {
  const [text, setText] = useState("");

  const lines = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const count = lines.length;

  const handleSubmit = () => {
    if (count > 0) {
      onAnalyze(lines);
    }
  };

  return (
    <div className="card input-card">
      <label className="input-label" htmlFor="keywords-textarea">
        Введите слова или фразы, по одному на строку
      </label>
      <textarea
        id="keywords-textarea"
        placeholder={"seo\nпродвижение\nоптимизация\nпарсинг\nскрейпинг"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
      />
      <div className="input-footer">
        <span className="input-count">
          {count > 0
            ? `Введено элементов: ${count}`
            : "Нет элементов"}
        </span>
        <button onClick={handleSubmit} disabled={loading || count < 2}>
          {loading ? "Анализ..." : "Анализировать"}
        </button>
      </div>
    </div>
  );
}
