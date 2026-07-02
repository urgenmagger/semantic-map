import { useState } from "react";
import Plot from "react-plotly.js";
import type { AnalyzePoint } from "../shared/types";

interface Props {
  points: AnalyzePoint[];
}

function formatNearest(point: AnalyzePoint): string {
  return point.nearest
    .map(
      (n) =>
        `<br>&nbsp;&nbsp;${n.keyword} — ${(n.similarity * 100).toFixed(1)}%`,
    )
    .join("");
}

export default function SemanticMap({ points }: Props) {
  const [showLabels, setShowLabels] = useState(false);

  if (points.length === 0) {
    return (
      <div className="card map-card">
        <h2>Семантическая карта</h2>
        <p className="empty-state">
          Вставьте ключевые слова и нажмите Анализировать
        </p>
      </div>
    );
  }

  return (
    <div className="card map-card">
      <h2>Семантическая карта</h2>
      <p className="hint">
        Карта — 2D-проекция embedding-векторов (PCA/UMAP). Расстояния могут
        искажаться. Точные значения сходства — в таблице справа.
      </p>
      <div className="map-controls">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
          />
          Показывать подписи
        </label>
      </div>
      <Plot
        data={[
          {
            x: points.map((p) => p.x),
            y: points.map((p) => p.y),
            text: points.map((p) => p.keyword),
            hovertext: points.map(
              (p) =>
                `<b>${p.keyword}</b><br><i>${
                  p.embeddingText
                }</i><br><br>Ближайшие:${formatNearest(p)}`,
            ),
            type: "scatter" as const,
            mode: showLabels ? ("text+markers" as const) : ("markers" as const),
            marker: {
              color: "#8b5cf6",
              size: 14,
              opacity: 0.85,
              line: { width: 1, color: "#fff" },
            },
            textposition: "top center" as const,
            textfont: { size: 11, color: "#334155" },
            hovertemplate: "%{hovertext}<extra></extra>",
          },
        ]}
        layout={{
          autosize: true,
          height: 400,
          margin: { t: 10, r: 20, b: 40, l: 40 },
          showlegend: false,
          xaxis: { zeroline: false, showgrid: true, gridcolor: "#e2e8f0" },
          yaxis: { zeroline: false, showgrid: true, gridcolor: "#e2e8f0" },
          plot_bgcolor: "#f8fafc",
          paper_bgcolor: "#ffffff",
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%" }}
      />
    </div>
  );
}
