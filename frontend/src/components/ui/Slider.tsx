import React from 'react';

interface Props {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}

export const Slider: React.FC<Props> = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
}) => (
  <div className="mb-4">
    <label className="flex justify-between text-sm font-medium mb-1">
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </label>
    <input
      type="range"
      className="w-full"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
);
