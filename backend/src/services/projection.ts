import { PCA } from "ml-pca";
import { UMAP } from "umap-js";

export function pca(embeddings: number[][], targetDim: number = 2): number[][] {
  const model = new PCA(embeddings, { nCompNIPALS: targetDim });
  return model.predict(embeddings, { nComponents: targetDim }).to2DArray();
}

export function runUmap(embeddings: number[][], targetDim: number = 2): number[][] {
  const nNeighbors = Math.max(2, Math.min(15, Math.floor(embeddings.length / 3)));
  const reducer = new UMAP({ nComponents: targetDim, nNeighbors, minDist: 0.1 });
  return reducer.fit(embeddings);
}
