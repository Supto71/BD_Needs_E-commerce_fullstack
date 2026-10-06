import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 border-[3px] border-slate-200 rounded-full"></div>
        <div className="absolute w-12 h-12 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
