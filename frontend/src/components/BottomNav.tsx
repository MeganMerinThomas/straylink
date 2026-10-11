import React from 'react';
import type { Screen } from '../types';
import Button from './ui/Button';

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const isHome = activeScreen === 'home';
  const isServices = activeScreen === 'confirmation' && false; // placeholder — no services screen yet

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 px-4 pt-2 pb-5">
      <div className="flex items-center justify-around">
        {/* Home tab */}
        <button
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center gap-0.5 min-w-[64px]"
        >
          <span className="text-xl">🏠</span>
          <span
            className={[
              'text-[10px] font-medium',
              isHome ? 'text-rescue-600' : 'text-slate-400',
            ].join(' ')}
          >
            Home
          </span>
        </button>

        {/* Report tab — uses the Button component for visual prominence */}
        <div className="-mt-4">
          <Button
            label="📍 Report"
            onClick={() => onNavigate('report-location')}
            fullWidth={false}
          />
        </div>

        {/* Services tab */}
        <button
          onClick={() => onNavigate('home')} // placeholder — no services screen yet
          className="flex flex-col items-center gap-0.5 min-w-[64px]"
        >
          <span className="text-xl">🩺</span>
          <span className="text-[10px] font-medium text-slate-400">
            Services
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
