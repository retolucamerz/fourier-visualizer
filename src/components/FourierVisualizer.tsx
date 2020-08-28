import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  Ref,
  forwardRef,
} from "react";
import { Path, ReferencePoint, Point, ControlsType } from "../types";
import { ComplexNumber, SortedCoeffs } from "../fourierize";
import {
  fourierWidth,
  drawingWidth,
  drawingColor,
  T,
  isTouchEvent,
  colorGradient,
  HEADER_HEIGHT,
  fourierFillColor,
} from "../constants";

import "../styles/FourierVisualizer.css";

export type Props = {
  fourierPaths: Path[];
  sortedCoeffs: SortedCoeffs;
  drawingPath: Path;
  controls: ControlsType;
  setReferencePoint: (arg0: ReferencePoint) => void;
  setZoom: (arg0: number) => void;
  style?: React.CSSProperties;
};

const FourierVisualizer = forwardRef(
  (
    {
      fourierPaths,
      sortedCoeffs,
      drawingPath,
      controls,
      setReferencePoint,
      setZoom,
      style = {},
    }: Props,
    ref: Ref<{ downloadFourier: () => void }>
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // ANIMATION HELPER FUNCTIONS
    const drawCircle = useCallback(
      (
        cx: number,
        cy: number,
        r: number,
        fill = false,
        color = "grey",
        width = 1
      ) => {
        if (!svgRef.current) {
          return;
        }

        const svg = svgRef.current;

        let circle = svg.appendChild(
          document.createElementNS(svg.namespaceURI, "circle")
        );
        circle.setAttribute("cx", cx.toString());
        circle.setAttribute("cy", cy.toString());
        circle.setAttribute("r", r.toString());
        circle.setAttribute("stroke-width", `${width}px`);

        if (fill) {
          circle.setAttribute("fill", color);
        } else {
          circle.setAttribute("fill", "none");
          circle.setAttribute("stroke", color);
        }

        return circle;
      },
      []
    );

    const drawPath = (
      path: Path,
      color = "black",
      width = 2,
      fill = "none",
      insertOnTop = true
    ) => {
      if (!svgRef.current) {
        return;
      }

      const svg = svgRef.current;

      const pathElem = document.createElementNS(svg.namespaceURI, "path");

      if (insertOnTop) {
        svg.appendChild(pathElem);
      } else {
        svg.prepend(pathElem);
      }

      pathElem.setAttribute("stroke-width", `${width}px`);
      pathElem.setAttribute("stroke", color);
      pathElem.setAttribute("fill-rule", "evenodd");
      pathElem.setAttribute("fill", fill);

      let pathStr = `M${path[0][0]},${path[0][1]}`;
      pathStr += path
        .slice(1)
        .map(([x, y]) => `L${x},${y}`)
        .join();
      pathStr += `L${path[0][0]},${path[0][1]}`;
      pathElem.setAttribute("d", pathStr);

      return pathElem;
    };

    // SETUP
    const [fourierPathElems, setFourierPathElems] = useState<Element[]>();
    const [drawingElem, setDrawingElem] = useState<Element | null>(null);

    // setup paths in the background
    const activeFourierPathRef = useRef(0);
    useEffect(() => {
      const fourierPathElems = Object.entries(fourierPaths.slice(1)).map(
        ([_i, p]) => {
          const i = parseInt(_i);

          const elem = drawPath(p, "none", fourierWidth, "none", false);
          if (!elem) {
            return document.createElementNS("", "path");
          }

          if (controls.showFourier && i === controls.nCircles - 1) {
            elem.setAttribute("stroke", "black");
            controls.fillFourier && elem.setAttribute("fill", fourierFillColor);
            activeFourierPathRef.current = i;
          }

          return elem;
        }
      );
      fourierPathElems.every((x) => x !== undefined) &&
        setFourierPathElems(fourierPathElems);

      const drawingElem = drawPath(
        drawingPath,
        controls.drawingVisible ? drawingColor : "none",
        drawingWidth
      );
      if (!drawingElem) {
        return;
      }
      setDrawingElem(drawingElem);
    }, [fourierPaths]);

    const viewBoxCenterRef = useRef<Point>([0, 0]);
    const updateViewBox = useCallback(() => {
      if (!svgRef.current) {
        return;
      }

      const svg = svgRef.current;

      const w = window.innerWidth;
      const zW = w / controls.zoom;
      const h = window.innerHeight - HEADER_HEIGHT; // compensate for header
      const zH = h / controls.zoom;

      if (controls.referencePoint === "default") {
        svg.setAttribute(
          "viewBox",
          `${(w - zW) / 2} ${(h - zH) / 2} ${zW} ${zH}`
        );
        viewBoxCenterRef.current = [w / 2, h / 2];
      } else if (controls.referencePoint === "center" && fourierPaths) {
        const cx = fourierPaths[0][0][0];
        const cy = fourierPaths[0][0][1];

        svg.setAttribute(
          "viewBox",
          `${cx - zW / 2} ${cy - zH / 2} ${zW} ${zH}`
        );
        viewBoxCenterRef.current = [cx, cy];
      } else if (controls.referencePoint === "mouse") {
        const [cx, cy] = viewBoxCenterRef.current;
        svg.setAttribute(
          "viewBox",
          `${cx - zW / 2} ${cy - zH / 2} ${zW} ${zH}`
        );
      }
    }, [fourierPaths, controls.referencePoint, controls.zoom]);

    // DRAGGING EVENT HANDLERS
    const [isDragging, setIsDragging] = useState(false);
    const lastDragRef = useRef<Point>([0, 0]);
    const startDrag = useCallback(
      (event: MouseEvent | TouchEvent) => {
        setIsDragging(true);
        setReferencePoint("mouse");

        if (isTouchEvent(event)) {
          lastDragRef.current = [
            event.touches[0].pageX,
            event.touches[0].pageY,
          ];
        }
      },
      [setIsDragging, setReferencePoint]
    );

    useEffect(() => {
      if (!svgRef.current) {
        return;
      }

      const svg: SVGSVGElement = svgRef.current;
      svg.addEventListener("mousedown", startDrag);
      svg.addEventListener("touchstart", startDrag);
      return () => {
        // when the element gets unmounted
        svg.removeEventListener("mousedown", startDrag);
        svg.removeEventListener("touchstart", startDrag);
      };
    }, [startDrag]);

    const drag = useCallback(
      (event: MouseEvent | TouchEvent) => {
        if (!isDragging) {
          return;
        }

        if (isTouchEvent(event)) {
          const x = event.touches[0].pageX;
          const y = event.touches[0].pageY;

          const movementX = x - lastDragRef.current[0];
          const movementY = y - lastDragRef.current[1];

          viewBoxCenterRef.current[0] -= movementX / controls.zoom;
          viewBoxCenterRef.current[1] -= movementY / controls.zoom;

          lastDragRef.current = [x, y];
        } else {
          viewBoxCenterRef.current[0] -= event.movementX / controls.zoom;
          viewBoxCenterRef.current[1] -= event.movementY / controls.zoom;
        }

        updateViewBox();
      },
      [updateViewBox, controls.zoom, isDragging]
    );
    useEffect(() => {
      if (!svgRef.current) {
        return;
      }

      const svg: SVGSVGElement = svgRef.current;
      svg.addEventListener("mousemove", drag);
      svg.addEventListener("touchmove", drag);
      return () => {
        svg.removeEventListener("mousemove", drag);
        svg.removeEventListener("touchmove", drag);
      };
    }, [drag]);

    const stopDrag = useCallback((event: MouseEvent | TouchEvent) => {
      setIsDragging(false);
    }, []);
    useEffect(() => {
      if (!svgRef.current) {
        return;
      }

      const svg: SVGSVGElement = svgRef.current;
      svg.addEventListener("mouseup", stopDrag);
      svg.addEventListener("mouseleave", stopDrag);
      svg.addEventListener("touchend", stopDrag);
      svg.addEventListener("touchcancel", stopDrag);
      return () => {
        svg.removeEventListener("mouseup", stopDrag);
        svg.removeEventListener("mouseleave", stopDrag);
        svg.removeEventListener("touchend", stopDrag);
        svg.removeEventListener("touchcancel", stopDrag);
      };
    }, [stopDrag]);

    // CHANGES TO CONTROLS
    // onChange referencePoint (to default or center) and zoom
    useEffect(() => {
      updateViewBox();
      window.onresize = updateViewBox;

      // change path widths according to zoom
      fourierPathElems &&
        fourierPathElems.forEach((p) => {
          if (p) {
            p.setAttribute("stroke-width", `${fourierWidth / controls.zoom}px`);
          }
        });
      drawingElem &&
        drawingElem.setAttribute(
          "stroke-width",
          `${drawingWidth / controls.zoom}px`
        );
    }, [
      drawingElem,
      fourierPathElems,
      updateViewBox,
      controls.zoom,
      controls.referencePoint,
    ]);

    // onchange nCircles
    useEffect(() => {
      if (!fourierPathElems) {
        return;
      }

      // clear last active path
      const lastPath = fourierPathElems[activeFourierPathRef.current];
      lastPath.setAttribute("stroke", "none");
      lastPath.setAttribute("fill", "none");
      activeFourierPathRef.current = controls.nCircles - 1;

      // activate new path
      const activePath = fourierPathElems[controls.nCircles - 1];
      if (fourierPathElems.length > 1) {
        if (activePath) {
          if (controls.showFourier) {
            activePath.setAttribute("stroke", "black");
          }

          if (controls.fillFourier) {
            activePath.setAttribute("fill", fourierFillColor);
          }
        }
      }
    }, [
      fourierPathElems,
      controls.nCircles,
      controls.fillFourier,
      controls.showFourier,
    ]);

    // onchange drawingVisible
    useEffect(() => {
      if (!drawingElem) {
        return;
      }

      drawingElem.setAttribute(
        "stroke",
        controls.drawingVisible ? drawingColor : "none"
      );
    }, [drawingElem, controls.drawingVisible]);

    // DOWNLOAD
    const downloadFourier = useCallback(() => {
      if (!fourierPathElems) {
        return;
      }

      const cx = viewBoxCenterRef.current[0];
      const cy = viewBoxCenterRef.current[1];
      const zW = window.innerWidth / controls.zoom;
      const zH = (window.innerHeight - 80) / controls.zoom;

      const viewBox = `${cx - zW / 2} ${cy - zH / 2} ${cx + zW / 2} ${
        cy + zH / 2
      }`;
      const data =
        `<?xml version="1.0" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">` +
        fourierPathElems[controls.nCircles - 1].outerHTML +
        "</svg>";
      const filename = "path.svg";

      // from https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
      var file = new Blob([data], { type: "svg" });
      if (window.navigator.msSaveOrOpenBlob)
        // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
      else {
        // Others
        var a = document.createElement("a"),
          url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      }
    }, [fourierPathElems, controls.nCircles, controls.zoom]);
    useImperativeHandle(
      ref,
      () => ({
        downloadFourier,
      }),
      [downloadFourier]
    );

    // CIRCLES ANIMATION
    const phiRef = useRef(0);
    const animationElemsRef = useRef<Element[]>([]);
    const lastControlsRef = useRef<ControlsType>();
    const animate = useCallback(
      (deltaT: number) => {
        if (!svgRef.current) {
          return;
        }

        // only reanimate if not paused or or chritical controls have changed
        const lastControls = lastControlsRef.current;
        const controlsChanged =
          lastControls &&
          controls.nCircles === lastControls.nCircles &&
          lastControls.pointsVisible === controls.pointsVisible &&
          lastControls.circlesVisible === controls.circlesVisible &&
          lastControls.referencePoint === controls.referencePoint &&
          lastControls.zoom === controls.zoom;
        const rerender = !controls.paused || !controlsChanged;
        if (!rerender) {
          return;
        }
        lastControlsRef.current = controls;

        const svg = svgRef.current;
        animationElemsRef.current.forEach((e) => svg.removeChild(e));
        const curElems: Element[] = [];

        if (!controls.circlesVisible && !controls.pointsVisible) {
          animationElemsRef.current = [];
          return;
        }

        if (!controls.paused) {
          const dPhi = (controls.speed * (2 * Math.PI * deltaT)) / T;
          phiRef.current += dPhi;
        }
        const phi = phiRef.current;

        let x = sortedCoeffs[0].c.re;
        let y = sortedCoeffs[0].c.im;

        for (let i = 1; i <= controls.nCircles; i++) {
          const { k, c } = sortedCoeffs[i];

          if (controls.circlesVisible) {
            const circle = drawCircle(
              x,
              y,
              c.r(),
              false,
              "grey",
              1 / controls.zoom
            );
            circle && curElems.push(circle);
          }

          const _ = ComplexNumber.fromPolar(1, k * phi).multiply(c);

          x += _.re;
          y += _.im;

          if (controls.pointsVisible) {
            const point = drawCircle(
              x,
              y,
              (i === controls.nCircles ? 5 : 4) / controls.zoom,
              true,
              colorGradient[i - 1]
            );
            point && curElems.push(point);
          }
        }

        if (controls.referencePoint === "tip") {
          const zW = window.innerWidth / controls.zoom;
          const zH = (window.innerHeight - HEADER_HEIGHT) / controls.zoom;

          svg.setAttribute(
            "viewBox",
            `${x - zW / 2} ${y - zH / 2} ${zW} ${zH}`
          );
          viewBoxCenterRef.current = [x, y];
        }

        animationElemsRef.current = curElems;
      },
      [sortedCoeffs, controls, drawCircle]
    );

    const requestRef = React.useRef<number>(-1);
    const previousTimeRef = React.useRef<number | null>(null);
    const animation = useCallback(
      (time: number) => {
        if (previousTimeRef.current !== null) {
          const deltaTime = (time - previousTimeRef.current) / 1000;
          animate(deltaTime);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animation);
      },
      [animate]
    );

    React.useEffect(() => {
      requestRef.current = requestAnimationFrame(animation);
      return () => cancelAnimationFrame(requestRef.current);
    }, [animation]);

    return (
      <svg
        className="fourier-visualizer"
        ref={svgRef}
        width="100%"
        height="100%"
        style={style}
      ></svg>
    );
  }
);

export default FourierVisualizer;
