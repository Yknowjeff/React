import { useEffect, useState } from "react";
import FormField from "./FormField.jsx";
import { useValidatedField } from "../hooks/useValidatedField.js";
import { isFilled, isValidAmount, todayISO } from "../utils/ledger.js";

/** Records an income transaction, or edits one when `editingTransaction` is provided. */
export default function TransactionForm({
  categories,
  onAdd,
  onUpdate,
  editingTransaction,
  onCancelEdit,
}) {
  const category = useValidatedField(isFilled);
  const amount = useValidatedField(isValidAmount);
  const date = useValidatedField(isFilled, todayISO());
  const [note, setNote] = useState("");

  const isEditing = Boolean(editingTransaction);
  const noCategories = categories.length === 0;

  // Fill the form when edit starts; go back to defaults when it ends.
  useEffect(() => {
    category.reset(editingTransaction?.categoryId ?? "");
    amount.reset(editingTransaction ? String(editingTransaction.amount) : "");
    date.reset(editingTransaction?.date ?? todayISO());
    setNote(editingTransaction?.note ?? "");
    if (editingTransaction) amount.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTransaction?.id]);

  const handleSave = () => {
    const results = [category.validate(), amount.validate(), date.validate()];
    if (results.includes(false)) {
      [category, amount, date][results.indexOf(false)].focus();
      return;
    }

    const data = {
      categoryId: category.value,
      amount: Math.round(Number(amount.value) * 100) / 100,
      date: date.value,
      note: note.trim(),
    };

    if (isEditing) {
      onUpdate(editingTransaction.id, data);
      category.reset("");
      date.reset(todayISO());
    } else {
      onAdd(data);
      // Keep category and date so several entries can be typed quickly.
      category.reset(category.value);
      date.reset(date.value);
    }
    amount.reset("");
    setNote("");
    amount.focus();
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-success text-white py-3">
        <h2 className="fs-6 mb-0 fw-bold">
          {isEditing ? "Edit Income Transaction" : "Record Income Transaction"}
        </h2>
      </div>
      <div className="card-body">
        {noCategories && (
          <div className="alert alert-info py-2 small" role="status">
            Register an income category first, then you can record income under it.
          </div>
        )}
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <FormField
            id="selTxnCategory"
            label="Category"
            placeholder={noCategories ? "No categories registered yet" : "Select a category"}
            errorMessage="Please choose a category."
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            ref={category.ref}
            value={category.value}
            status={category.status}
            onChange={category.onChange}
            onBlur={category.onBlur}
            disabled={noCategories}
          />
          <div className="row">
            <div className="col-sm-6">
              <FormField
                id="txtTxnAmount"
                label="Amount (PHP)"
                placeholder="0.00"
                errorMessage="Enter an amount greater than 0."
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                ref={amount.ref}
                value={amount.value}
                status={amount.status}
                onChange={amount.onChange}
                onBlur={amount.onBlur}
                disabled={noCategories}
              />
            </div>
            <div className="col-sm-6">
              <FormField
                id="dateTxn"
                label="Date"
                errorMessage="Please pick a date."
                type="date"
                ref={date.ref}
                value={date.value}
                status={date.status}
                onChange={date.onChange}
                onBlur={date.onBlur}
                disabled={noCategories}
              />
            </div>
          </div>
          <FormField
            id="txtTxnNote"
            label="Note"
            optional
            placeholder="e.g., October support retainer"
            errorMessage=""
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={noCategories}
          />
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-success px-4 fw-semibold" disabled={noCategories}>
              {isEditing ? "Update Transaction" : "Save Transaction"}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-outline-secondary" onClick={onCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
