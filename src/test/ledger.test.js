import { describe, it, expect } from "vitest";
import {
  isFilled,
  isValidAmount,
  todayISO,
  formatCurrency,
  formatDate,
  sumAmounts,
  monthTotal,
  totalsByCategory,
  topCategory,
  filterCategories,
  filterTransactions,
  sortTransactions,
  createId,
} from "../utils/ledger.js";

const cats = [
  { id: "c1", name: "Consulting", description: "Enterprise technical support" },
  { id: "c2", name: "Royalties", description: "Book sales" },
];
const txns = [
  { id: "t1", categoryId: "c1", amount: 1000.1, date: "2026-10-05", note: "Retainer" },
  { id: "t2", categoryId: "c1", amount: 2000.2, date: "2026-10-20", note: "Audit" },
  { id: "t3", categoryId: "c2", amount: 50, date: "2026-09-30", note: "Q3 royalty" },
];

describe("validation helpers", () => {
  it("isFilled rejects blank and whitespace-only text", () => {
    expect(isFilled("")).toBe(false);
    expect(isFilled("   ")).toBe(false);
    expect(isFilled(" a ")).toBe(true);
  });

  it("isValidAmount accepts only positive finite numbers", () => {
    expect(isValidAmount("")).toBe(false);
    expect(isValidAmount("0")).toBe(false);
    expect(isValidAmount("-5")).toBe(false);
    expect(isValidAmount("abc")).toBe(false);
    expect(isValidAmount("12.5")).toBe(true);
  });
});

describe("formatting", () => {
  it("formats currency as Philippine pesos", () => {
    expect(formatCurrency(1500)).toMatch(/1,500\.00/);
  });

  it("formats an ISO date without timezone shifting", () => {
    expect(formatDate("2026-10-05")).toBe("Oct 5, 2026");
  });

  it("builds today's date from the local clock", () => {
    expect(todayISO(new Date(2026, 0, 9))).toBe("2026-01-09");
  });

  it("createId returns different ids", () => {
    expect(createId()).not.toBe(createId());
  });
});

describe("income calculations", () => {
  it("sums in centavos so decimals stay exact", () => {
    expect(sumAmounts(txns)).toBe(3050.3);
  });

  it("totals one month only", () => {
    expect(monthTotal(txns, "2026-10")).toBe(3000.3);
    expect(monthTotal(txns, "2026-09")).toBe(50);
    expect(monthTotal(txns, "2025-01")).toBe(0);
  });

  it("totals per category", () => {
    expect(totalsByCategory(txns)).toEqual({ c1: 3000.3, c2: 50 });
  });

  it("finds the top category, or null with no income", () => {
    expect(topCategory(cats, txns).category.id).toBe("c1");
    expect(topCategory(cats, [])).toBeNull();
  });
});

describe("search, filter, sort", () => {
  it("searches categories by name or description, ignoring case", () => {
    expect(filterCategories(cats, "consult")).toHaveLength(1);
    expect(filterCategories(cats, "BOOK")[0].id).toBe("c2");
    expect(filterCategories(cats, "  ")).toHaveLength(2);
  });

  it("filters transactions by category and note", () => {
    expect(filterTransactions(txns, { categoryId: "c1" })).toHaveLength(2);
    expect(filterTransactions(txns, { query: "royalty" })).toHaveLength(1);
    expect(filterTransactions(txns, { categoryId: "c2", query: "audit" })).toHaveLength(0);
    expect(filterTransactions(txns)).toHaveLength(3);
  });

  it("sorts newest date first", () => {
    expect(sortTransactions(txns).map((t) => t.id)).toEqual(["t2", "t1", "t3"]);
  });
});
