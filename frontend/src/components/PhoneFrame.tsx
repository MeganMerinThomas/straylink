import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  showNav?: boolean;
  navBar?: React.ReactNode;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, showNav = false, navBar }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="relative w-[375px] h-[812px] rounded-[3rem] bg-black shadow-2xl shadow-black/50 border-[3px] border-slate-700 overflow-hidden">
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 pt-3 pb-1">
          <span className="text-xs font-semibold text-white/90">9:41</span>
          <div className="w-[120px] h-[30px] bg-black rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2" />
          <div className="flex items-center gap-1.5">
            {/* Signal bars */}
            <div className="flex items-end gap-[2px]">
              <div className="w-[3px] h-[4px] bg-white/90 rounded-sm" />
              <div className="w-[3px] h-[6px] bg-white/90 rounded-sm" />
              <div className="w-[3px] h-[8px] bg-white/90 rounded-sm" />
              <div className="w-[3px] h-[10px] bg-white/90 rounded-sm" />
            </div>
            {/* WiFi icon */}
            <svg className="w-4 h-4 text-white/90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
            {/* Battery */}
            <div className="flex items-center">
              <div className="w-[22px] h-[11px] border border-white/90 rounded-sm p-[1.5px]">
                <div className="h-full w-[75%] bg-rescue-400 rounded-[1px]" />
              </div>
              <div className="w-[2px] h-[5px] bg-white/90 rounded-r-sm ml-[1px]" />
            </div>
          </div>
        </div>

        {/* Screen content — extra bottom padding when nav is visible */}
        <div className={`h-full pt-12 bg-slate-50 overflow-y-auto ${showNav ? 'pb-20' : ''}`}>
          {children}
        </div>

        {/* Bottom nav (conditional) */}
        {showNav && navBar}

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/30 rounded-full" />
      </div>
    </div>
  );
};

export default PhoneFrame;
