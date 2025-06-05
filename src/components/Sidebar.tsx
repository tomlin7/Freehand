import { useState } from "react";
import { useStore } from "../store";
import ColorPicker from "./sidebar/ColorPicker";
import StrokeWidthPicker from "./sidebar/StrokeWidthPicker";
import FillPicker from "./sidebar/FillPicker";
import OpacitySlider from "./sidebar/OpacitySlider";
import LayerControls from "./sidebar/LayerControls";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("style");

  const {
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    strokeWidth,
    setStrokeWidth,
    fillStyle,
    setFillStyle,
    opacity,
    setOpacity,
    selectedElements,
    updateElement,
  } = useStore();

  // Handler to update fill color for selected elements and store
  const handleFillColorChange = (color: string) => {
    setFillColor(color);
    if (selectedElements.length > 0) {
      selectedElements.forEach((el) => {
        updateElement(el.id, { fillColor: color });
      });
    }
  };

  // Handler to update fill style for selected elements and store
  const handleFillStyleChange = (style: "none" | "hachure" | "solid") => {
    setFillStyle(style);
    if (selectedElements.length > 0) {
      selectedElements.forEach((el) => {
        updateElement(el.id, { fillStyle: style });
        // If fillColor is transparent and style is not none, set a default color
        if (style !== "none" && el.fillColor === "transparent") {
          updateElement(el.id, { fillColor: "#f28b82" });
        }
      });
    } else if (style !== "none" && fillColor === "transparent") {
      setFillColor("#f28b82");
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-section-title">Stroke</div>
        <ColorPicker
          selectedColor={strokeColor}
          onChange={setStrokeColor}
          colors={[
            "#ffffff",
            "#f28b82",
            "#aecbfa",
            "#cbf0f8",
            "#a7ffeb",
            "#d7aefb",
            "#fdcfe8",
            "#e6c9a8",
            "#e8eaed",
            "#000000",
          ]}
        />
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Background</div>
        <ColorPicker
          selectedColor={fillColor}
          onChange={handleFillColorChange}
          colors={[
            "transparent",
            "#f28b82",
            "#aecbfa",
            "#cbf0f8",
            "#a7ffeb",
            "#d7aefb",
            "#fdcfe8",
            "#e6c9a8",
            "#e8eaed",
            "#000000",
          ]}
        />
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Fill</div>
        <FillPicker selectedFill={fillStyle} onChange={handleFillStyleChange} />
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Stroke width</div>
        <StrokeWidthPicker
          selectedWidth={strokeWidth}
          onChange={setStrokeWidth}
          options={[1, 2, 4]}
        />
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Opacity</div>
        <OpacitySlider value={opacity} onChange={setOpacity} />
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Layers</div>
        <LayerControls />
      </div>
    </div>
  );
};

export default Sidebar;
