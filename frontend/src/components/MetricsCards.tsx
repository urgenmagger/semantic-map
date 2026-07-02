interface Props {
  totalKeywords: number;
  totalPairs: number;
  shownPairs: number;
  threshold: number;
}

export default function MetricsCards({
  totalKeywords,
  totalPairs,
  shownPairs,
  threshold,
}: Props) {
  const metrics = [
    { label: "Всего элементов", value: String(totalKeywords) },
    { label: "Всего пар", value: String(totalPairs) },
    { label: "Показано пар", value: String(shownPairs) },
    { label: "Порог сходства", value: threshold.toFixed(2) },
  ];

  return (
    <div className="metrics-grid">
      {metrics.map((m) => (
        <div className="card metric-card" key={m.label}>
          <div className="metric-label">{m.label}</div>
          <div className="metric-value">{m.value}</div>
        </div>
      ))}
    </div>
  );
}
