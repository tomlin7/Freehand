import React from 'react';

type StrokeWidthPickerProps = {
  selectedWidth: number;
  onChange: (width: number) => void;
  options: number[];
};

const StrokeWidthPicker = ({ selectedWidth, onChange, options }: StrokeWidthPickerProps) => {
  return (
    <div className="stroke-width">
      {options.map((width) => (
        <button
          key={width}
          className={`stroke-option ${selectedWidth === width ? 'active' : ''}`}
          onClick={() => onChange(width)}
          title={`${width}px`}
        >
          <div
            style={{
              width: '20px',
              height: `${width}px`,
              backgroundColor: 'white',
              borderRadius: '4px',
            }}
          />
        </button>
      ))}
    </div>
  );
};

export default StrokeWidthPicker;