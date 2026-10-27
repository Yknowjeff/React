import { formatCurrency, formatDate } from "../utils/ledger.js";

export default function TransactionRow({ transaction, categoryName, isEditing, onEdit, onDelete }) {
  return (
    <tr className={isEditing ? "table-warning" : undefined}>
      <td className="text-nowrap">{formatDate(transaction.date)}</td>
      <td>
        <div className="fw-semibold text-dark">{categoryName}</div>
        {transaction.note && <div className="small text-secondary">{transaction.note}</div>}
      </td>
      <td className="text-end fw-semibold text-success text-nowrap">
        {formatCurrency(transaction.amount)}
      </td>
      <td className="text-end text-nowrap">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm me-1"
          onClick={() => onEdit(transaction.id)}
          aria-label={`Edit transaction of ${formatCurrency(transaction.amount)} on ${formatDate(transaction.date)}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm btn-delete"
          onClick={() => onDelete(transaction)}
          aria-label={`Delete transaction of ${formatCurrency(transaction.amount)} on ${formatDate(transaction.date)}`}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
