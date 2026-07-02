import type { PairResult } from "../shared/types";

interface Props {
  pairs: PairResult[];
}

export default function SimilarityTable({ pairs }: Props) {
  if (pairs.length === 0) return null;

  return (
    <div className="card">
      <h2>Топ похожих пар</h2>
      <p className="hint">
        Cosine similarity по исходным embedding-векторам.
        Semantic map — только визуализация, расстояния на карте могут искажаться.
      </p>
      <div className="table-scroll">
        <table className="similarity-table">
          <thead>
            <tr>
              <th>Слово А</th>
              <th>Слово Б</th>
              <th>Сходство</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p, i) => (
              <tr key={i}>
                <td>{p.left}</td>
                <td>{p.right}</td>
                <td className="sim-value">{(p.similarity * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
