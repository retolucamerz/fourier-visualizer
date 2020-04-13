import { Path, Point } from "./types";

export class ComplexNumber {
  re: number;
  im: number;
  constructor(re: number, im: number) {
    this.re = re;
    this.im = im;
  }

  r() {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  ang() {
    return Math.atan(this.im / this.re);
  }

  add(other: ComplexNumber) {
    return new ComplexNumber(this.re + other.re, this.im + other.im);
  }

  multiply(other: ComplexNumber) {
    return new ComplexNumber(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  static fromPolar(r: number, ang: number) {
    return new ComplexNumber(r * Math.cos(ang), r * Math.sin(ang));
  }
}

const calcDist = (p1: Point, p2: Point) => {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
};

export const preparePath = (path: Path, avgDist = 5) => {
  let cleanedPath: Path = [];

  for (let p of path) {
    if (cleanedPath.length === 0) {
      // cleaned path is empty
      cleanedPath.push(p);
      continue;
    }

    const lastPoint = cleanedPath[cleanedPath.length - 1];
    const dist = calcDist(p, lastPoint);
    if (dist < avgDist) {
      // p is too close to last point
      continue;
    }

    if (dist < 2 * avgDist) {
      // p is closer to last point than wanted distance
      cleanedPath.push(p);
    } else {
      // p is far away, so add intermediate points to cleanedPath
      const nPoints = Math.floor(dist / avgDist);

      const dx = (p[0] - lastPoint[0]) / nPoints;
      const dy = (p[1] - lastPoint[1]) / nPoints;

      for (let i = 1; i <= nPoints; i++) {
        cleanedPath.push([lastPoint[0] + i * dx, lastPoint[1] + i * dy]);
      }
    }
  }

  return cleanedPath;
};

export const calculateCoefficients = (path: Path, nCoeffs = 20) => {
  const N = path.length;
  const points = path.map(([x, y]) => new ComplexNumber(x, y));
  const coeffs: ComplexNumber[] = [];

  for (let i = 0; i < nCoeffs; i++) {
    const k = (i % 2 === 1 ? 1 : -1) * Math.ceil(i / 2);

    let coeff = new ComplexNumber(0, 0);
    for (let n = 0; n < points.length; n++) {
      const p = points[n];
      const x = ComplexNumber.fromPolar(1, -k * (n / N) * 2 * Math.PI);
      coeff = coeff.add(p.multiply(x));
    }
    coeffs[k] = new ComplexNumber(coeff.re / N, coeff.im / N);
  }

  return coeffs;
};

export type SortedCoeffs = {
  k: number;
  c: ComplexNumber;
}[];

export const calculateFourierPaths = (
  coeffs: ComplexNumber[],
  nSamples = 2000
): [SortedCoeffs, Path[]] => {
  const sortedCoeffs: SortedCoeffs = [
    { k: 0, c: coeffs[0] },
    ...Object.entries(coeffs)
      .map(([k, c]) => ({ k: parseInt(k), c }))
      .filter(({ k }) => k !== 0)
      .sort((a, b) => b.c.r() - a.c.r())
  ];

  const dTheta = (2 * Math.PI) / nSamples;

  let paths: Path[] = [
    [...Array(nSamples).keys()].map(() => [coeffs[0].re, coeffs[0].im])
  ];
  for (let nCircles = 1; nCircles < sortedCoeffs.length; nCircles++) {
    const { k, c } = sortedCoeffs[nCircles];

    paths[nCircles] = [...Array(nSamples).keys()]
      .map(i => k * i * dTheta)
      .map(theta => c.multiply(ComplexNumber.fromPolar(1, theta)))
      .map((p, n) => {
        const x = paths[nCircles - 1][n]; // sum of all circles before
        return [p.re + x[0], p.im + x[1]];
      });
  }

  return [sortedCoeffs, paths];
};

export const fourierize = (path: Path, maxCircles = 20) => {
  path = preparePath(path);
  const coeffs = calculateCoefficients(path, maxCircles + 1);
  return calculateFourierPaths(coeffs);
};
