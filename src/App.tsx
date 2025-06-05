import { useState, useEffect, useRef } from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import Sidebar from "./components/Sidebar";
import BottomBar from "./components/BottomBar";
import { useStore } from "./store";
import "./styles/app.css";
import {
  Menu,
  Sun,
  Moon,
  Download,
  Save,
  FilePlus,
  Github,
  Image as ImageIcon,
  Users,
  HelpCircle,
  Palette,
  Undo2,
  Redo2,
  Search,
  Command,
  Trash2,
  LogIn,
  LogOut,
  Globe,
  ChevronDown,
} from "lucide-react";
import CommandPalette from "./components/CommandPalette";

const LeftMenu = ({
  open,
  onOpen,
  onSave,
  onExport,
  onReset,
  onBg,
  canvasBg,
  onCommandPalette,
}: {
  open: boolean;
  onOpen: () => void;
  onSave: () => void;
  onExport: () => void;
  onReset: () => void;
  onBg: (bg: string) => void;
  canvasBg: string;
  onCommandPalette: () => void;
}) => {
  const colors = [
    "#fff",
    "#f28b82",
    "#aecbfa",
    "#cbf0f8",
    "#a7ffeb",
    "#d7aefb",
    "#fdcfe8",
    "#e6c9a8",
    "#e8eaed",
    "#000",
    "#18181b",
    "#23242a",
    "#292a31",
    "#35363c",
  ];
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 50,
        left: 16,
        zIndex: 4000,
        width: 250,
        background: "#18181b",
        borderRadius: 18,
        boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
        color: "#f3f4f6",
        padding: 0,
        overflow: "hidden",
        border: "1.5px solid #23242a",
        animation: "fadeIn 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 18px 8px 18px",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 18 }}>Menu</span>
      </div>
      <div style={{ padding: "0 8px 8px 8px" }}>
        <MenuItem
          icon={<FilePlus size={18} />}
          label="Open"
          shortcut="Ctrl+O"
          onClick={onOpen}
        />
        <MenuItem
          icon={<Save size={18} />}
          label="Save to..."
          onClick={onSave}
        />
        <MenuItem
          icon={<ImageIcon size={18} />}
          label="Export image..."
          shortcut="Ctrl+Shift+E"
          onClick={onExport}
        />
        <MenuItem
          icon={<Command size={18} />}
          label={<span style={{ color: "#6366f1" }}>Command palette</span>}
          shortcut="Ctrl+/"
          onClick={onCommandPalette}
        />
        <MenuItem
          icon={<Trash2 size={18} />}
          label="Reset the canvas"
          onClick={onReset}
        />
        <div style={{ borderTop: "1px solid #23242a", margin: "10px 0" }} />
        <MenuItem
          icon={<Github size={18} />}
          label="GitHub"
          onClick={() =>
            window.open("https://github.com/tomlin7/Freehand", "_blank")
          }
        />
        <div style={{ borderTop: "1px solid #23242a", margin: "10px 0" }} />
        <div
          style={{ fontSize: 13, color: "#b3b3bc", margin: "10px 0 4px 8px" }}
        >
          Canvas background
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginLeft: 8,
            marginBottom: 10,
          }}
        >
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => onBg(c)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: c,
                border:
                  canvasBg === c ? "2px solid #6366f1" : "1.5px solid #23242a",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const MenuItem = ({
  icon,
  label,
  shortcut,
  onClick,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 8px",
      borderRadius: 8,
      cursor: "pointer",
      transition: "background 0.15s",
      fontSize: 15,
      fontWeight: 500,
      color: "#f3f4f6",
      marginBottom: 2,
      userSelect: "none",
    }}
    onClick={onClick}
    onMouseOver={(e) => (e.currentTarget.style.background = "#23272f")}
    onMouseOut={(e) => (e.currentTarget.style.background = "none")}
  >
    <span style={{ color: "#6366f1", display: "flex", alignItems: "center" }}>
      {icon}
    </span>
    <span style={{ flex: 1 }}>{label}</span>
    {shortcut && (
      <span style={{ color: "#b3b3bc", fontSize: 13, marginLeft: 8 }}>
        {shortcut}
      </span>
    )}
  </div>
);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [resetFlag, setResetFlag] = useState(false);
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const canvasBg = useStore((state) => state.canvasBg);
  const setCanvasBg = useStore((state) => state.setCanvasBg);
  const elements = useStore((state) => state.elements);
  const setElements = useStore((state) => state.setElements);
  const canvasRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Save, Open, Export handlers
  const handleSave = () => {
    canvasRef.current?.saveAsJson();
  };
  const handleOpen = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      canvasRef.current?.loadFromJson(ev.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const handleExport = () => {
    const url = canvasRef.current?.exportAsImage();
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = "freehand-canvas.png";
      a.click();
    }
  };
  const handleReset = () => {
    setElements([]);
    setCanvasBg("#000");
    setMenuOpen(false);
    setResetFlag((f) => !f);
    if (menuBtnRef.current) menuBtnRef.current.blur();
  };

  // Command palette actions
  const handleCommand = (action: string) => {
    if (action === "open") handleOpen();
    else if (action === "save") handleSave();
    else if (action === "export") handleExport();
    else if (action === "reset") handleReset();
    else if (action === "background") setShowBgPicker(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const handleMenuToggle = () => setMenuOpen((open) => !open);

  return (
    <div className="app-container">
      <div className={`flex flex-col h-screen ${"bg-gray-900 text-white"}`}>
        <button
          ref={menuBtnRef}
          style={{
            position: "fixed",
            top: 18,
            left: 18,
            zIndex: 5000,
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 28,
            cursor: "pointer",
            borderRadius: 8,
            padding: 4,
          }}
          onClick={handleMenuToggle}
        >
          <Menu size={28} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <LeftMenu
          open={menuOpen}
          onOpen={handleOpen}
          onSave={handleSave}
          onExport={handleExport}
          onReset={handleReset}
          onBg={setCanvasBg}
          canvasBg={canvasBg}
          onCommandPalette={() => setCommandPaletteOpen(true)}
        />
        <Toolbar mode={mode} setMode={setMode} toggleSidebar={toggleSidebar} />
        <div className="flex flex-1 overflow-hidden">
          <Canvas
            canvasBg={canvasBg}
            forwardedRef={canvasRef}
            resetFlag={resetFlag}
          />
        </div>
        <BottomBar />
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onCommand={handleCommand}
        />
        {showBgPicker && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(24,24,32,0.5)",
              zIndex: 6000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowBgPicker(false)}
          >
            <div
              style={{
                background: "#23242a",
                borderRadius: 16,
                minWidth: 320,
                boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
                color: "#f3f4f6",
                border: "1.5px solid #35363c",
                padding: 24,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {[
                "#fff",
                "#f28b82",
                "#aecbfa",
                "#cbf0f8",
                "#a7ffeb",
                "#d7aefb",
                "#fdcfe8",
                "#e6c9a8",
                "#e8eaed",
                "#000",
                "#18181b",
                "#23242a",
                "#292a31",
                "#35363c",
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCanvasBg(c);
                    setShowBgPicker(false);
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: c,
                    border:
                      canvasBg === c
                        ? "2px solid #6366f1"
                        : "1.5px solid #23242a",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
