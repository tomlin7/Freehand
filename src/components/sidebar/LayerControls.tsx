import React from 'react';
import { ArrowUp, ArrowDown, Copy, Trash } from 'lucide-react';
import { useStore } from '../../store';

const LayerControls = () => {
  const { selectedElements, bringToFront, sendToBack, duplicate, deleteElements } = useStore();
  const hasSelection = selectedElements.length > 0;

  return (
    <div className="layer-controls">
      <button
        className="layer-button"
        onClick={bringToFront}
        disabled={!hasSelection}
        title="Bring to Front"
      >
        <ArrowUp size={20} />
      </button>
      <button
        className="layer-button"
        onClick={sendToBack}
        disabled={!hasSelection}
        title="Send to Back"
      >
        <ArrowDown size={20} />
      </button>
      <button
        className="layer-button"
        onClick={duplicate}
        disabled={!hasSelection}
        title="Duplicate"
      >
        <Copy size={20} />
      </button>
      <button
        className="layer-button"
        onClick={deleteElements}
        disabled={!hasSelection}
        title="Delete"
      >
        <Trash size={20} />
      </button>
    </div>
  );
};

export default LayerControls;