"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; message: string; kind: ToastKind };
type ToastContextValue = { showToast: (message: string, kind?: ToastKind) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { id, message, kind }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-3 top-20 z-[100] flex w-[min(92vw,390px)] flex-col gap-2 sm:right-5" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const Icon = toast.kind === "success" ? CheckCircle2 : toast.kind === "error" ? XCircle : Info;
          return (
            <div key={toast.id} className="flex items-start gap-3 rounded-xl border border-[var(--gold)]/35 bg-[#0c0c0b] px-4 py-3 text-white shadow-[0_18px_55px_rgba(0,0,0,.45)]">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" aria-hidden="true" />
              <p className="flex-1 text-sm leading-5 text-white">{toast.message}</p>
              <button
                type="button"
                onClick={() => setToasts((current) => current.filter((entry) => entry.id !== toast.id))}
                className="rounded p-1 text-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
                aria-label="Stäng meddelandet"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast måste användas inom ToastProvider");
  return context;
}
