"use client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children, wide = false, side = false }) {
  const panel = side
    ? "h-full w-full max-w-md overflow-y-auto border-l border-line bg-surface p-5 shadow-2xl"
    : `max-h-[90vh] w-full ${wide ? "max-w-2xl" : "max-w-md"} space-y-4 overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-2xl`;

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      <div className={`fixed inset-0 flex ${side ? "justify-end" : "items-center justify-center p-4"}`}>
        <DialogPanel className={panel}>
          <div className={`flex items-center justify-between ${side ? "mb-4" : ""}`}>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-muted hover:bg-line/60 hover:text-text">
              <X size={18} />
            </button>
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
