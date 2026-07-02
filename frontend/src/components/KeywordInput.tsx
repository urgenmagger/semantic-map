import { useState } from "react";

interface Props {
  onAnalyze: (keywords: string[]) => void;
  loading: boolean;
}

export default function KeywordInput({ onAnalyze, loading }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const keywords = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (keywords.length > 0) {
      onAnalyze(keywords);
    }
  };

  return (
    <div className="card input-card">
      <textarea
        placeholder="Вставьте keywords, по одному на строку..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Анализ..." : "Analyze"}
      </button>
    </div>
  );
}
