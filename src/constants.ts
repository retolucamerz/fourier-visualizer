// GENERAL
export const maxCircles = 100;

// LAYOUT
export const HEADER_HEIGHT = 80;

// VISUALIZER
export const T = 30;
export const minSpeed = 0.05;
export const maxSpeed = 5;

export const minZoom = 0.5; // 0.75;
export const maxZoom = 500;

export const fourierWidth = 2;
export const drawingWidth = 3;
export const drawingColor = "rgba(0,0,255,0.3)";

export const fourierFillColor = "orange"; // "aquamarine"

export const colorGradient = [
  "#0500fa",
  "#0a00f5",
  "#0f00f0",
  "#1400eb",
  "#1900e6",
  "#1e00e1",
  "#2300dc",
  "#2800d7",
  "#2d00d2",
  "#3200cd",
  "#3700c8",
  "#3c00c3",
  "#4100be",
  "#4600b9",
  "#4b00b4",
  "#5000af",
  "#5500aa",
  "#5a00a5",
  "#5f00a0",
  "#64009b",
  "#690096",
  "#6e0091",
  "#73008c",
  "#780087",
  "#7d0082",
  "#82007d",
  "#870078",
  "#8c0073",
  "#91006e",
  "#960069",
  "#9b0064",
  "#a0005f",
  "#a5005a",
  "#aa0055",
  "#af0050",
  "#b4004b",
  "#b90046",
  "#be0041",
  "#c3003c",
  "#c80037",
  "#cd0032",
  "#d2002d",
  "#d70028",
  "#dc0023",
  "#e1001e",
  "#e60019",
  "#eb0014",
  "#f0000f",
  "#f5000a",
  "#fa0005",
  "#ff0300",
  "#ff0700",
  "#ff0a00",
  "#ff0d00",
  "#ff1100",
  "#ff1400",
  "#ff1700",
  "#ff1b00",
  "#ff1e00",
  "#ff2100",
  "#ff2500",
  "#ff2800",
  "#ff2b00",
  "#ff2f00",
  "#ff3200",
  "#ff3500",
  "#ff3900",
  "#ff3c00",
  "#ff3f00",
  "#ff4300",
  "#ff4600",
  "#ff4900",
  "#ff4d00",
  "#ff5000",
  "#ff5300",
  "#ff5700",
  "#ff5a00",
  "#ff5d00",
  "#ff6100",
  "#ff6400",
  "#ff6700",
  "#ff6b00",
  "#ff6e00",
  "#ff7100",
  "#ff7500",
  "#ff7800",
  "#ff7b00",
  "#ff7f00",
  "#ff8200",
  "#ff8500",
  "#ff8900",
  "#ff8c00",
  "#ff8f00",
  "#ff9300",
  "#ff9600",
  "#ff9900",
  "#ff9d00",
  "#ffa000",
  "#ffa300",
  "#ffa700"
];

// HELPER FUNCTIONS
export const isTouchEvent = (
  event: MouseEvent | TouchEvent
): event is TouchEvent => (event as TouchEvent).touches !== undefined;
