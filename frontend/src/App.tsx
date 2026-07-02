import { useState } from "react";
import KeywordInput from "./components/KeywordInput";
import MetricsCards from "./components/MetricsCards";
import SemanticMap from "./components/SemanticMap";
import SimilarityTable from "./components/SimilarityTable";
import { analyzeKeywords } from "./api/analyze";
import type {
  AnalyzePoint,
  AnalyzeStats,
  PairResult,
  ProjectionMethod,
} from "./shared/types";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AnalyzeStats | null>(null);
  const [points, setPoints] = useState<AnalyzePoint[]>([]);
  const [pairs, setPairs] = useState<PairResult[]>([]);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<ProjectionMethod>("pca");

  const handleAnalyze = async (keywords: string[]) => {
    setLoading(true);
    setError("");
    setStats(null);
    setPoints([]);
    setPairs([]);

    try {
      const res = await analyzeKeywords({ keywords, method });
      setStats(res.stats);
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
      <h1>Keyword Semantic Analyzer</h1>

      <KeywordInput onAnalyze={handleAnalyze} loading={loading} />

      <div className="controls">
        <label className="method-label">
          Projection:
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as ProjectionMethod)}
          >
            <option value="pca">PCA</option>
            <option value="umap">UMAP</option>
          </select>
        </label>
      </div>

      {error && <div className="card error">{error}</div>}

      <MetricsCards stats={stats} />

      <SemanticMap points={points} />

      {pairs.length > 0 && (
        <SimilarityTable pairs={pairs} limit={10} />
      )}
    </div>
  );
}
