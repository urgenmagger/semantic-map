import type { AnalyzeStats } from "../shared/types";

interface Props {
  stats: AnalyzeStats | null;
}

const METRICS = [
  { key: "totalKeywords", label: "Total Keywords" },
  { key: "paidKeywords", label: "Paid Keywords" },
  { key: "organicKeywords", label: "Organic Keywords" },
  { key: "coverageScore", label: "Coverage Score", format: (v: number) => `${(v * 100).toFixed(0)}%` },
] as const;

export default function MetricsCards({ stats }: Props) {
  if (!stats) return null;

  return (
    <div className="metrics-grid">
      {METRICS.map((m) => (
        <div className="card metric-card" key={m.key}>
          <div className="metric-label">{m.label}</div>
          <div className="metric-value">
            {"format" in m
              ? m.format(stats[m.key] as number)
              : String(stats[m.key as keyof AnalyzeStats])}
          </div>
        </div>
      ))}
    </div>
  );
}
