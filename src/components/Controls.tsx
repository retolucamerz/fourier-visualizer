import React, { useState, SetStateAction, useEffect, useCallback } from "react";
import Slider from "@material-ui/core/Slider";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import { ReferencePoint, ControlsType } from "../types";
import { minSpeed, maxSpeed, minZoom, maxZoom, maxCircles } from "../constants";
import "../styles/Controls.css";

export const DiscreteRootSlider = ({
  val,
  setVal,
  minVal,
  maxVal,
  defaultVal = 5,
  orientation = "vertical",
}: {
  val: number;
  setVal: (arg0: number) => void;
  minVal: number;
  maxVal: number;
  defaultVal?: number;
  orientation?: "horizontal" | "vertical";
}) => {
  const power = 0.66;
  const valRange = maxVal - minVal;
  const labelRange = Math.pow(valRange, power);

  const fromVal = (val: number) =>
    (100 / labelRange) * Math.pow(val - minVal, power);
  const toVal = (x: number) =>
    Math.round(minVal + Math.pow((x / 100) * labelRange, 1 / power));

  const defaultLabel = fromVal(defaultVal);

  return (
    <Slider
      value={fromVal(val)}
      onChange={(_, n) => typeof n === "number" && setVal(toVal(n))}
      defaultValue={defaultLabel}
      aria-labelledby="discrete-slider-restrict"
      step={null}
      valueLabelDisplay="auto"
      marks={[...Array(valRange + 1).keys()]
        .map((i) => i + minVal)
        .map((val) => ({
          value: fromVal(val),
        }))}
      valueLabelFormat={(label: number) => toVal(label).toString()}
      orientation={orientation}
      className="slider discrete-slider"
    />
  );
};

export const ExpSlider = ({
  setExp,
  min,
  max,
  defaultExp = 1,
}: {
  setExp: (arg0: number) => void;
  min: number;
  max: number;
  defaultExp?: number;
}) => {
  const range = Math.log(max) - Math.log(min);
  const toZoom = (x: number) => Math.exp(Math.log(min) + (range * x) / 100);

  const defaultVal = (100 * (Math.log(defaultExp) - Math.log(min))) / range;
  const [val, setVal] = useState(defaultVal);

  return (
    <Slider
      defaultValue={defaultVal}
      value={val}
      onChange={(_, n) => {
        if (typeof n !== "number") {
          return;
        }
        setVal(n);
        setExp(toZoom(n));
      }}
      aria-labelledby="continuous-slider"
      className="slider exp-slider"
    />
  );
};

export const ReferenceSelect = ({
  referencePoint,
  setReferencePoint,
}: {
  referencePoint: ReferencePoint;
  setReferencePoint: (arg0: ReferencePoint) => void;
}) => {
  return (
    <FormControl variant="outlined" className="reference-select">
      <InputLabel>Focus</InputLabel>
      <Select
        value={referencePoint}
        onChange={(e) => {
          const ref = e.target.value as ReferencePoint;
          setReferencePoint(ref);
        }}
        label="Focus"
      >
        <MenuItem value="default">Default</MenuItem>
        <MenuItem value="center">Center</MenuItem>
        <MenuItem value="tip">Tip</MenuItem>
        <MenuItem value="mouse">Custom</MenuItem>
      </Select>
    </FormControl>
  );
};

export const ToggleSwitch = ({
  checked,
  setChecked,
}: {
  checked: boolean;
  setChecked: (arg0: boolean) => void;
}) => (
  <Switch
    checked={checked}
    onChange={(e) => setChecked(e.target.checked)}
    color="primary"
  />
);

export const PauseButton = ({
  paused,
  toggle,
  size = 60,
}: {
  paused: boolean;
  toggle: () => void;
  size?: number;
}) => (
  <button onClick={toggle} className="pause-button">
    {paused ? (
      <PlayArrowIcon style={{ fontSize: size }} />
    ) : (
      <PauseIcon style={{ fontSize: size }} />
    )}
  </button>
);

