import React, { useRef, useEffect, useCallback } from "react";

import "../styles/Canvas.css";
import { makeClear } from "../canvasUtil";
import { HEADER_HEIGHT } from "../constants";

type Props = {
  img: string;
};

const ImageCanvas = ({ img }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clear = useCallback(makeClear(canvasRef), []);

  const scale = useCallback((imgW: number, imgH: number): [
    number,
    number,
    number,
    number
  ] => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight - HEADER_HEIGHT;
    const screenRatio = screenW / screenH;

    const imgRatio = imgW / imgH;

    let scaledW: number;
    let scaledH: number;
    if (screenRatio < imgRatio) {
      // width is limiting
      scaledW = screenW;
      scaledH = imgH * (screenW / imgW);
    } else {
      // height is limiting
      scaledW = imgW * (screenH / imgH);
      scaledH = screenH;
    }

    // [start_width, start_height, width, height]
    return [(screenW - scaledW) / 2, (screenH - scaledH) / 2, scaledW, scaledH];
  }, []);

  const drawImg = useCallback(() => {
    if (!canvasRef.current || !img) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const imgElem = new Image();

    imgElem.onload = () => {
      clear();
      ctx && (ctx.globalAlpha = 0.5);
      ctx?.drawImage(imgElem, ...scale(imgElem.width, imgElem.height));
    };
    // @ts-ignore
    imgElem.src = img;
  }, [img, clear, scale]);
  useEffect(drawImg, [img]);
  // @ts-ignore
  useEffect(() => (window.onresize = (e) => e && drawImg()), [drawImg]);

  // resize
  const resize = useCallback(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - HEADER_HEIGHT - 1;
  }, []);
  useEffect(resize, []);
  // @ts-ignore
  useEffect(() => (window.onresize = (e) => e && resize()), [resize]);

  return <canvas ref={canvasRef} className="image-canvas"></canvas>;
};
export default ImageCanvas;
