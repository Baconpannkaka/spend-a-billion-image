"use client";

export function ConfirmDialog({ open, title, description, confirmLabel, onClose, onConfirm }: { open: boolean; title: string; description: string; confirmLabel: string; onClose: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4" role="presentation" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-xl border border-white/15 bg-[#171714] p-6 text-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <h2 id="confirm-title" className="font-display text-3xl">{title}</h2><p className="mt-3 text-sm leading-6 text-white/55">{description}</p>
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="focus-ring rounded-md border border-white/15 px-4 py-2 text-sm font-semibold">Avbryt</button><button type="button" onClick={() => { onConfirm(); onClose(); }} className="focus-ring rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-bold text-black">{confirmLabel}</button></div>
      </div>
    </div>
  );
}
