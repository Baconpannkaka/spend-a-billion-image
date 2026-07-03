"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityControl({ value, onChange, min = 1, max = 100_000, compact = false }: { value: number; onChange: (value: number) => void; min?: number; max?: number; compact?: boolean }) {
  const size = compact ? "h-8" : "h-10";
  return (
    <div className={`inline-grid ${size} grid-cols-[2rem_3.2rem_2rem] overflow-hidden rounded-md border border-black/15 bg-white`}>
      <button type="button" aria-label="Minska antal" onClick={() => onChange(Math.max(min, value - 1))} className="grid place-items-center hover:bg-black/5"><Minus className="h-3.5 w-3.5" /></button>
      <input aria-label="Antal" inputMode="numeric" value={value} onChange={(event) => onChange(Math.min(max, Math.max(min, Number(event.target.value) || min)))} className="w-full border-x border-black/10 text-center text-sm font-semibold outline-none" />
      <button type="button" aria-label="Öka antal" onClick={() => onChange(Math.min(max, value + 1))} className="grid place-items-center hover:bg-black/5"><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}
