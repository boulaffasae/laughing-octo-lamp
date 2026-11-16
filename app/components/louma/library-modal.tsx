"use client";

import { Modal } from "@heroui/react";
import type { ReactNode } from "react";

export function LibraryModal({
  title,
  open,
  onClose,
  children,
  actions,
  busy = false,
  wide = false,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  actions?: ReactNode;
  busy?: boolean;
  wide?: boolean;
}) {
  return (
    <Modal>
      <Modal.Backdrop
        isOpen={open}
        onOpenChange={(next) => {
          if (!next && !busy) onClose();
        }}
        isDismissable={!busy}
        isKeyboardDismissDisabled={busy}
      >
        <Modal.Container size={wide ? "lg" : "sm"} scroll="inside">
          <Modal.Dialog>
            {!busy && <Modal.CloseTrigger />}
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            {children && <Modal.Body>{children}</Modal.Body>}
            {actions && <Modal.Footer>{actions}</Modal.Footer>}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
