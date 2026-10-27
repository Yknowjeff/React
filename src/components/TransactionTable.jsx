import { useState } from "react";
import TransactionRow from "./TransactionRow.jsx";
import EmptyRow from "./EmptyRow.jsx";
import {
  filterTransactions,
  sortTransactions,
  sumAmounts,
  formatCurrency,
} from "../utils/ledger.js";

export default function TransactionTable({
  transactions,
  categories,
  editingId,
  onEdit,
  onDelete,
  onDeleteAll,
}) {
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");

  const isEmpty = transactions.length === 0;
  const nameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const visible = sortTransactions(filterTransactions(transactions, { categoryId, query }));
  const isFiltered = categoryId !== "all" || query.trim() !== "";

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h2 className="h6 mb-0 text-secondary fw-bold text-uppercase">
          Income Transactions <span className="badge text-bg-secondary ms-1">{transactions.length}</span>
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
          <div className="row g-2">
            <div className="col-sm-5">
              <select
                className="form-select form-select-sm"
                aria-label="Filter transactions by category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-7">
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Search notes"
                aria-label="Search transaction notes"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 ledger-table">
          <thead className="table-light">
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Category</th>
              <th scope="col" className="text-end">Amount</th>
              <th scope="col" className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <EmptyRow colSpan={4} message="No income transactions recorded yet." />
            ) : visible.length === 0 ? (
              <EmptyRow colSpan={4} message="No transactions match your filters." />
            ) : (
              visible.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  categoryName={nameById[t.categoryId] ?? "Unknown category"}
                  isEditing={t.id === editingId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
          {!isEmpty && visible.length > 0 && (
            <tfoot className="table-light">
              <tr>
                <th scope="row" colSpan={2}>
                  {isFiltered ? "Filtered total" : "Total"}
                </th>
                <th className="text-end text-nowrap" data-testid="transactions-total">
                  {formatCurrency(sumAmounts(visible))}
                </th>
                <th />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
