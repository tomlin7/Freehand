import { create } from "zustand";
import { nanoid } from "nanoid";
import { Element, DrawingMode } from "../types";

type StoreState = {
  elements: Element[];
  history: Element[][];
  historyIndex: number;
  selectedElements: Element[];
  mode: DrawingMode;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fillStyle: "none" | "hachure" | "solid";
  roughness: number;
  opacity: number;
  zoom: number;
  panOffset: { x: number; y: number };
  canUndo: boolean;
  canRedo: boolean;
  canvasBg: string;
  setElements: (elements: Element[]) => void;
  addElement: (element: Element) => void;
  updateElement: (id: string, properties: Partial<Element>) => void;
  selectElement: (id: string) => void;
  deselectAll: () => void;
  deleteElements: () => void;
  duplicate: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  setMode: (mode: DrawingMode) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFillStyle: (style: "none" | "hachure" | "solid") => void;
  setRoughness: (roughness: number) => void;
  setOpacity: (opacity: number) => void;
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  undo: () => void;
  redo: () => void;
  setSelectedElements: (elements: Element[]) => void;
  setCanvasBg: (canvasBg: string) => void;
};

export const useStore = create<StoreState>((set, get) => ({
  elements: [],
  history: [[]],
  historyIndex: 0,
  selectedElements: [],
  mode: "selection",
  strokeColor: "#ffffff",
  fillColor: "transparent",
  strokeWidth: 2,
  fillStyle: "none",
  roughness: 1,
  opacity: 1,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  canUndo: false,
  canRedo: false,
  canvasBg: "#000",

  setElements: (elements) => {
    const { history, historyIndex } = get();
    const newHistory = [...history.slice(0, historyIndex + 1), elements];
    const newHistoryIndex = newHistory.length - 1;
    set({
      elements,
      history: newHistory,
      historyIndex: newHistoryIndex,
      canUndo: newHistoryIndex > 0,
      canRedo: false,
    });
  },

  addElement: (element) => {
    const { elements } = get();
    const newElements = [...elements, element];
    get().setElements(newElements);
  },

  updateElement: (id, properties) => {
    const { elements } = get();
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, ...properties } : el
    );
    get().setElements(newElements);

    const selectedIds = get().selectedElements.map((el) => el.id);
    const updatedSelectedElements = newElements.filter((el) =>
      selectedIds.includes(el.id)
    );
    set({ selectedElements: updatedSelectedElements });
  },

  selectElement: (id) => {
    const { elements } = get();
    const element = elements.find((el) => el.id === id);
    if (element) {
      set({ selectedElements: [element] });
    }
  },

  deselectAll: () => {
    set({ selectedElements: [] });
  },

  deleteElements: () => {
    const { elements, selectedElements } = get();
    const selectedIds = selectedElements.map((el) => el.id);
    const newElements = elements.filter((el) => !selectedIds.includes(el.id));
    get().setElements(newElements);
    set({ selectedElements: [] });
  },

  duplicate: () => {
    const { elements, selectedElements } = get();

    const duplicatedElements = selectedElements.map((el) => ({
      ...el,
      id: nanoid(),
      x: el.x + 10,
      y: el.y + 10,
    }));

    const newElements = [...elements, ...duplicatedElements];
    get().setElements(newElements);
    set({ selectedElements: duplicatedElements });
  },

  bringToFront: () => {
    const { elements, selectedElements } = get();
    if (selectedElements.length === 0) return;

    const selectedIds = selectedElements.map((el) => el.id);
    const nonSelectedElements = elements.filter(
      (el) => !selectedIds.includes(el.id)
    );
    const newElements = [...nonSelectedElements, ...selectedElements];

    get().setElements(newElements);
  },

  sendToBack: () => {
    const { elements, selectedElements } = get();
    if (selectedElements.length === 0) return;

    const selectedIds = selectedElements.map((el) => el.id);
    const nonSelectedElements = elements.filter(
      (el) => !selectedIds.includes(el.id)
    );
    const newElements = [...selectedElements, ...nonSelectedElements];

    get().setElements(newElements);
  },

  setMode: (mode) => {
    set({ mode });
  },

  setStrokeColor: (color) => {
    set({ strokeColor: color });
  },

  setFillColor: (color) => {
    set({ fillColor: color });
  },

  setStrokeWidth: (width) => {
    set({ strokeWidth: width });
  },

  setFillStyle: (style) => {
    set({ fillStyle: style });
  },

  setRoughness: (roughness) => {
    set({ roughness });
  },

  setOpacity: (opacity) => {
    set({ opacity });
  },

  setZoom: (zoom) => {
    set({ zoom });
  },

  setPanOffset: (offset) => {
    set({ panOffset: offset });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        elements: history[newIndex],
        historyIndex: newIndex,
        selectedElements: [],
        canUndo: newIndex > 0,
        canRedo: true,
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        elements: history[newIndex],
        historyIndex: newIndex,
        selectedElements: [],
        canUndo: true,
        canRedo: newIndex < history.length - 1,
      });
    }
  },

  setSelectedElements: (elements) => set({ selectedElements: elements }),

  setCanvasBg: (canvasBg) => set({ canvasBg }),
}));
