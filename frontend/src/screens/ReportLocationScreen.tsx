import React, { useState } from 'react';
import type { LocationData } from '../types';
import Button from '../components/ui/Button';

interface ReportLocationScreenProps {
  location: LocationData | null;
  onLocationConfirm: (loc: LocationData) => void;
  onBack: () => void;
}

// Pre-set "locations" for the demo map
const DEMO_PINS: LocationData[] = [
  { lat: 10.7769, lng: 106.7009, label: 'Nguyen Hue Street' },
  { lat: 10.7798, lng: 106.6990, label: 'Le Loi Boulevard' },
  { lat: 10.7745, lng: 106.7030, label: 'Ben Thanh Market' },
  { lat: 10.7810, lng: 106.6950, label: 'District 1 Park' },
  { lat: 10.7730, lng: 106.6980, label: 'Saigon River Front' },
];

const ReportLocationScreen: React.FC<ReportLocationScreenProps> = ({
  location,
  onLocationConfirm,
  onBack,
}) => {
  const [selectedPin, setSelectedPin] = useState<LocationData | null>(location);

  const handlePinClick = (pin: LocationData) => {
    setSelectedPin(pin);
  };

  const handleConfirm = () => {
    if (selectedPin) {
      onLocationConfirm(selectedPin);
    }
  };

  return (
    <div className="flex flex-col h-full px-5 pb-6 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Step 1 of 2</h1>
          <p className="text-xs text-slate-500">Where did you spot the animal?</p>
        </div>
      </div>

      {/* Map area (placeholder) */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border-2 border-slate-200 bg-emerald-50">
        {/* Fake map grid */}
        <div className="absolute inset-0 opacity-20">
          {/* Horizontal roads */}
          {[20, 40, 60, 80].map((pct) => (
            <div
              key={`h-${pct}`}
              className="absolute left-0 right-0 h-[2px] bg-slate-400"
              style={{ top: `${pct}%` }}
            />
          ))}
          {/* Vertical roads */}
          {[25, 50, 75].map((pct) => (
            <div
              key={`v-${pct}`}
              className="absolute top-0 bottom-0 w-[2px] bg-slate-400"
              style={{ left: `${pct}%` }}
            />
          ))}
        </div>

        {/* Park/green area */}
        <div className="absolute top-[15%] left-[10%] w-[35%] h-[30%] bg-emerald-200/40 rounded-xl" />
        <div className="absolute top-[55%] right-[8%] w-[28%] h-[25%] bg-blue-200/30 rounded-xl" />

        {/* Map pins */}
        {DEMO_PINS.map((pin, i) => {
          const positions = [
            { top: '25%', left: '20%' },
            { top: '35%', left: '65%' },
            { top: '60%', left: '40%' },
            { top: '18%', left: '72%' },
            { top: '72%', left: '25%' },
          ];
          const pos = positions[i];
          const isSelected =
            selectedPin?.label === pin.label;

          return (
            <button
              key={pin.label}
              onClick={() => handlePinClick(pin)}
              className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200 z-10"
              style={{ top: pos.top, left: pos.left }}
            >
              <div
                className={[
                  'flex flex-col items-center',
                  isSelected ? 'scale-125' : 'hover:scale-110',
                ].join(' ')}
              >
                <div
                  className={[
                    'px-2 py-1 rounded-lg text-[10px] font-semibold text-white shadow-md mb-0.5 whitespace-nowrap',
                    isSelected
                      ? 'bg-rescue-600'
                      : 'bg-slate-700',
                  ].join(' ')}
                >
                  {pin.label}
                </div>
                <span className="text-2xl drop-shadow-md">📍</span>
              </div>
            </button>
          );
        })}

        {/* "You are here" dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
        </div>

        {/* Map label */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[10px] text-slate-500 font-medium shadow-sm">
          🗺️ Demo Map — Tap a pin to select
        </div>
      </div>

      {/* Selected location info */}
      {selectedPin && (
        <div className="mt-3 flex items-center gap-2 bg-rescue-50 border border-rescue-200 rounded-xl px-4 py-2.5">
          <span className="text-lg">📌</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-rescue-800 truncate">
              {selectedPin.label}
            </p>
            <p className="text-[10px] text-rescue-600">
              {selectedPin.lat.toFixed(4)}, {selectedPin.lng.toFixed(4)}
            </p>
          </div>
        </div>
      )}

      {/* Confirm button */}
      <div className="mt-3">
        <Button
          label="Confirm Location"
          onClick={handleConfirm}
          disabled={!selectedPin}
        />
      </div>
    </div>
  );
};

export default ReportLocationScreen;
