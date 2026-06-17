import React, { useEffect, useState } from 'react';
import { Car } from 'lucide-react';

interface GlobalLoadingProps {
  isVisible: boolean;
}

export default function GlobalLoading({ isVisible }: GlobalLoadingProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      // Tunggu sampai animasi fade out selesai sebelum melepas dari DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500); // 500ms adalah durasi fade out
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Container Utama Loading */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-sm mx-auto p-8">
        
        {/* Lingkaran Dekoratif / Spinning glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-sky-400/20 rounded-full blur-2xl animate-pulse delay-150"></div>

        {/* Logo AutoRent Proporsional (Tanpa Teks) */}
        <div className="z-10 mb-8 relative bg-blue-600 p-4 rounded-2xl shadow-2xl shadow-blue-500/30">
          <Car className="w-10 h-10 text-white" />
        </div>

        {/* Garis Jalan untuk Mobil (Road Line) - Diperpendek */}
        <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent relative overflow-hidden rounded-full mt-2">
          
          {/* Animasi Garis Bergerak (Kecepatan Jalan) */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 animate-[roadLine_1s_linear_infinite]"></div>
          
          {/* Mobil Bergerak di atas jalan - Diperkecil */}
          <div className="absolute -top-[20px] left-0 animate-[carDrive_2s_ease-in-out_infinite]">
            <div className="bg-white p-1 rounded-full shadow-sm border border-slate-100">
              <Car className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          
        </div>
      </div>

      <style>{`
        @keyframes roadLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes carDrive {
          0% { transform: translateX(-10px); opacity: 0; }
          20% { opacity: 1; transform: translateX(20px); }
          50% { transform: translateX(80px); }
          80% { opacity: 1; transform: translateX(140px); }
          100% { transform: translateX(180px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
