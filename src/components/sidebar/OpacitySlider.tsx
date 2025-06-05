import React from 'react';

type OpacitySliderProps = {
  value: number;
  onChange: (value: number) => void;
};

const OpacitySlider = ({ value, onChange }: OpacitySliderProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="opacity-slider">
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={value}
        onChange={handleChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>0</span>
        <span>{Math.round(value * 100)}%</span>
        <span>100</span>
      </div>
    </div>
  );
};

export default OpacitySlider;