import { useState } from "react";
import KeywordInput from "./components/KeywordInput";
import MetricsCards from "./components/MetricsCards";
import SemanticMap from "./components/SemanticMap";
import SimilarityTable from "./components/SimilarityTable";
import { analyzeKeywords } from "./api/analyze";
import type {
  AnalyzePoint,
  PairResult,
  ProjectionMethod,
} from "./shared/types";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<AnalyzePoint[]>([]);
  const [pairs, setPairs] = useState<PairResult[]>([]);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<ProjectionMethod>("pca");
  const [threshold, setThreshold] = useState(0);
  const [topN, setTopN] = useState(10);
  const [keywordCount, setKeywordCount] = useState(0);

  const totalPairs =
    keywordCount > 1 ? (keywordCount * (keywordCount - 1)) / 2 : 0;

  const handleAnalyze = async (keywords: string[]) => {
    setLoading(true);
    setError("");
    setPoints([]);
    setPairs([]);
    setKeywordCount(keywords.length);

    try {
      const res = await analyzeKeywords({ keywords, method, threshold, topN });
      setPoints(res.points);
      setPairs(res.pairs);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Семантический анализ ключевых слов</h1>

      <KeywordInput onAnalyze={handleAnalyze} loading={loading} />

      <div className="controls">
        <label className="select-label">
          Проекция:
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as ProjectionMethod)}
          >
            <option value="pca">PCA</option>
            <option value="umap">UMAP</option>
          </select>
        </label>

        <label className="select-label">
          Порог сходства: {threshold.toFixed(2)}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
        </label>

        <label className="select-label">
          Топ пар:
          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>

      {error && <div className="card error">{error}</div>}

      <MetricsCards
        totalKeywords={keywordCount}
        totalPairs={totalPairs}
        shownPairs={pairs.length}
        threshold={threshold}
      />

      <div className="results-grid">
        <SemanticMap points={points} />
        {pairs.length > 0 && <SimilarityTable pairs={pairs} />}
      </div>
    </div>
  );
}
