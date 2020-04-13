import { Point, Path } from "./types";

type CanvasRef = React.RefObject<HTMLCanvasElement>;

const clear = (canvasRef: CanvasRef) => {
  if (!canvasRef.current) {
    return;
  }
  const canvas: HTMLCanvasElement = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

export const makeClear = (canvasRef: CanvasRef) => () => clear(canvasRef);

const drawCircle = (
  canvasRef: CanvasRef,
  center: Point,
  radius: number,
  color = "black"
) => {
  if (!canvasRef.current) {
    return;
  }
  const canvas: HTMLCanvasElement = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }
};

export const makeDrawCircle = (canvasRef: CanvasRef) => (
  center: Point,
  radius: number,
  color: string
) => drawCircle(canvasRef, center, radius, color);

const drawLine = (
  canvasRef: CanvasRef,
  from: Point,
  to: Point,
  width = 5,
  color = "black",
  dashed = false
) => {
  if (!canvasRef.current) {
    return;
  }
  const canvas: HTMLCanvasElement = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.strokeStyle = color;
    ctx.lineJoin = "round";
    ctx.lineWidth = width;
    if (dashed) {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.closePath();

    ctx.stroke();
  }
};

export const makeDrawLine = (canvasRef: CanvasRef) => (
  from: Point,
  to: Point,
  width = 5,
  color = "black",
  dashed = false
) => drawLine(canvasRef, from, to, width, color, dashed);

const drawPath = (
  canvasRef: CanvasRef,
  path: Path,
  highlightStart: boolean
) => {
  clear(canvasRef);

  if (path.length > 1) {
    for (let i = 0; i < path.length - 1; i++) {
      drawLine(canvasRef, path[i], path[i + 1]);
    }

    drawLine(canvasRef, path[0], path[path.length - 1], 2, "#3498DB", true);
  }
  if (highlightStart && path.length > 0) {
    drawCircle(canvasRef, path[0], 10, "#e74c3c");
  }
};

export const makeDrawPath = (canvasRef: CanvasRef) => (
  path: Path,
  highlightStart: boolean
) => {
  drawPath(canvasRef, path, highlightStart);
};
