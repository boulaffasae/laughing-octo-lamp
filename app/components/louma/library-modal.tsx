"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function LibraryModal({
  title,
  closeLabel,
  onClose,
  children,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children?: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="workspace-dialog library-dialog-wide"
      aria-label={title}
      onClose={onClose}
    >
      <div className="dialog-header">
        <button
          className="icon-button"
          type="button"
          aria-label={closeLabel}
          onClick={() => dialog.current?.close()}
        >
          <X size={18} aria-hidden />
        </button>
      </div>
      {children}
    </dialog>
  );
}
