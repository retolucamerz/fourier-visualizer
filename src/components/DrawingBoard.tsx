import React, { useState, useRef, useEffect, useCallback } from "react";

import { Path, Point } from "../types";
import { makeDrawPath, makeClear } from "../canvasUtil";
import { isTouchEvent, HEADER_HEIGHT } from "../constants";

import "../styles/Canvas.css";

type Props = {
  path: Path;
  setPath: React.Dispatch<React.SetStateAction<Path>>;
  style?: React.CSSProperties;
};

const DrawingBoard = ({ path, setPath, style = {} }: Props) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // canvas helper functions
  const getPos = (event: MouseEvent | TouchEvent): Point | undefined => {
    if (!canvasRef.current) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasRef.current;

    if (isTouchEvent(event)) {
      return [
        event.touches[0].pageX - canvas.offsetLeft,
        event.touches[0].pageY - canvas.offsetTop,
      ];
    } else {
      return [event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop];
    }
  };

  const drawPath = useCallback(makeDrawPath(canvasRef), []);
  const clear = useCallback(makeClear(canvasRef), []);

  // listener flow
  const startDraw = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const mousePos = getPos(event);
      if (mousePos) {
        drawPath([mousePos], true);
        setPath([mousePos]);
        setIsDrawing(true);
      }
    },
    [drawPath, setPath]
  );

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("touchstart", startDraw);
    return () => {
      // when the element gets unmounted
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("touchstart", startDraw);
    };
  }, [startDraw]);

  const draw = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;

      const mousePos = getPos(event);
      if (!mousePos) return;

      const newPath = [...path, mousePos];
      drawPath(newPath, true);
      setPath(newPath);
    },
    [isDrawing, path, drawPath, setPath]
  );

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("touchmove", draw);
    return () => {
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("touchmove", draw);
    };
  }, [draw]);

  const stopDraw = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (path.length > 0) {
        const finishedPath = [...path, path[0]];
        setPath(finishedPath);
        drawPath(finishedPath, false);
      }

      setIsDrawing(false);
    },
    [path, drawPath, setPath]
  );

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);
    canvas.addEventListener("touchend", stopDraw);
    canvas.addEventListener("touchcancel", stopDraw);
    return () => {
      canvas.removeEventListener("mouseup", stopDraw);
      canvas.removeEventListener("mouseleave", stopDraw);
      canvas.removeEventListener("touchend", stopDraw);
      canvas.removeEventListener("touchcancel", stopDraw);
    };
  }, [stopDraw]);

  const resize = useCallback(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - HEADER_HEIGHT - 1;
    drawPath(path, false);
  }, [drawPath, path]);
  useEffect(resize, []);
  // @ts-ignore
  useEffect(() => (window.onresize = (e) => e && resize()), [resize]);

  // clear on mount
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <canvas ref={canvasRef} className="drawing-board" style={style}></canvas>
  );
};
export default DrawingBoard;
