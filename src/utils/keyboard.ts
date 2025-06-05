import { useEffect } from "react";
import { useStore } from "../store";

export const useKeyboardShortcuts = () => {
  const { mode, setMode, undo, redo, deleteElements, duplicate } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        // Tool selection
        case "1":
        case "v":
          setMode("selection");
          break;
        case "2":
        case "r":
          setMode("rectangle");
          break;
        case "3":
        case "d":
          setMode("diamond");
          break;
        case "4":
        case "e":
          setMode("ellipse");
          break;
        case "5":
        case "a":
          setMode("arrow");
          break;
        case "6":
        case "l":
          setMode("line");
          break;
        case "7":
        case "p":
          setMode("pencil");
          break;
        case "8":
        case "t":
          setMode("text");
          break;
        case "9":
        case "i":
          setMode("image");
          break;

        // Undo/Redo
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;
        case "y":
          if (e.ctrlKey || e.metaKey) {
            redo();
          }
          break;

        // Delete
        case "delete":
        case "backspace":
          deleteElements();
          break;

        // Duplicate
        case "d":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            duplicate();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode, setMode, undo, redo, deleteElements, duplicate]);
};

export default useKeyboardShortcuts;
