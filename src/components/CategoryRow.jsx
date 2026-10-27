import { formatCurrency } from "../utils/ledger.js";

export default function CategoryRow({ category, total, count, isEditing, onEdit, onDelete }) {
  return (
    <tr className={isEditing ? "table-warning" : undefined}>
      <td className="fw-semibold text-dark">{category.name}</td>
      <td className="text-secondary">{category.description}</td>
      <td className="text-end text-nowrap">
        <div className="fw-semibold">{formatCurrency(total)}</div>
        <div className="small text-secondary">
          {count} {count === 1 ? "entry" : "entries"}
        </div>
      </td>
      <td className="text-end text-nowrap">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm me-1"
          onClick={() => onEdit(category.id)}
          aria-label={`Edit ${category.name}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm btn-delete"
          onClick={() => onDelete(category)}
          aria-label={`Delete ${category.name}`}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
