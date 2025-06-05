import { Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';
import { useStore } from '../store';

const BottomBar = () => {
  const { 
    zoom, 
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo
  } = useStore();

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 5));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.1));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  return (
    <div className="bottom-bar">
      <div className="undo-redo">
        <button 
          className="zoom-button" 
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw size={16} />
        </button>
        <button 
          className="zoom-button" 
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <RotateCw size={16} />
        </button>
      </div>

      <div className="zoom-controls">
        <button 
          className="zoom-button" 
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
        <div 
          className="zoom-display" 
          onClick={handleZoomReset}
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </div>
        <button 
          className="zoom-button" 
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default BottomBar;