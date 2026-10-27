import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage.js";
import { createId } from "../utils/ledger.js";

export const CATEGORIES_KEY = "incomeLedger.categories";

/** Owns the category list; replaces all row insertion/removal DOM work. */
export function useCategories() {
  const [categories, setCategories] = useLocalStorage(CATEGORIES_KEY, []);

  const addCategory = useCallback(
    ({ name, description }) => {
      const category = { id: createId(), name, description };
      setCategories((prev) => [...prev, category]);
      return category;
    },
    [setCategories]
  );

  const updateCategory = useCallback(
    (id, { name, description }) => {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name, description } : c)));
    },
    [setCategories]
  );

  const deleteCategory = useCallback(
    (id) => setCategories((prev) => prev.filter((c) => c.id !== id)),
    [setCategories]
  );

  const deleteAll = useCallback(() => setCategories([]), [setCategories]);

  return { categories, addCategory, updateCategory, deleteCategory, deleteAll };
}
