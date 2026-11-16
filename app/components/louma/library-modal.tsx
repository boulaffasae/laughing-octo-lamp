"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function LibraryModal({
  title,
  closeLabel,
  onClose,
  children,
  sidebar,
  sidebarLabel,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  sidebar: ReactNode;
  sidebarLabel: string;
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
          className="library-close"
          type="button"
          onClick={() => dialog.current?.close()}
        >
          <X size={14} aria-hidden />
          {closeLabel}
        </button>
      </div>
      <div className="library-preview-with-sidebar">
        <aside className="library-preview-sidebar" aria-label={sidebarLabel}>
          {sidebar}
        </aside>
        {children}
      </div>
    </dialog>
  );
}
