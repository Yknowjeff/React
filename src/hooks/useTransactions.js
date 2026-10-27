import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage.js";
import { createId } from "../utils/ledger.js";

export const TRANSACTIONS_KEY = "incomeLedger.transactions";

/** Owns the list of income transactions. Each one points to a category by categoryId. */
export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage(TRANSACTIONS_KEY, []);

  const addTransaction = useCallback(
    ({ categoryId, amount, date, note }) => {
      setTransactions((prev) => [...prev, { id: createId(), categoryId, amount, date, note }]);
    },
    [setTransactions]
  );

  const updateTransaction = useCallback(
    (id, { categoryId, amount, date, note }) => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, categoryId, amount, date, note } : t))
      );
    },
    [setTransactions]
  );

  const deleteTransaction = useCallback(
    (id) => setTransactions((prev) => prev.filter((t) => t.id !== id)),
    [setTransactions]
  );

  // Used when a category is removed, so no transaction is left without a category.
  const deleteByCategory = useCallback(
    (categoryId) => setTransactions((prev) => prev.filter((t) => t.categoryId !== categoryId)),
    [setTransactions]
  );

  const deleteAllTransactions = useCallback(() => setTransactions([]), [setTransactions]);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteByCategory,
    deleteAllTransactions,
  };
}
