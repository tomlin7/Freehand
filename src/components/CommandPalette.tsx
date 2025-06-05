import { useEffect, useRef, useState } from "react";
import {
  Command,
  FilePlus,
  Save,
  Image as ImageIcon,
  Trash2,
  Sun,
  Moon,
  Palette,
} from "lucide-react";

const COMMANDS = [
  { icon: <FilePlus size={18} />, label: "Open", action: "open" },
  { icon: <Save size={18} />, label: "Save", action: "save" },
  { icon: <ImageIcon size={18} />, label: "Export image", action: "export" },
  { icon: <Trash2 size={18} />, label: "Reset canvas", action: "reset" },
  { icon: <Sun size={18} />, label: "Light theme", action: "theme-light" },
  { icon: <Moon size={18} />, label: "Dark theme", action: "theme-dark" },
  {
    icon: <Palette size={18} />,
    label: "Change background",
    action: "background",
  },
];

const CommandPalette = ({
  open,
  onClose,
  onCommand,
}: {
  open: boolean;
  onClose: () => void;
  onCommand?: (action: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      setSearch("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown")
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      if (e.key === "ArrowUp") setSelected((s) => Math.max(s - 1, 0));
      if (e.key === "Enter") {
        if (filtered[selected]) {
          onCommand?.(filtered[selected].action);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, selected, search]);
  const filtered = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(24,24,32,0.5)",
        zIndex: 5000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#23242a",
          borderRadius: 16,
          minWidth: 400,
          boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
          color: "#f3f4f6",
          border: "1.5px solid #35363c",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "18px 18px 0 18px",
          }}
        >
          <Command size={20} style={{ color: "#6366f1" }} />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 18,
              outline: "none",
            }}
          />
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto", marginTop: 8 }}>
          {filtered.map((cmd, i) => (
            <div
              key={cmd.action}
              onClick={() => {
                onCommand?.(cmd.action);
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 18px",
                background: i === selected ? "#35363c" : "none",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 16,
                color: i === selected ? "#fff" : "#f3f4f6",
              }}
            >
              <span
                style={{
                  color: "#6366f1",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {cmd.icon}
              </span>
              <span style={{ flex: 1 }}>{cmd.label}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ color: "#888", textAlign: "center", padding: 24 }}>
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CommandPalette;
