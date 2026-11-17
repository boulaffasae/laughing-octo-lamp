"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function LibraryModal({
  title,
  backLabel,
  onClose,
  children,
  sidebar,
  sidebarLabel,
}: {
  title: string;
  backLabel: string;
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
      <div className="library-preview-with-sidebar">
        <aside className="library-preview-sidebar" aria-label={sidebarLabel}>
          <button
            className="library-back"
            type="button"
            onClick={() => dialog.current?.close()}
          >
            {backLabel}
          </button>
          {sidebar}
        </aside>
        {children}
      </div>
    </dialog>
  );
}
