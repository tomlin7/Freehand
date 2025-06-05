import { useRef, useEffect, useState } from "react";
import { useStore } from "../store";
import { createElement, updateElement, drawElement } from "../utils/element";
import { getElementAtPosition, getNewElementPosition } from "../utils/position";
import rough from "roughjs/bin/rough";
import { nanoid } from "nanoid";
import { Element } from "../types";
import useKeyboardShortcuts from "../utils/keyboard";
import {
  Trash2,
  Download,
  PlusCircle,
  File,
  ArrowDownToLine,
} from "lucide-react";
import Sidebar from "./Sidebar";

type LibraryItem = {
  id: string;
  name: string;
  elements: any[];
  created: number;
};

function getLibrary(): LibraryItem[] {
  try {
    const raw = localStorage.getItem("freehand-library");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function setLibrary(items: LibraryItem[]) {
  localStorage.setItem("freehand-library", JSON.stringify(items));
}

type LibraryModalProps = {
  open: boolean;
  onClose: () => void;
  elements: any[];
  onSave: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onOpen: (item: LibraryItem) => void;
  library: LibraryItem[];
  onDelete: (id: string) => void;
};

const timeAgo = (date: number) => {
  const now = Date.now();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
};

const LibraryModal = ({
  open,
  onClose,
  elements,
  onSave,
  onImport,
  onExport,
  onOpen,
  library,
  onDelete,
}: LibraryModalProps) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  if (!open) return null;
  const filtered = library.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(24, 24, 32, 0.85)",
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "#23242a",
          borderRadius: 28,
          padding: 0,
          minWidth: 900,
          minHeight: 600,
          boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
          position: "relative",
          color: "#f3f4f6",
          fontFamily: "inherit",
          overflow: "hidden",
          border: "1.5px solid #35363c",
        }}
      >
        <button
          style={{
            position: "absolute",
            top: 18,
            right: 24,
            background: "none",
            border: "none",
            color: "#aaa",
            fontSize: 28,
            cursor: "pointer",
            transition: "color 0.2s",
            zIndex: 2,
            padding: 8,
            lineHeight: 1,
          }}
          onClick={onClose}
          onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#aaa")}
        >
          ✕
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#23242a",
            padding: "32px 70px 0 40px",
            gap: 24,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              color: "#fff",
              marginRight: 28,
              letterSpacing: -0.5,
              paddingBottom: 12,
              borderBottom: "3px solid #6366f1",
              whiteSpace: "nowrap",
            }}
          >
            Recently viewed
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              position: "relative",
              minWidth: 0,
            }}
          >
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "#23272f",
                border: "1.5px solid #35363c",
                borderRadius: 10,
                color: "#fff",
                fontSize: 16,
                padding: "10px 44px 10px 16px",
                outline: "none",
                boxShadow: "none",
                fontWeight: 500,
                minWidth: 0,
              }}
            />
            <File
              size={20}
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6366f1",
                opacity: 0.7,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginLeft: 24,
            }}
          >
            <button
              onClick={onSave}
              disabled={!elements.length}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                padding: "10px 22px",
                fontWeight: 600,
                fontSize: 16,
                cursor: elements.length ? "pointer" : "not-allowed",
                opacity: elements.length ? 1 : 0.5,
                transition: "background 0.2s",
                minWidth: 120,
                justifyContent: "center",
              }}
            >
              Save Selection
            </button>
            <button
              onClick={onExport}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#35363c",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                padding: "10px 22px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                transition: "background 0.2s",
                minWidth: 100,
                justifyContent: "center",
              }}
            >
              <Download
                style={{
                  width: 20,
                  height: 20,
                }}
              />
              Export
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#35363c",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                padding: "10px 22px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                transition: "background 0.2s",
                minWidth: 100,
                justifyContent: "center",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <PlusCircle
                style={{
                  width: 20,
                  height: 20,
                }}
              />
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={onImport}
            />
          </div>
        </div>
        {importError && (
          <div style={{ color: "#f87171", marginTop: 8, marginLeft: 40 }}>
            {importError}
          </div>
        )}
        <div style={{ padding: 40, paddingTop: 24 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
              gap: 24,
            }}
          >
            {filtered.length === 0 && (
              <div
                style={{
                  color: "#888",
                  textAlign: "center",
                  gridColumn: "1/-1",
                  marginTop: 40,
                }}
              >
                No items found.
              </div>
            )}
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#23242a",
                  border: "1.5px solid #35363c",
                  borderRadius: 18,
                  boxShadow:
                    hoveredId === item.id
                      ? "0 4px 24px rgba(99,102,241,0.10)"
                      : "0 2px 8px rgba(0,0,0,0.10)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  minHeight: 220,
                  position: "relative",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s, border 0.2s",
                  cursor: "pointer",
                  outline: hoveredId === item.id ? "2px solid #6366f1" : "none",
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  style={{
                    background: "#23272f",
                    height: 110,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: "1.5px solid #35363c",
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      background: "#262b36",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6366f1",
                      fontSize: 32,
                      fontWeight: 700,
                      letterSpacing: -2,
                    }}
                  >
                    {item.name[0]?.toUpperCase() || "L"}
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "18px 18px 10px 18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <ArrowDownToLine
                      size={16}
                      color="#6366f1"
                      style={{
                        background: "#23272f",
                        borderRadius: 5,
                        marginRight: 2,
                      }}
                    />
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#fff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#b3b3bc",
                      marginBottom: 8,
                    }}
                  >
                    Edited {timeAgo(item.created)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: "auto",
                      justifyContent: "flex-end",
                      opacity: hoveredId === item.id ? 1 : 0,
                      pointerEvents: hoveredId === item.id ? "auto" : "none",
                      transition: "opacity 0.2s",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen(item);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: 7,
                        padding: "7px 14px",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                    >
                      <ArrowDownToLine size={14} style={{ marginRight: 2 }} />
                      Insert
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: 7,
                        padding: "7px 14px",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                    >
                      <Trash2 size={14} style={{ marginRight: 2 }} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Canvas = ({
  canvasBg = "#000",
  forwardedRef,
  onExportImage,
  resetFlag,
}: {
  canvasBg?: string;
  forwardedRef?: any;
  onExportImage?: (dataUrl: string) => void;
  resetFlag?: boolean;
}) => {
  useKeyboardShortcuts();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [action, setAction] = useState<
    | "none"
    | "drawing"
    | "moving"
    | "resizing"
    | "panning"
    | "rotating"
    | "group-selecting"
  >("none");
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  const [startPosition, setStartPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [lastPanPosition, setLastPanPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [moveOrigin, setMoveOrigin] = useState<{
    mouseX: number;
    mouseY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [rotationOrigin, setRotationOrigin] = useState<{
    startAngle: number;
    elementAngle: number;
  } | null>(null);
  const [textInput, setTextInput] = useState<{
    visible: boolean;
    x: number;
    y: number;
    value: string;
    elementId: string | null;
  }>({ visible: false, x: 0, y: 0, value: "", elementId: null });
  const [selectionRect, setSelectionRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [library, setLibraryState] = useState<LibraryItem[]>(getLibrary());

  const {
    elements,
    setElements,
    mode,
    strokeColor,
    fillColor,
    strokeWidth,
    roughness,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    opacity,
    fillStyle,
    selectElement,
    deselectAll,
    selectedElements,
    setSelectedElements,
  } = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Fill background with canvasBg
    context.save();
    canvas.style.backgroundColor = canvasBg;
    context.fillStyle = canvasBg;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    // Set transformation for zoom and pan
    context.save();
    context.translate(panOffset.x, panOffset.y);
    context.scale(zoom, zoom);

    // Create RoughJS generator
    const generator = rough.generator();

    // Draw all elements
    elements.forEach((element) => {
      drawElement(context, element, generator);
    });

    // Draw selection rectangle and handles if an element is selected
    if (selectedElement) {
      if (
        selectedElement.type === "pencil" &&
        selectedElement.points &&
        selectedElement.points.length > 0
      ) {
        // Draw bounding box for pencil
        const xs = selectedElement.points.map((pt: [number, number]) => pt[0]);
        const ys = selectedElement.points.map((pt: [number, number]) => pt[1]);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        context.save();
        context.strokeStyle = "#8a2be2";
        context.lineWidth = 1 / zoom;
        context.setLineDash([4 / zoom, 2 / zoom]);
        context.strokeRect(minX, minY, maxX - minX, maxY - minY);
        context.setLineDash([]);
        context.restore();
      } else {
        context.save();

        // Apply rotation around the element's center
        const angle = selectedElement.angle || 0;
        const centerX = selectedElement.x + selectedElement.width / 2;
        const centerY = selectedElement.y + selectedElement.height / 2;
        context.translate(centerX, centerY);
        context.rotate(angle);
        context.translate(-centerX, -centerY);

        context.strokeStyle = "#8a2be2";
        context.lineWidth = 1 / zoom;
        context.setLineDash([4 / zoom, 2 / zoom]);
        context.strokeRect(
          selectedElement.x,
          selectedElement.y,
          selectedElement.width,
          selectedElement.height
        );
        context.setLineDash([]);

        // Draw resize handles (corners)
        const handleSize = 16 / zoom;
        const half = handleSize / 2;
        const corners: [number, number][] = [
          [selectedElement.x, selectedElement.y],
          [selectedElement.x + selectedElement.width, selectedElement.y],
          [selectedElement.x, selectedElement.y + selectedElement.height],
          [
            selectedElement.x + selectedElement.width,
            selectedElement.y + selectedElement.height,
          ],
        ];
        corners.forEach(([cornerX, cornerY]) => {
          context.fillStyle = "#fff";
          context.strokeStyle = "#8a2be2";
          context.lineWidth = 1 / zoom;
          context.beginPath();
          context.rect(cornerX - half, cornerY - half, handleSize, handleSize);
          context.fill();
          context.stroke();
        });

        // Draw rotation handle (above the top center)
        const topCenterX = selectedElement.x + selectedElement.width / 2;
        const topCenterY = selectedElement.y;
        const rotationHandleDistance = 32 / zoom;
        const rotationHandleX = topCenterX;
        const rotationHandleY = topCenterY - rotationHandleDistance;
        context.beginPath();
        context.arc(
          rotationHandleX,
          rotationHandleY,
          handleSize,
          0,
          2 * Math.PI
        );
        context.fillStyle = "#fff";
        context.fill();
        context.strokeStyle = "#8a2be2";
        context.stroke();
        // Draw a line connecting the top center to the rotation handle
        context.beginPath();
        context.moveTo(topCenterX, topCenterY);
        context.lineTo(rotationHandleX, rotationHandleY + handleSize);
        context.stroke();

        context.restore();
      }
    }

    // Draw group selection rectangle if multiple elements are selected
    if (selectedElements && selectedElements.length > 1) {
      // Compute bounding box
      const minX = Math.min(...selectedElements.map((el) => el.x));
      const minY = Math.min(...selectedElements.map((el) => el.y));
      const maxX = Math.max(...selectedElements.map((el) => el.x + el.width));
      const maxY = Math.max(...selectedElements.map((el) => el.y + el.height));
      context.save();
      context.setLineDash([4 / zoom, 2 / zoom]);
      context.strokeStyle = "#8a2be2";
      context.lineWidth = 1 / zoom;
      context.strokeRect(minX, minY, maxX - minX, maxY - minY);
      context.setLineDash([]);
      context.restore();
    }

    // Draw group selection rectangle (dragging)
    if (selectionRect) {
      context.save();
      context.setLineDash([6 / zoom, 4 / zoom]);
      context.strokeStyle = "#1976d2";
      context.lineWidth = 1 / zoom;
      context.strokeRect(
        selectionRect.x,
        selectionRect.y,
        selectionRect.width,
        selectionRect.height
      );
      context.restore();
    }

    context.restore();
  }, [
    elements,
    zoom,
    panOffset,
    selectedElement,
    selectionRect,
    selectedElements,
    canvasBg,
    resetFlag,
  ]);

  // Handle wheel events for zooming and panning
  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    if (event.ctrlKey) {
      // Zoom with Ctrl + Wheel
      const delta = event.deltaY;
      const factor = 0.9;
      const newZoom = delta > 0 ? zoom * factor : zoom / factor;
      setZoom(Math.min(Math.max(0.1, newZoom), 5));
    } else if (event.shiftKey) {
      // Horizontal scroll with Shift + Wheel
      setPanOffset({
        x: panOffset.x - event.deltaY,
        y: panOffset.y,
      });
    } else {
      // Vertical scroll with Wheel
      setPanOffset({
        x: panOffset.x,
        y: panOffset.y - event.deltaY,
      });
    }
  };

  // Adjust canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Redraw elements after resize
      const context = canvas.getContext("2d");
      if (!context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      const generator = rough.generator();

      elements.forEach((element) => {
        drawElement(context, element, generator);
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial sizing

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [elements]);

  // Helper to detect if mouse is near a handle
  function getHandleAtPosition(
    x: number,
    y: number,
    element: Element,
    zoom: number
  ): string | null {
    // Increase handle size for easier clicking
    const handleSize = 28 / zoom; // was 16 / zoom
    const half = handleSize / 2;
    const angle = element.angle || 0;
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    // Transform mouse coordinates into element's local (unrotated) space
    const translatedX = x - centerX;
    const translatedY = y - centerY;
    const localX =
      translatedX * Math.cos(-angle) - translatedY * Math.sin(-angle) + centerX;
    const localY =
      translatedX * Math.sin(-angle) + translatedY * Math.cos(-angle) + centerY;

    const handles = [
      { name: "tl", x: element.x, y: element.y },
      { name: "tr", x: element.x + element.width, y: element.y },
      { name: "bl", x: element.x, y: element.y + element.height },
      {
        name: "br",
        x: element.x + element.width,
        y: element.y + element.height,
      },
    ];
    for (const handle of handles) {
      if (
        Math.abs(localX - handle.x) < half &&
        Math.abs(localY - handle.y) < half
      ) {
        return handle.name;
      }
    }
    // Rotation handle (above top center)
    const topCenterX = element.x + element.width / 2;
    const topCenterY = element.y;
    const rotationHandleDistance = 40 / zoom; // was 32 / zoom
    const rotationHandleX = topCenterX;
    const rotationHandleY = topCenterY - rotationHandleDistance;
    // Use a larger hit area for the rotation handle
    const rotationHitRadius = handleSize * 1.5; // was 1.8, but handleSize is now bigger
    if (
      Math.hypot(localX - rotationHandleX, localY - rotationHandleY) <
      rotationHitRadius
    ) {
      return "rotate";
    }
    // Do NOT return 'inside' here; let main logic handle inside clicks
    return null;
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const { clientX, clientY } = event;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - panOffset.x) / zoom;
    const y = (clientY - rect.top - panOffset.y) / zoom;

    if (event.button === 1) {
      setAction("panning");
      setLastPanPosition({ x: clientX, y: clientY });
      return;
    }

    if (mode === "selection") {
      // Check if clicking on any element (topmost first)
      let clickedElement: any = null;
      let clickedHandle: string | null = null;
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        // Check handles first
        const handle = getHandleAtPosition(x, y, el, zoom);
        if (handle) {
          clickedElement = el;
          clickedHandle = handle;
          break;
        }
        // Then check inside bounds (unrotated for simplicity)
        const angle = el.angle || 0;
        const centerX = el.x + el.width / 2;
        const centerY = el.y + el.height / 2;
        const translatedX = x - centerX;
        const translatedY = y - centerY;
        const localX =
          translatedX * Math.cos(-angle) -
          translatedY * Math.sin(-angle) +
          centerX;
        const localY =
          translatedX * Math.sin(-angle) +
          translatedY * Math.cos(-angle) +
          centerY;
        if (
          localX >= el.x &&
          localX <= el.x + el.width &&
          localY >= el.y &&
          localY <= el.y + el.height
        ) {
          clickedElement = el;
          break;
        }
      }

      if (clickedElement && clickedHandle) {
        // Clicked a handle (resize or rotate)
        if (clickedHandle === "rotate") {
          setIsRotating(true);
          setAction("rotating");
          const centerX = clickedElement.x + clickedElement.width / 2;
          const centerY = clickedElement.y + clickedElement.height / 2;
          const startAngle = Math.atan2(y - centerY, x - centerX);
          setRotationOrigin({
            startAngle,
            elementAngle: clickedElement.angle || 0,
          });
        } else {
          setResizeHandle(clickedHandle);
          setAction("resizing");
        }
        setSelectedElement(clickedElement);
        selectElement(clickedElement.id);
        setStartPosition({ x, y });
        setMoveOrigin(null);
        return;
      } else if (clickedElement) {
        // Clicked inside an element
        if (selectedElement && selectedElement.id === clickedElement.id) {
          // Already selected, start moving
          setAction("moving");
          setStartPosition({ x, y });
          setMoveOrigin({
            mouseX: x,
            mouseY: y,
            origX: clickedElement.x,
            origY: clickedElement.y,
          });
        } else {
          // Select it (do not start moving)
          setSelectedElement(clickedElement);
          selectElement(clickedElement.id);
        }
        return;
      } else {
        // Clicked outside all elements: start group selection
        setAction("group-selecting");
        setStartPosition({ x, y });
        setSelectionRect({ x, y, width: 0, height: 0 });
        deselectAll();
        setSelectedElement(null);
        return;
      }
    } else if (mode === "text") {
      // Create a text element and show input
      const id = nanoid();
      const fontSize = 20;
      const newElement = createElement({
        id,
        type: "text",
        x,
        y,
        width: 0,
        height: 0,
        strokeColor,
        fillColor,
        strokeWidth,
        roughness,
        opacity,
        fillStyle,
        text: "",
        fontSize,
        fontFamily: "sans-serif",
        textAlign: "left",
      });
      setElements([...elements, newElement]);
      setSelectedElement(newElement);
      selectElement(id);
      setTextInput({
        visible: true,
        x: x * zoom + panOffset.x,
        y: y * zoom + panOffset.y,
        value: "",
        elementId: id,
      });
      setAction("none");
      setStartPosition(null);
      return;
    } else if (mode === "image") {
      // Create an image element and trigger file input
      const id = nanoid();
      const newElement = createElement({
        id,
        type: "image",
        x,
        y,
        width: 100,
        height: 100,
        strokeColor,
        fillColor,
        strokeWidth,
        roughness,
        opacity,
        fillStyle,
        image: "",
      });
      setElements([...elements, newElement]);
      setSelectedElement(newElement);
      selectElement(id);
      setAction("none");
      setStartPosition(null);
      // Open file picker
      setTimeout(() => {
        fileInputRef.current?.click();
        // Store the id for later update
        fileInputRef.current!.dataset.elementId = id;
      }, 0);
      return;
    } else {
      const id = nanoid();
      const newElement = createElement({
        id,
        type: mode,
        x,
        y,
        width: 0,
        height: 0,
        strokeColor,
        fillColor,
        strokeWidth,
        roughness,
        opacity,
        fillStyle,
        points: mode === "pencil" ? [[x, y]] : undefined,
      });
      setElements([...elements, newElement]);
      setSelectedElement(newElement);
      selectElement(id);
      setAction("drawing");
    }
    setStartPosition({ x, y });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const { clientX, clientY } = event;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - panOffset.x) / zoom;
    const y = (clientY - rect.top - panOffset.y) / zoom;

    if (action === "panning" && lastPanPosition) {
      const deltaX = clientX - lastPanPosition.x;
      const deltaY = clientY - lastPanPosition.y;
      setPanOffset({ x: panOffset.x + deltaX, y: panOffset.y + deltaY });
      setLastPanPosition({ x: clientX, y: clientY });
      return;
    }

    if (action === "group-selecting" && startPosition) {
      const { x: startX, y: startY } = startPosition;
      setSelectionRect({
        x: Math.min(startX, x),
        y: Math.min(startY, y),
        width: Math.abs(x - startX),
        height: Math.abs(y - startY),
      });
      return;
    }

    if (!startPosition || !selectedElement) return;

    if (action === "drawing") {
      const { x: startX, y: startY } = startPosition;
      const updatedElements = [...elements];
      const index = elements.findIndex((el) => el.id === selectedElement.id);
      if (index !== -1) {
        if (mode === "pencil") {
          const newPoints = [...(updatedElements[index].points || []), [x, y]];
          updatedElements[index] = {
            ...updatedElements[index],
            points: newPoints,
          };
        } else {
          const { newX, newY, newWidth, newHeight } = getNewElementPosition(
            startX,
            startY,
            x,
            y,
            mode
          );
          updatedElements[index] = {
            ...updatedElements[index],
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          };
        }
        setElements(updatedElements);
      }
    } else if (action === "moving" && selectedElement && moveOrigin) {
      const { mouseX, mouseY, origX, origY } = moveOrigin;
      const deltaX = x - mouseX;
      const deltaY = y - mouseY;
      const updatedElements = [...elements];
      const index = elements.findIndex((el) => el.id === selectedElement.id);
      if (index !== -1) {
        updatedElements[index] = {
          ...updatedElements[index],
          x: origX + deltaX,
          y: origY + deltaY,
        };
        setElements(updatedElements);
        setSelectedElement(updatedElements[index]);
      }
    } else if (action === "resizing" && resizeHandle && selectedElement) {
      const { x: startX, y: startY } = startPosition;
      let newX = selectedElement.x;
      let newY = selectedElement.y;
      let newWidth = selectedElement.width;
      let newHeight = selectedElement.height;
      if (resizeHandle === "tl") {
        newX = x;
        newY = y;
        newWidth = selectedElement.x + selectedElement.width - x;
        newHeight = selectedElement.y + selectedElement.height - y;
      } else if (resizeHandle === "tr") {
        newY = y;
        newWidth = x - selectedElement.x;
        newHeight = selectedElement.y + selectedElement.height - y;
      } else if (resizeHandle === "bl") {
        newX = x;
        newWidth = selectedElement.x + selectedElement.width - x;
        newHeight = y - selectedElement.y;
      } else if (resizeHandle === "br") {
        newWidth = x - selectedElement.x;
        newHeight = y - selectedElement.y;
      }
      // Prevent negative width/height
      newWidth = Math.max(1, newWidth);
      newHeight = Math.max(1, newHeight);
      const updatedElements = [...elements];
      const index = elements.findIndex((el) => el.id === selectedElement.id);
      if (index !== -1) {
        updatedElements[index] = {
          ...updatedElements[index],
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };
        setElements(updatedElements);
        setSelectedElement(updatedElements[index]);
      }
    } else if (action === "rotating" && selectedElement) {
      const centerX = selectedElement.x + selectedElement.width / 2;
      const centerY = selectedElement.y + selectedElement.height / 2;
      const currentAngle = Math.atan2(y - centerY, x - centerX);
      let newAngle = currentAngle;
      if (rotationOrigin) {
        newAngle =
          rotationOrigin.elementAngle +
          (currentAngle - rotationOrigin.startAngle);
      }
      const updatedElements = [...elements];
      const index = elements.findIndex((el) => el.id === selectedElement.id);
      if (index !== -1) {
        updatedElements[index] = { ...updatedElements[index], angle: newAngle };
        setElements(updatedElements);
        setSelectedElement(updatedElements[index]);
      }
    }
  };

  const handleMouseUp = () => {
    if (
      action === "drawing" ||
      action === "moving" ||
      action === "panning" ||
      action === "resizing" ||
      action === "rotating" ||
      action === "group-selecting"
    ) {
      setAction("none");
      setStartPosition(null);
      setLastPanPosition(null);
      setResizeHandle(null);
      setIsRotating(false);
      setRotationOrigin(null);
    }
    if (action === "group-selecting" && selectionRect) {
      // Select all elements fully within the selection rectangle
      const { x, y, width, height } = selectionRect;
      const selected = elements.filter((el) => {
        // Ignore elements with 0 width/height
        if (el.width === 0 || el.height === 0) return false;
        // Check if element's bounding box is fully inside selection rect
        return (
          el.x >= x &&
          el.y >= y &&
          el.x + el.width <= x + width &&
          el.y + el.height <= y + height
        );
      });
      setSelectedElements(selected);
      setSelectionRect(null);
    }
    setMoveOrigin(null);
  };

  // Handle text input confirm
  const handleTextInputBlur = () => {
    if (textInput.elementId) {
      let width = 0;
      let height = 0;
      let x = 0;
      let y = 0;
      // Find the element to get its original x/y
      const element = elements.find((el) => el.id === textInput.elementId);
      if (textInput.value && element) {
        // Measure text width and height using canvas context
        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext("2d");
          if (context) {
            context.font = `${element.fontSize || 20}px ${
              element.fontFamily || "sans-serif"
            }`;
            width = Math.max(40, context.measureText(textInput.value).width);
            height = element.fontSize || 20;
            // x/y should remain as the original click position
            x = element.x;
            y = element.y;
          }
        }
      } else if (element) {
        x = element.x;
        y = element.y;
        width = 40;
        height = element.fontSize || 20;
      }
      const updatedElements = elements.map((el) =>
        el.id === textInput.elementId
          ? { ...el, text: textInput.value, width, height, x, y }
          : el
      );
      setElements(updatedElements);
    }
    setTextInput({ visible: false, x: 0, y: 0, value: "", elementId: null });
  };

  // Handle image file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const elementId = e.target.dataset.elementId;
    if (file && elementId) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const updatedElements = elements.map((el) =>
          el.id === elementId ? { ...el, image: dataUrl } : el
        );
        setElements(updatedElements);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input value so the same file can be selected again
    e.target.value = "";
  };

  useEffect(() => {
    const openListener = () => setLibraryOpen(true);
    window.addEventListener("open-library-modal", openListener);
    return () => window.removeEventListener("open-library-modal", openListener);
  }, []);

  // Save current selection to library
  const handleLibrarySave = () => {
    if (!selectedElements.length) return;
    const name = prompt(
      "Name for this library item?",
      `Item ${library.length + 1}`
    );
    if (!name) return;
    const item: LibraryItem = {
      id: nanoid(),
      name,
      elements: selectedElements.map((el) => ({ ...el })),
      created: Date.now(),
    };
    const newLib = [item, ...library];
    setLibrary(newLib);
    setLibraryState(newLib);
  };

  // Export library as JSON
  const handleLibraryExport = () => {
    const data = JSON.stringify(library, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "freehand-library.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import library from JSON
  const handleLibraryImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(imported)) throw new Error("Invalid format");
        const newLib = [...imported, ...library];
        setLibrary(newLib);
        setLibraryState(newLib);
      } catch (err) {
        alert("Import failed: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Insert library item into canvas
  const handleLibraryOpen = (item: LibraryItem) => {
    // Offset inserted elements so they don't overlap
    const offset = 20 + Math.random() * 40;
    const newEls = item.elements.map((el) => ({
      ...el,
      id: nanoid(),
      x: el.x + offset,
      y: el.y + offset,
    }));
    setElements([...elements, ...newEls]);
    setLibraryOpen(false);
  };

  // Delete library item
  const handleLibraryDelete = (id: string) => {
    const newLib = library.filter((item) => item.id !== id);
    setLibrary(newLib);
    setLibraryState(newLib);
  };

  // Add exportAsImage, saveAsJson, loadFromJson methods
  const exportAsImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    if (onExportImage) onExportImage(dataUrl);
    return dataUrl;
  };
  const saveAsJson = () => {
    const data = JSON.stringify(elements, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "freehand-canvas.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const loadFromJson = (json: string) => {
    try {
      const els = JSON.parse(json);
      setElements(els);
    } catch (e) {
      alert("Invalid file");
    }
  };
  // Expose methods via ref if forwardedRef is provided
  useEffect(() => {
    if (forwardedRef) {
      forwardedRef.current = { exportAsImage, saveAsJson, loadFromJson };
    }
  }, [elements, canvasBg]);

  return (
    <div className="canvas-container" style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        className="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      {textInput.visible && (
        <input
          type="text"
          autoFocus
          style={{
            position: "absolute",
            left: textInput.x,
            top: textInput.y,
            fontSize: 20,
            zIndex: 2000,
            background: "#fff",
            color: "#000",
            border: "1px solid #8a2be2",
            borderRadius: 4,
            padding: 2,
            outline: "none",
            minWidth: 40,
          }}
          value={textInput.value}
          onChange={(e) =>
            setTextInput({ ...textInput, value: e.target.value })
          }
          onBlur={handleTextInputBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleTextInputBlur();
            }
          }}
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <LibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        elements={selectedElements}
        onSave={handleLibrarySave}
        onExport={handleLibraryExport}
        onImport={handleLibraryImport}
        onOpen={handleLibraryOpen}
        library={library}
        onDelete={handleLibraryDelete}
      />
      {(selectedElements.length > 0 || mode !== "selection") && <Sidebar />}
    </div>
  );
};

export default Canvas;
