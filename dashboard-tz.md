# Dashboard: семантическая карта keywords

## Интерфейс

### Верхний блок — 4 карточки-метрики:
1. **Total Keywords** — общее количество загруженных слов
2. **Paid Keywords** — количество paid keywords
3. **Organic Keywords** — количество organic keywords
4. **Coverage Score** — процент пересечения/покрытия paid keywords органикой

### Основной блок — "Keywords Semantic Map":
- Scatter plot / bubble chart, 2D-проекция embedding-векторов (PCA/UMAP/t-SNE)
- Точка = одно слово/фраза
- Цвет: purple = Paid, dark blue = Organic, gray/white = Group Centroid
- Легенда снизу
- Hover/tooltip: keyword, type, cluster, nearest keywords, similarity
- Clean SaaS dashboard, светлый фон, карточки с border-radius

## Логика обработки

1. Загрузка списка keywords
2. Embedding каждого keyword (Gemini / OpenAI / e5 / BGE)
3. Попарная cosine similarity
4. Dimensionality reduction (PCA/UMAP/t-SNE) до 2D
5. Scatter plot (близкие по смыслу — рядом)
6. Опционально: кластеры + centroids

## API контракт (backend возвращает)

```json
{
  "stats": {
    "totalKeywords": 30,
    "paidKeywords": 10,
    "organicKeywords": 20,
    "coverageScore": 0.45
  },
  "points": [
    {
      "keyword": "seo",
      "type": "paid",
      "x": 0.123,
      "y": -0.421,
      "clusterId": 1
    }
  ],
  "pairs": [
    {
      "left": "seo",
      "right": "продвижение",
      "similarity": 0.87
    }
  ]
}
```

## Стек (React)

- **Frontend**: React + TypeScript, график — Plotly.js или Apache ECharts (scatter + tooltips), карточки — CSS/Tailwind
- **Backend**: Python (FastAPI) — `numpy`, `scikit-learn` (cosine_similarity + PCA), `google-genai` для эмбеддингов

## Roadmap

### MVP
1. Захардкоженный список keywords
2. Embeddings (Gemini)
3. Cosine similarity
4. PCA → 2D
5. Scatter plot

### Далее
- UMAP/t-SNE
- Кластеры + centroids
- Coverage score
- Фильтры paid/organic
