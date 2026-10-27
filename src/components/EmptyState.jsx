/** Compact placeholder shown instead of a table when there is nothing to list. */
export default function EmptyState({ message = "No categories registered yet." }) {
  return <div className="empty-state">{message}</div>;
}
