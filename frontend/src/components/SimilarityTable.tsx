import type { PairResult } from "../shared/types";

interface Props {
  pairs: PairResult[];
  limit?: number;
}

export default function SimilarityTable({ pairs, limit = 15 }: Props) {
  if (pairs.length === 0) return null;

  const visible = pairs.slice(0, limit);

  return (
    <div className="card">
      <h2>Top Similar Pairs</h2>
      <p className="hint">
        Проверьте cosine similarity. Если таблица адекватная, а карта странная —
        проблема в 2D-проекции, а не в embeddings.
      </p>
      <table className="similarity-table">
        <thead>
          <tr>
            <th>Keyword A</th>
            <th>Keyword B</th>
            <th>Similarity</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((p, i) => (
            <tr key={i}>
              <td>{p.left}</td>
              <td>{p.right}</td>
              <td className="sim-value">{(p.similarity * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
