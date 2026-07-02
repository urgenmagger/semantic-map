function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function transpose(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[][] = Array.from({ length: cols }, () =>
    new Array(rows).fill(0)
  );
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }
  return result;
}

function matMul(a: number[][], b: number[][]): number[][] {
  const result: number[][] = Array.from({ length: a.length }, () =>
    new Array(b[0].length).fill(0)
  );
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      for (let k = 0; k < a[0].length; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

function covariance(matrix: number[][]): number[][] {
  const n = matrix.length;
  const dim = matrix[0].length;

  const means: number[] = [];
  for (let j = 0; j < dim; j++) {
    const col = matrix.map((row) => row[j]);
    means.push(mean(col));
  }

  const centered = matrix.map((row) =>
    row.map((v, j) => v - means[j])
  );

  const cov: number[][] = Array.from({ length: dim }, () =>
    new Array(dim).fill(0)
  );
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += centered[k][i] * centered[k][j];
      }
      cov[i][j] = sum / (n - 1);
    }
  }

  return cov;
}

function eigenDecomposition(
  matrix: number[][],
  maxIter = 100
): { values: number[]; vectors: number[][] } {
  const n = matrix.length;
  let vectors: number[][] = Array.from({ length: n }, (_, i) => {
    const row = new Array(n).fill(0);
    row[i] = 1;
    return row;
  });

  for (let iter = 0; iter < maxIter; iter++) {
    let maxOffDiag = 0;
    let p = 0;
    let q = 1;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(matrix[i][j]) > maxOffDiag) {
          maxOffDiag = Math.abs(matrix[i][j]);
          p = i;
          q = j;
        }
      }
    }

    if (maxOffDiag < 1e-9) break;

    const theta =
      (matrix[q][q] - matrix[p][p]) / (2 * matrix[p][q]);
    const t =
      Math.sign(theta) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
    const c = 1 / Math.sqrt(t * t + 1);
    const s = c * t;

    const newMatrix = matrix.map((row) => [...row]);

    newMatrix[p][p] =
      c * c * matrix[p][p] -
      2 * s * c * matrix[p][q] +
      s * s * matrix[q][q];
    newMatrix[q][q] =
      s * s * matrix[p][p] +
      2 * s * c * matrix[p][q] +
      c * c * matrix[q][q];
    newMatrix[p][q] = 0;
    newMatrix[q][p] = 0;

    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        newMatrix[i][p] =
          c * matrix[i][p] - s * matrix[i][q];
        newMatrix[p][i] = newMatrix[i][p];
        newMatrix[i][q] =
          s * matrix[i][p] + c * matrix[i][q];
        newMatrix[q][i] = newMatrix[i][q];
      }
    }

    for (let i = 0; i < n; i++) {
      const viP = vectors[i][p];
      const viQ = vectors[i][q];
      vectors[i][p] = c * viP - s * viQ;
      vectors[i][q] = s * viP + c * viQ;
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        matrix[i][j] = newMatrix[i][j];
      }
    }
  }

  const values: number[] = [];
  for (let i = 0; i < n; i++) {
    values.push(matrix[i][i]);
  }

  const sorted = values
    .map((v, i) => ({ val: v, idx: i }))
    .sort((a, b) => b.val - a.val);

  const sortedValues = sorted.map((s) => s.val);
  const sortedVectors: number[][] = sorted.map((s) =>
    vectors.map((row) => row[s.idx])
  );

  return { values: sortedValues, vectors: sortedVectors };
}

export function pca(embeddings: number[][], targetDim: number = 2): number[][] {
  const n = embeddings.length;
  const dim = embeddings[0].length;

  const means: number[] = [];
  for (let j = 0; j < dim; j++) {
    const col = embeddings.map((row) => row[j]);
    means.push(mean(col));
  }

  const centered = embeddings.map((row) =>
    row.map((v, j) => v - means[j])
  );

  const cov = covariance(embeddings);
  const { vectors } = eigenDecomposition(cov);

  const components = vectors.slice(0, targetDim);

  return centered.map((row) => {
    const result: number[] = [];
    for (let c = 0; c < targetDim; c++) {
      let val = 0;
      for (let j = 0; j < dim; j++) {
        val += row[j] * components[c][j];
      }
      result.push(val);
    }
    return result;
  });
}
