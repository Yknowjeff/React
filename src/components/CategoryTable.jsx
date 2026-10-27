import { useState } from "react";
import CategoryRow from "./CategoryRow.jsx";
import EmptyRow from "./EmptyRow.jsx";
import { filterCategories } from "../utils/ledger.js";

export default function CategoryTable({
  categories,
  totals,
  counts,
  editingId,
  onEdit,
  onDelete,
  onDeleteAll,
}) {
  const [query, setQuery] = useState("");
  const isEmpty = categories.length === 0;
  const visible = filterCategories(categories, query);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h2 className="h6 mb-0 text-secondary fw-bold text-uppercase">
          Registered Categories <span className="badge text-bg-secondary ms-1">{categories.length}</span>
        </h2>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm fw-semibold"
          disabled={isEmpty}
          onClick={onDeleteAll}
        >
          Delete All
        </button>
      </div>
      {!isEmpty && (
        <div className="table-tools">
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder="Search categories by name or description"
            aria-label="Search categories"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 ledger-table">
          <thead className="table-light">
            <tr>
              <th scope="col" className="w-35">Category Name</th>
              <th scope="col">Description</th>
              <th scope="col" className="text-end">Income</th>
              <th scope="col" className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <EmptyRow colSpan={4} />
            ) : visible.length === 0 ? (
              <EmptyRow colSpan={4} message="No categories match your search." />
            ) : (
              visible.map((c) => (
                <CategoryRow
                  key={c.id}
                  category={c}
                  total={totals[c.id] ?? 0}
                  count={counts[c.id] ?? 0}
                  isEditing={c.id === editingId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
