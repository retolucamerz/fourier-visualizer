import React, { useState } from "react";
import { Path, ReferencePoint, ControlsType } from "./types";
import { fourierize, SortedCoeffs } from "./fourierize";
import { maxCircles, HEADER_HEIGHT } from "./constants";
import DrawingBoard from "./components/DrawingBoard";
import FourierVisualizer from "./components/FourierVisualizer";
import Dropdown from "./components/Dropdown";
import Controls from "./components/Controls";

import FileUploader from "./components/FileUploader";
import ImageCanvas from "./components/ImageCanvas";

import "./App.css";
import "./styles/Button.css";

function App() {
  const [mode, setMode] = useState<"drawing" | "visualizing">("drawing");

  const [drawingPath, setDrawingPath] = useState<Path>([]);

  const [fourierPaths, setFourierPaths] = useState<Path[]>([]);
  const [sortedCoeffs, setSortedCoeffs] = useState<SortedCoeffs>([]);

  const [controls, setControls] = useState<ControlsType>({
    nCircles: 5,
    circlesVisible: true,
    pointsVisible: true,
    drawingVisible: true,
    showFourier: true,
    fillFourier: false,
    referencePoint: "default",
    zoom: 1,
    speed: 1,
    paused: false,
  });

  const [downloadFourier, setDownloadFourier] = useState<(() => void) | null>(
    null
  );

  const [img, setImg] = useState<string>("");

  const switchMode = () => {
    if (mode === "drawing") {
      if (drawingPath.length < 5) {
        return;
      }

      const [sortedCoeffs, fourierPaths] = fourierize(drawingPath, maxCircles);

      setSortedCoeffs(sortedCoeffs);
      setFourierPaths(fourierPaths);
      setMode("visualizing");
    } else {
      setDrawingPath([]);
      setMode("drawing");
      setImg("");

      setControls({
        ...controls,
        referencePoint: "default",
        zoom: 1,
      });
    }
  };

  return (
    <div className="App">
      <header className="App-header" style={{ height: HEADER_HEIGHT }}>
        {mode === "drawing" ? (
          <>
            <FileUploader
              onUpload={(e) =>
                e &&
                e.target &&
                typeof e.target.result === "string" &&
                setImg(e.target.result)
              }
              className="image-uploader"
            />
            <p className="header-text">
              Draw a closed shape below and click "Fourierize!"
            </p>
          </>
        ) : (
          <Dropdown selectorsBeloningToDropdown={[".MuiPopover-root"]}>
            <Controls
              controls={controls}
              setControls={setControls}
              download={downloadFourier}
            />
          </Dropdown>
        )}
        <button
          onClick={switchMode}
          className="button button-red toggle-button"
        >
          {mode === "drawing" ? "Fourierize!" : "Redraw"}
        </button>
      </header>

      <main>
        {mode === "drawing" ? (
          <>
            <DrawingBoard
              path={drawingPath}
              setPath={setDrawingPath}
              style={{ position: "absolute" }}
            />
            <ImageCanvas img={img} />
          </>
        ) : (
          <FourierVisualizer
            fourierPaths={fourierPaths}
            drawingPath={drawingPath}
            sortedCoeffs={sortedCoeffs}
            controls={controls}
            setReferencePoint={(referencePoint: ReferencePoint) =>
              setControls({ ...controls, referencePoint })
            }
            setZoom={(zoom: number) => setControls({ ...controls, zoom })}
            // passing this weird function to setState because if a function is
            //  passed to setState, the next state will be the returned value of
            //  this function
            ref={(ref) => ref && setDownloadFourier(() => ref.downloadFourier)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
