import { useState, useCallback } from "react";
import CategoryForm from "./components/CategoryForm.jsx";
import CategoryTable from "./components/CategoryTable.jsx";
import TransactionForm from "./components/TransactionForm.jsx";
import TransactionTable from "./components/TransactionTable.jsx";
import SummaryCards from "./components/SummaryCards.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import ToastContainer from "./components/ToastContainer.jsx";
import { useCategories } from "./hooks/useCategories.js";
import { useTransactions } from "./hooks/useTransactions.js";
import { useToasts } from "./hooks/useToasts.js";
import { totalsByCategory, formatCurrency, formatDate } from "./utils/ledger.js";

export default function App() {
  const { categories, addCategory, updateCategory, deleteCategory, deleteAll } = useCategories();
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteByCategory,
    deleteAllTransactions,
  } = useTransactions();
  const { toasts, notify, dismiss } = useToasts();

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [dialog, setDialog] = useState(null); // { title, message, confirmLabel, onConfirm } | null
  const closeDialog = useCallback(() => setDialog(null), []);

  // Derived data: calculated from state on every render, never stored separately.
  const totals = totalsByCategory(transactions);
  const counts = {};
  for (const t of transactions) counts[t.categoryId] = (counts[t.categoryId] ?? 0) + 1;
  const editingCategory = categories.find((c) => c.id === editingCategoryId) ?? null;
  const editingTransaction = transactions.find((t) => t.id === editingTransactionId) ?? null;

  // ----- Categories -----
  const handleAddCategory = (data) => {
    addCategory(data);
    notify(`Category "${data.name}" saved.`);
  };

  const handleUpdateCategory = (id, data) => {
    updateCategory(id, data);
    setEditingCategoryId(null);
    notify(`Category "${data.name}" updated.`);
  };

  const requestDeleteCategory = (category) => {
    const count = counts[category.id] ?? 0;
    setDialog({
      title: "Delete category?",
      message:
        count > 0
          ? `"${category.name}" and its ${count} income ${count === 1 ? "transaction" : "transactions"} will be permanently deleted.`
          : `"${category.name}" will be permanently deleted.`,
      confirmLabel: "Delete category",
      onConfirm: () => {
        deleteCategory(category.id);
        deleteByCategory(category.id);
        if (editingCategoryId === category.id) setEditingCategoryId(null);
        if (editingTransaction?.categoryId === category.id) setEditingTransactionId(null);
        notify(`Category "${category.name}" deleted.`, "danger");
      },
    });
  };

  const requestDeleteAllCategories = () => {
    setDialog({
      title: "Delete all categories?",
      message: `All ${categories.length} categories and all ${transactions.length} income transactions will be permanently deleted.`,
      confirmLabel: "Delete everything",
      onConfirm: () => {
        deleteAll();
        deleteAllTransactions();
        setEditingCategoryId(null);
        setEditingTransactionId(null);
        notify("All categories and transactions deleted.", "danger");
      },
    });
  };

  // ----- Transactions -----
  const handleAddTransaction = (data) => {
    addTransaction(data);
    notify(`Income of ${formatCurrency(data.amount)} recorded.`);
  };

  const handleUpdateTransaction = (id, data) => {
    updateTransaction(id, data);
    setEditingTransactionId(null);
    notify("Transaction updated.");
  };

  const requestDeleteTransaction = (t) => {
    setDialog({
      title: "Delete transaction?",
      message: `The ${formatCurrency(t.amount)} transaction dated ${formatDate(t.date)} will be permanently deleted.`,
      confirmLabel: "Delete transaction",
      onConfirm: () => {
        deleteTransaction(t.id);
        if (editingTransactionId === t.id) setEditingTransactionId(null);
        notify("Transaction deleted.", "danger");
      },
    });
  };

  const requestDeleteAllTransactions = () => {
    setDialog({
      title: "Delete all transactions?",
      message: `All ${transactions.length} income transactions will be permanently deleted. Your categories are kept.`,
      confirmLabel: "Delete all",
      onConfirm: () => {
        deleteAllTransactions();
        setEditingTransactionId(null);
        notify("All transactions deleted.", "danger");
      },
    });
  };

  return (
    <>
      <header className="app-header">
        <div className="container-xl">
          <h1 className="h3 fw-bold mb-1">Income Ledger</h1>
          <p className="mb-0 opacity-75">Register income categories and record the income that belongs to them.</p>
        </div>
      </header>

      <main className="container-xl py-4">
        <SummaryCards categories={categories} transactions={transactions} />

        <div className="row g-4 align-items-start">
          <div className="col-xl-6 ledger-col">
            <CategoryForm
              onAdd={handleAddCategory}
              onUpdate={handleUpdateCategory}
              editingCategory={editingCategory}
              onCancelEdit={() => setEditingCategoryId(null)}
            />
            <CategoryTable
              categories={categories}
              totals={totals}
              counts={counts}
              editingId={editingCategoryId}
              onEdit={setEditingCategoryId}
              onDelete={requestDeleteCategory}
              onDeleteAll={requestDeleteAllCategories}
            />
          </div>
          <div className="col-xl-6 ledger-col">
            <TransactionForm
              categories={categories}
              onAdd={handleAddTransaction}
              onUpdate={handleUpdateTransaction}
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransactionId(null)}
            />
            <TransactionTable
              transactions={transactions}
              categories={categories}
              editingId={editingTransactionId}
              onEdit={setEditingTransactionId}
              onDelete={requestDeleteTransaction}
              onDeleteAll={requestDeleteAllTransactions}
            />
          </div>
        </div>
      </main>

      <footer className="container-xl pb-4 text-center text-secondary small">
        Data is saved in this browser only (localStorage).
      </footer>

      <ConfirmDialog dialog={dialog} onCancel={closeDialog} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
