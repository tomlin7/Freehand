import React from 'react';
import { Slash, Hash, Square } from 'lucide-react';

type FillPickerProps = {
  selectedFill: 'none' | 'hachure' | 'solid';
  onChange: (fill: 'none' | 'hachure' | 'solid') => void;
};

const FillPicker = ({ selectedFill, onChange }: FillPickerProps) => {
  const fills = [
    { id: 'none', icon: <Slash size={20} />, label: 'No fill' },
    { id: 'hachure', icon: <Hash size={20} />, label: 'Hachure' },
    { id: 'solid', icon: <Square size={20} />, label: 'Solid' }
  ];

  return (
    <div className="fill-patterns">
      {fills.map((fill) => (
        <button
          key={fill.id}
          className={`fill-option ${selectedFill === fill.id ? 'active' : ''}`}
          onClick={() => onChange(fill.id as 'none' | 'hachure' | 'solid')}
          title={fill.label}
        >
          {fill.icon}
        </button>
      ))}
    </div>
  );
};

export default FillPicker;