import { useEffect, useRef } from "react";

/** Bootstrap-styled modal driven by React state (no Bootstrap JavaScript needed). */
export default function ConfirmDialog({ dialog, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!dialog) return undefined;
    cancelRef.current?.focus(); // safest default: the Cancel button
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog, onCancel]);

  if (!dialog) return null;

  const handleConfirm = () => {
    dialog.onConfirm();
    onCancel(); // closes the dialog
  };

  return (
    <>
      <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h2 className="modal-title h5" id="confirmTitle">
                {dialog.title}
              </h2>
            </div>
            <div className="modal-body">{dialog.message}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" ref={cancelRef} onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirm}>
                {dialog.confirmLabel ?? "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" onClick={onCancel} />
    </>
  );
}
