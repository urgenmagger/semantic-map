import json
import sys

import numpy as np
import torch
from transformers import AutoModel, AutoTokenizer

MODEL_NAME = "cointegrated/LaBSE-en-ru"


def mean_pooling(last_hidden: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
    mask = attention_mask.unsqueeze(-1).expand(last_hidden.size()).float()
    pooled = torch.sum(last_hidden * mask, dim=1) / torch.clamp(mask.sum(dim=1), min=1e-9)
    return pooled


def embed(texts: list[str], model: AutoModel, tokenizer: AutoTokenizer) -> np.ndarray:
    encoded = tokenizer(texts, padding=True, truncation=True, max_length=64, return_tensors="pt")
    with torch.no_grad():
        output = model(**encoded)
    pooled = mean_pooling(output.last_hidden_state, encoded["attention_mask"])
    pooled = torch.nn.functional.normalize(pooled, p=2, dim=1)
    return pooled.numpy()


def main():
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModel.from_pretrained(MODEL_NAME)

    print(json.dumps({"status": "ready"}), flush=True)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            payload = json.loads(line)
        except json.JSONDecodeError as e:
            print(json.dumps({"error": f"Invalid JSON: {e}"}), flush=True)
            continue

        texts = payload.get("texts", [])
        if not isinstance(texts, list) or len(texts) == 0:
            print(json.dumps({"error": '"texts" must be a non-empty array of strings'}), flush=True)
            continue

        try:
            embeddings = embed(texts, model, tokenizer)
        except Exception as e:
            print(json.dumps({"error": f"Embedding failed: {e}"}), flush=True)
            continue

        result = {
            "model": MODEL_NAME,
            "dimension": int(embeddings.shape[1]),
            "count": len(texts),
            "embeddings": embeddings.tolist(),
        }

        print(json.dumps(result), flush=True)


if __name__ == "__main__":
    main()
