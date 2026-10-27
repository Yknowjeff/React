/** Shows the queue from useToasts using Bootstrap's toast styles. */
export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast show align-items-center text-bg-${t.variant} border-0 mb-2`} role="status">
          <div className="d-flex">
            <div className="toast-body">{t.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(t.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