type Props = {
  controls: ControlsType;
  setControls: React.Dispatch<SetStateAction<ControlsType>>;
  download: (() => void) | null;
};

const Controls = ({ controls, setControls, download }: Props) => {
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      let c = e.keyCode ? e.keyCode : e.charCode;
      console.log(c);

      const k = 4 / 3;
      switch (c) {
        case 40: // down arrow
          setControls({
            ...controls,
            speed: Math.max((1 / k) * controls.speed, minSpeed),
          });
          break;
        case 38: // up arrow
          setControls({
            ...controls,
            speed: Math.min(k * controls.speed, maxSpeed),
          });
          break;
        case 49: // '1'
          setControls({
            ...controls,
            circlesVisible: !controls.circlesVisible,
          });
          break;
        case 50: // '2'
          setControls({ ...controls, pointsVisible: !controls.pointsVisible });
          break;
        case 51: // '3'
          setControls({
            ...controls,
            drawingVisible: !controls.drawingVisible,
          });
          break;
        case 52: // '4'
          setControls({ ...controls, showCurve: !controls.showCurve });
          break;
        case 53: // '5'
          setControls({ ...controls, fillCurve: !controls.fillCurve });
          break;
        case 80: // 'p'
          setControls({ ...controls, paused: !controls.paused });
          break;
      }
    },
    [controls, setControls]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="controls">
      <div className="circles-slider-container">
        <p># Circles</p>
        <DiscreteRootSlider
          val={controls.nCircles}
          setVal={(nCircles) => setControls({ ...controls, nCircles })}
          minVal={1}
          maxVal={maxCircles}
        />
      </div>

      <div className="secondary-controls">
        <div className="playback-container">
          <PauseButton
            paused={controls.paused}
            toggle={() =>
              setControls({ ...controls, paused: !controls.paused })
            }
          />

          <div className="slider-container">
            <p>Speed</p>
            <ExpSlider
              setExp={(speed) => setControls({ ...controls, speed })}
              min={minSpeed}
              max={maxSpeed}
            />
          </div>
        </div>

        <div className="toggles-container">
          <div className="toggle-container">
            <p>Show Circles</p>
            <ToggleSwitch
              checked={controls.circlesVisible}
              setChecked={(circlesVisible) =>
                setControls({ ...controls, circlesVisible })
              }
            />
          </div>
          <div className="toggle-container">
            <p>Show Points</p>
            <ToggleSwitch
              checked={controls.pointsVisible}
              setChecked={(pointsVisible) =>
                setControls({ ...controls, pointsVisible })
              }
            />
          </div>

          <div className="toggle-container">
            <p>Show Drawing</p>
            <ToggleSwitch
              checked={controls.drawingVisible}
              setChecked={(drawingVisible) =>
                setControls({ ...controls, drawingVisible })
              }
            />
          </div>

          <div className="toggle-container">
            <p>Show Curve</p>
            <ToggleSwitch
              checked={controls.showCurve}
              setChecked={(showCurve) =>
                setControls({ ...controls, showCurve })
              }
            />
          </div>

          <div className="toggle-container">
            <p>Fill Curve</p>
            <ToggleSwitch
              checked={controls.fillCurve}
              setChecked={(fillCurve) =>
                setControls({ ...controls, fillCurve })
              }
            />
          </div>
        </div>

        <div className="reference-control-container">
          <ReferenceSelect
            referencePoint={controls.referencePoint}
            setReferencePoint={(referencePoint) =>
              setControls({ ...controls, referencePoint })
            }
          />

          <div className="slider-container">
            <p>Zoom</p>
            <ExpSlider
              setExp={(zoom) => {
                let speed = controls.speed;

                // let speed = maxSpeed/2 - (maxSpeed/2 - minSpeed) * (zoom - minZoom) / (maxZoom - minZoom);
                console.log(speed)
                
                setControls({ ...controls, zoom, speed })}}
              min={minZoom}
              max={maxZoom}
            />
          </div>
        </div>

        <div className="download-container">
          <button
            className="button button-blue"
            onClick={() => download && download()}
          >
            Download as .svg
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
