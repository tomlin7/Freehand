import {
  MousePointer,
  Square,
  Circle,
  Triangle,
  ArrowRight,
  Minus,
  Pencil,
  Diamond,
  Image,
  Type,
  Lock,
  Unlock,
  Sidebar,
  SidebarClose,
  SidebarOpen,
} from "lucide-react";
import { DrawingMode } from "../types";
import { useState } from "react";

declare global {
  interface Window {
    __toolLock: boolean;
  }
}

type ToolbarProps = {
  mode: DrawingMode;
  setMode: (mode: DrawingMode) => void;
  toggleSidebar: () => void;
};

const Toolbar = ({ mode, setMode, toggleSidebar }: ToolbarProps) => {
  const [locked, setLocked] = useState(false);
  const tools = [
    {
      id: "selection",
      icon: <MousePointer size={20} />,
      tooltip: "Selection Tool (V)",
    },
    { id: "rectangle", icon: <Square size={20} />, tooltip: "Rectangle (R)" },
    { id: "diamond", icon: <Diamond size={20} />, tooltip: "Diamond (D)" },
    { id: "ellipse", icon: <Circle size={20} />, tooltip: "Ellipse (E)" },
    { id: "arrow", icon: <ArrowRight size={20} />, tooltip: "Arrow (A)" },
    { id: "line", icon: <Minus size={20} />, tooltip: "Line (L)" },
    { id: "pencil", icon: <Pencil size={20} />, tooltip: "Pencil (P)" },
    { id: "text", icon: <Type size={20} />, tooltip: "Text (T)" },
    { id: "image", icon: <Image size={20} />, tooltip: "Image (I)" },
  ];

  // Expose lock state to window for Canvas to read (quick solution)
  window.__toolLock = locked;

  return (
    <div className="toolbar">
      {/* <button
        className="toolbar-button"
        onClick={toggleSidebar}
        title="Toggle Sidebar"
      >
        {sidebarOpen ? <SidebarClose size={20} /> : <Sidebar size={20} />}
      </button> */}
      <button
        className={`toolbar-button ${locked ? "active" : ""}`}
        onClick={() => setLocked((l) => !l)}
        title={
          locked
            ? "Unlock tool (auto-select after use)"
            : "Lock tool (stay in tool after use)"
        }
      >
        {locked ? <Lock size={20} /> : <Unlock size={20} />}
      </button>
      <div className="flex-1 flex justify-center">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`toolbar-button ${mode === tool.id ? "active" : ""}`}
            onClick={() => setMode(tool.id as DrawingMode)}
            title={tool.tooltip}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      <div className="flex">
        <button className="share-button  ml-2" title="Share">
          Share
        </button>
        <button
          className="library-button ml-2"
          title="Open Library"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("open-library-modal"))
          }
        >
          Library
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
