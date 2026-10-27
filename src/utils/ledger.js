// Pure business logic for the Income Ledger.
// Nothing in this file touches React, so every function is easy to test.

/** Unique id for a record. crypto.randomUUID needs a secure context, so we keep a fallback. */
export function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Original rule from the midterm: a text field is valid when it is not blank. */
export const isFilled = (text) => String(text ?? "").trim() !== "";

/** An amount is valid when it is a finite number above 0 and below one trillion. */
export function isValidAmount(text) {
  if (!isFilled(text)) return false;
  const n = Number(text);
  return Number.isFinite(n) && n > 0 && n < 1_000_000_000_000;
}

/** Round to centavos so 0.1 + 0.2 style floating point noise never shows up. */
export const toCents = (amount) => Math.round(Number(amount) * 100);

/** Today as YYYY-MM-DD using the local clock (what <input type="date"> expects). */
export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});
export const formatCurrency = (amount) => currencyFormatter.format(amount);

/** "2026-10-28" -> "Oct 28, 2026" without timezone shifting. */
export function formatDate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Sum of amounts, calculated in centavos then converted back. */
export function sumAmounts(transactions) {
  const cents = transactions.reduce((total, t) => total + toCents(t.amount), 0);
  return cents / 100;
}

/** Total income recorded for a single month (monthKey is "YYYY-MM"). */
export function monthTotal(transactions, monthKey) {
  return sumAmounts(transactions.filter((t) => t.date.startsWith(monthKey)));
}

/** { [categoryId]: total } for every category that has transactions. */
export function totalsByCategory(transactions) {
  const cents = {};
  for (const t of transactions) {
    cents[t.categoryId] = (cents[t.categoryId] ?? 0) + toCents(t.amount);
  }
  const totals = {};
  for (const id of Object.keys(cents)) totals[id] = cents[id] / 100;
  return totals;
}

/** The category with the highest total, or null when there is no income yet. */
export function topCategory(categories, transactions) {
  const totals = totalsByCategory(transactions);
  let best = null;
  for (const c of categories) {
    const total = totals[c.id] ?? 0;
    if (total > 0 && (best === null || total > best.total)) best = { category: c, total };
  }
  return best;
}

/** Case-insensitive search across category name and description. */
export function filterCategories(categories, query) {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories.filter(
    (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  );
}

/** Filter by category id ("all" keeps everything) and by note text. */
export function filterTransactions(transactions, { categoryId = "all", query = "" } = {}) {
  const q = query.trim().toLowerCase();
  return transactions.filter((t) => {
    if (categoryId !== "all" && t.categoryId !== categoryId) return false;
    if (q && !t.note.toLowerCase().includes(q)) return false;
    return true;
  });
}

/** Newest date first; records on the same date keep the order they were added. */
export function sortTransactions(transactions) {
  return transactions
    .map((t, index) => ({ t, index }))
    .sort((a, b) => (a.t.date === b.t.date ? b.index - a.index : a.t.date < b.t.date ? 1 : -1))
    .map(({ t }) => t);
}
