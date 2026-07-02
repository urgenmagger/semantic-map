# Keyword Semantic Similarity Analyzer

Анализ семантической близости ключевых слов:
keywords → Gemini embeddings → cosine similarity → сортировка пар по убыванию + 2D semantic map.

## Быстрый старт

```bash
# Бэкенд
cd backend
npm install
cp .env.example .env      # Прописать GEMINI_API_KEY
npm run dev                # http://localhost:4000

# Фронтенд
cd frontend
npm install
npm run dev                # http://localhost:5173
```

## .env

```env
GEMINI_API_KEY=your_key_here
PORT=4000
```

## API

### POST /api/analyze

**Вход:**
```json
{
  "keywords": ["seo", "продвижение", "оптимизация", "парсинг", "скрейпинг"],
  "method": "pca",
  "threshold": 0,
  "topN": 10
}
```

| Поле | Тип | По умолчанию | Описание |
|---|---|---|---|
| `keywords` | `string[]` | — | Список слов/фраз (минимум 2) |
| `method` | `"pca"` \| `"umap"` | `"pca"` | Метод 2D-проекции для карты |
| `threshold` | `number` | `0` | Минимальное cosine similarity для пар (0–1) |
| `topN` | `number` | `25` | Количество возвращаемых пар |

**Выход:**
```json
{
  "stats": {
    "totalKeywords": 5,
    "paidKeywords": 5,
    "organicKeywords": 0,
    "coverageScore": 0
  },
  "points": [
    {
      "keyword": "seo",
      "embeddingText": "seo поисковое продвижение сайта поисковая оптимизация",
      "type": "paid",
      "x": 0.023,
      "y": -0.041,
      "nearest": [
        { "keyword": "оптимизация", "similarity": 0.8721 },
        { "keyword": "продвижение", "similarity": 0.8433 }
      ]
    }
  ],
  "pairs": [
    {
      "left": "парсинг",
      "right": "скрейпинг",
      "similarity": 0.9102
    }
  ]
}
```

## Как это работает

1. **Embeddings** — каждый keyword отправляется в Gemini `gemini-embedding-001`, возвращается 768-мерный вектор.

2. **Cosine similarity** — попарное сравнение всех векторов. Результат — таблица топ похожих пар, отсортированная по убыванию. Это основная метрика.

3. **Semantic map** — embedding-векторы сжимаются до 2D через PCA или UMAP и отображаются на scatter plot. Используется **только для визуализации**. Расстояния на карте могут искажаться и не являются точной метрикой.

4. **Контексты** — для демо-слов из ТЗ добавлены contextual prompts, чтобы одиночные слова давали более стабильные embeddings. Для любых новых слов система использует само слово/фразу как embedding input. Произвольный пользовательский ввод работает без хардкода.

## Ошибки

| Ошибка | HTTP | Сообщение |
|---|---|---|
| Нет ключа | 500 | `GEMINI_API_KEY is not set` |
| Меньше 2 keywords | 400 | `At least 2 keywords are required` |
| Пустой keywords | 400 | `"keywords" must be an array of strings` |
| Ошибка Gemini API | 502 | `Failed to generate embeddings. Check GEMINI_API_KEY, API quota or billing settings.` |
| Сеть недоступна | 502 | `Failed to connect to Gemini API` |

## Ограничения

- Одиночные короткие слова могут давать менее стабильные embeddings, чем фразы с контекстом.
- UMAP без фиксированного random seed — расположение точек может незначительно меняться между запусками.
- Кэша embeddings нет — при каждом запросе embeddings считаются заново.
- CSV upload, база данных, авторизация, pgvector, кластеризация — не реализованы (выходят за рамки текущего ТЗ).
