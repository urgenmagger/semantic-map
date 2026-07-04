# Local embeddings (LaBSE-en-ru)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
echo '{"texts":["seo","продвижение","сайт","парсинг","scraping"]}' | python src/ml/local_embed.py
```

## Expected output

```json
{
  "model": "cointegrated/LaBSE-en-ru",
  "dimension": 768,
  "count": 5,
  "embeddings": [
    [0.012, -0.034, ...],
    ...
  ]
}
```

## Model info

- **cointegrated/LaBSE-en-ru** — билингвальная модель (ru + en), 768-dim, ~130 MB в памяти
- Mean pooling + L2 normalization
- Качество эмбеддингов как у полного LaBSE, но vocabulary сокращён до ru/en токенов (27% от оригинала)
