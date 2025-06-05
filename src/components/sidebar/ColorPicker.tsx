import React from 'react';

type ColorPickerProps = {
  selectedColor: string;
  onChange: (color: string) => void;
  colors: string[];
};

const ColorPicker = ({ selectedColor, onChange, colors }: ColorPickerProps) => {
  return (
    <div className="color-picker">
      {colors.map((color) => (
        <button
          key={color}
          className={`color-option ${selectedColor === color ? 'active' : ''}`}
          style={{ 
            backgroundColor: color === 'transparent' ? 'transparent' : color,
            backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : '',
            backgroundSize: color === 'transparent' ? '8px 8px' : '',
            backgroundPosition: color === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : ''
          }}
          onClick={() => onChange(color)}
          title={color === 'transparent' ? 'Transparent' : color}
        />
      ))}
    </div>
  );
};

export default ColorPicker;