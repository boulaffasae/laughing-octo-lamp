"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function LibraryModal({
  title,
  closeLabel,
  open,
  onClose,
  children,
  actions,
  wide = false,
}: {
  title: string;
  closeLabel: string;
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  actions?: ReactNode;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (open && element && !element.open) element.showModal();
    if (!open && element?.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={
        wide ? "workspace-dialog library-dialog-wide" : "workspace-dialog"
      }
      aria-labelledby={titleId}
      onClose={() => {
        if (open) onClose();
      }}
    >
      <div className="dialog-header">
        <h2 id={titleId}>{title}</h2>
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
      {actions && <div className="dialog-actions">{actions}</div>}
    </dialog>
  );
}
