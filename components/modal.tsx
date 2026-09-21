"use client";

// Wraps an intercepted route in a native <dialog>. Closing it — the button,
// Escape, or a click on the backdrop — steps back in history, which drops the
// intercepted URL and so removes the modal.

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/ui";

export default function Modal({ label, children }: { label: string; children: React.ReactNode }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-label={label}
      onClose={() => router.back()}
      onClick={(e) => {
        if (e.target === dialog.current) dialog.current.close();
      }}
    >
      <div className="modal-panel">
        <button
          type="button"
          className="modal-close"
          aria-label="Close"
          onClick={() => dialog.current?.close()}
        >
          <CloseIcon size={18} />
        </button>
        {children}
      </div>
    </dialog>
  );
}
