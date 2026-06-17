import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

export interface ConfirmConfig {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

export function ToastContainer({ toasts, removeToast }: { toasts: ToastData[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in fade-in slide-in-from-right-8 duration-300 pointer-events-auto"
        >
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden min-w-[300px] flex">
            {/* Left accent border */}
            <div className={`w-1.5 shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500' : 
              toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`} />
            
            <div className="flex p-4 items-start gap-3 w-full">
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
              </div>
              <p className="text-sm font-semibold text-slate-700 flex-1">{toast.message}</p>
              <button 
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConfirmModal({ config, onClose }: { config: ConfirmConfig | null, onClose: () => void }) {
  if (!config || !config.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 fade-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi</h3>
          <p className="text-sm text-slate-500 mb-6 font-medium">
            {config.message}
          </p>
          
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => {
                onClose();
                config.onConfirm();
              }}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0f172a] hover:bg-slate-800 transition-colors"
            >
              Ya, Lanjutkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
