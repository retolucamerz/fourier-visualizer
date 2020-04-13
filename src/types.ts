export type Point = [number, number];
export type Path = Point[];

export type ReferencePoint = "default" | "center" | "tip" | "mouse";

export type ControlsType = {
  nCircles: number;
  speed: number;
  circlesVisible: boolean;
  pointsVisible: boolean;
  drawingVisible: boolean;
  showFourier: boolean;
  fillFourier: boolean;
  referencePoint: ReferencePoint;
  zoom: number;
  paused: boolean;
};
