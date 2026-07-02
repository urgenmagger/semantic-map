import Plot from "react-plotly.js";
import type { AnalyzePoint } from "../shared/types";

interface Props {
  points: AnalyzePoint[];
}

const COLORS: Record<string, string> = {
  paid: "#8b5cf6",
  organic: "#1e3a5f",
  centroid: "#cbd5e1",
};

function formatNearest(point: AnalyzePoint): string {
  return point.nearest
    .map(
      (n) =>
        `<br>&nbsp;&nbsp;${n.keyword} — ${(n.similarity * 100).toFixed(1)}%`
    )
    .join("");
}

export default function SemanticMap({ points }: Props) {
  if (points.length === 0) {
    return (
      <div className="card map-card">
        <h2>Keywords Semantic Map</h2>
        <p className="empty-state">Вставьте keywords и нажмите Analyze</p>
      </div>
    );
  }

  const traces = Object.entries(COLORS).map(([type, color]) => {
    const filtered = points.filter((p) => p.type === type);
    if (filtered.length === 0) return null;

    return {
      x: filtered.map((p) => p.x),
      y: filtered.map((p) => p.y),
      text: filtered.map((p) => p.keyword),
      hovertext: filtered.map(
        (p) =>
          `<b>${p.keyword}</b><br><i>${p.embeddingText}</i><br><br>Nearest:${formatNearest(p)}`
      ),
      type: "scatter" as const,
      mode: "markers+text" as const,
      name: type,
      marker: {
        color,
        size: 14,
        opacity: 0.85,
        line: { width: 1, color: "#fff" },
      },
      textposition: "top center" as const,
      textfont: { size: 11, color: "#334155" },
      hovertemplate: "%{hovertext}<extra></extra>",
    };
  }).filter(Boolean);

  return (
    <div className="card map-card">
      <h2>Keywords Semantic Map</h2>
      <Plot
        data={traces as any}
        layout={{
          autosize: true,
          height: 500,
          margin: { t: 10, r: 20, b: 40, l: 40 },
          xaxis: { zeroline: false, showgrid: true, gridcolor: "#e2e8f0" },
          yaxis: { zeroline: false, showgrid: true, gridcolor: "#e2e8f0" },
          legend: { orientation: "h", y: -0.15, x: 0.5, xanchor: "center" },
          plot_bgcolor: "#f8fafc",
          paper_bgcolor: "#ffffff",
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%" }}
      />
    </div>
  );
}
