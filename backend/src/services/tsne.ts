function squaredEuclidean(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return sum;
}

function buildDistanceMatrix(embeddings: number[][]): number[][] {
  const n = embeddings.length;
  const dist: number[][] = Array.from({ length: n }, () => new Array(n));
  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
    for (let j = i + 1; j < n; j++) {
      const d = squaredEuclidean(embeddings[i], embeddings[j]);
      dist[i][j] = d;
      dist[j][i] = d;
    }
  }
  return dist;
}

function perplexityBinarySearch(
  distRow: number[],
  targetEntropy: number,
  tol = 1e-5,
  maxIter = 50
): number {
  const n = distRow.length;
  let beta = 1;
  let betaMin = -Infinity;
  let betaMax = Infinity;

  for (let iter = 0; iter < maxIter; iter++) {
    const probs: number[] = new Array(n);
    let total = 0;
    for (let j = 0; j < n; j++) {
      probs[j] = Math.exp(-distRow[j] * beta);
      total += probs[j];
    }

    let entropy = 0;
    for (let j = 0; j < n; j++) {
      if (probs[j] > 0 && total > 0) {
        const p = probs[j] / total;
        entropy -= p * Math.log2(Math.max(p, 1e-20));
      }
    }

    if (Math.abs(entropy - targetEntropy) < tol) break;

    if (entropy > targetEntropy) {
      betaMin = beta;
      beta = betaMax === Infinity ? beta * 2 : (beta + betaMax) / 2;
    } else {
      betaMax = beta;
      beta = betaMin === -Infinity ? beta / 2 : (beta + betaMin) / 2;
    }
  }

  return beta;
}

function buildAffinities(
  distances: number[][],
  perplexity: number
): number[][] {
  const n = distances.length;
  const P: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const targetEntropy = Math.log2(perplexity);

  for (let i = 0; i < n; i++) {
    const row = [...distances[i]];
    row[i] = Infinity;
    const beta = perplexityBinarySearch(row, targetEntropy);

    let sum = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        P[i][j] = Math.exp(-distances[i][j] * beta);
        sum += P[i][j];
      }
    }
    for (let j = 0; j < n; j++) {
      if (i !== j) P[i][j] /= sum;
    }
  }

  const Psym: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      Psym[i][j] = (P[i][j] + P[j][i]) / (2 * n);
    }
  }

  return Psym;
}

export function tsne(
  embeddings: number[][],
  targetDim: number = 2,
  perplexity: number = 30,
  maxIter: number = 1000,
  learningRate: number = 200
): number[][] {
  const n = embeddings.length;
  const perp = Math.min(perplexity, Math.floor(n / 3));

  const distances = buildDistanceMatrix(embeddings);
  const P = buildAffinities(distances, perp);

  let Y: number[][] = Array.from({ length: n }, () =>
    Array.from({ length: targetDim }, () => (Math.random() - 0.5) * 1e-4)
  );

  let prevGrad: number[][] = Array.from({ length: n }, () =>
    new Array(targetDim).fill(0)
  );
  const momentum = 0.5;
  const finalMomentum = 0.8;

  for (let iter = 0; iter < maxIter; iter++) {
    const Q: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    let sumQ = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const q = 1 / (1 + squaredEuclidean(Y[i], Y[j]));
        Q[i][j] = q;
        Q[j][i] = q;
        sumQ += 2 * q;
      }
    }

    // Normalize and compute gradient in one pass
    const grad: number[][] = Array.from({ length: n }, () =>
      new Array(targetDim).fill(0)
    );

    for (let i = 0; i < n; i++) {
      for (let d = 0; d < targetDim; d++) {
        let gradSum = 0;
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          const q = Q[i][j] / sumQ;
          gradSum += (P[i][j] - q) * q * sumQ * 4 * (Y[i][d] - Y[j][d]);
        }
        grad[i][d] = gradSum;
      }
    }

    const currentMomentum = iter < 250 ? momentum : finalMomentum;

    for (let i = 0; i < n; i++) {
      for (let d = 0; d < targetDim; d++) {
        prevGrad[i][d] =
          currentMomentum * prevGrad[i][d] - learningRate * grad[i][d];
        Y[i][d] += prevGrad[i][d];
      }
    }

    if (iter % 50 === 0 || iter === maxIter - 1) {
      for (let d = 0; d < targetDim; d++) {
        let mean = 0;
        for (let i = 0; i < n; i++) mean += Y[i][d];
        mean /= n;
        for (let i = 0; i < n; i++) Y[i][d] -= mean;
      }
    }
  }

  return Y;
}
