import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import { CATEGORIES_KEY } from "../hooks/useCategories.js";
import { TRANSACTIONS_KEY } from "../hooks/useTransactions.js";

// Helpers -------------------------------------------------------------
const card = (headingName) => screen.getByRole("heading", { name: headingName }).closest(".card");

async function addCategory(user, name, description) {
  await user.type(screen.getByLabelText("Category Name"), name);
  await user.type(screen.getByLabelText("Description"), description);
  await user.click(screen.getByRole("button", { name: "Save Category" }));
}

async function addTransaction(user, categoryName, amount, note = "") {
  await user.selectOptions(screen.getByLabelText("Category"), categoryName);
  await user.type(screen.getByLabelText("Amount (PHP)"), amount);
  if (note) await user.type(screen.getByLabelText(/Note/), note);
  await user.click(screen.getByRole("button", { name: "Save Transaction" }));
}

const confirmDelete = async (user, name) => {
  const dialog = screen.getByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name }));
};

// Tests ---------------------------------------------------------------
describe("empty states", () => {
  it("shows empty messages and disables Delete All with no data", () => {
    render(<App />);
    expect(screen.getByText("No categories registered yet.")).toBeInTheDocument();
    expect(screen.getByText("No income transactions recorded yet.")).toBeInTheDocument();
    const catCard = card(/Registered Categories/);
    expect(within(catCard).getByRole("button", { name: "Delete All" })).toBeDisabled();
    expect(screen.getByText(/Register an income category first/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Transaction" })).toBeDisabled();
    expect(screen.getByText("None yet")).toBeInTheDocument();
  });
});

describe("category registration (original behaviour)", () => {
  it("shows inline errors and focuses the first invalid field when saving blank", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Save Category" }));
    expect(screen.getByLabelText("Category Name")).toHaveClass("is-invalid");
    expect(screen.getByLabelText("Description")).toHaveClass("is-invalid");
    expect(screen.getByLabelText("Category Name")).toHaveFocus();
    expect(screen.getByText("Please enter a category name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a description.")).toBeInTheDocument();
  });

  it("rejects whitespace-only input and focuses the description when only it is invalid", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText("Category Name"), "Consulting");
    await user.type(screen.getByLabelText("Description"), "   ");
    await user.click(screen.getByRole("button", { name: "Save Category" }));
    expect(screen.getByLabelText("Category Name")).toHaveClass("is-valid");
    expect(screen.getByLabelText("Description")).toHaveClass("is-invalid");
    expect(screen.getByLabelText("Description")).toHaveFocus();
    expect(screen.queryByRole("cell", { name: "Consulting" })).not.toBeInTheDocument();
  });

  it("clears the error styling as soon as the flagged field is fixed", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Save Category" }));
    await user.type(screen.getByLabelText("Category Name"), "A");
    expect(screen.getByLabelText("Category Name")).toHaveClass("is-valid");
  });

  it("validates a field on blur", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByLabelText("Category Name"));
    await user.tab();
    expect(screen.getByLabelText("Category Name")).toHaveClass("is-invalid");
  });

  it("adds a trimmed category, resets the form, refocuses, and shows a toast", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "  Consulting  ", "  Support contract ");
    const table = within(card(/Registered Categories/));
    expect(table.getByRole("cell", { name: "Consulting" })).toBeInTheDocument();
    expect(table.getByRole("cell", { name: "Support contract" })).toBeInTheDocument();
    expect(screen.getByLabelText("Category Name")).toHaveValue("");
    expect(screen.getByLabelText("Category Name")).not.toHaveClass("is-valid");
    expect(screen.getByLabelText("Category Name")).toHaveFocus();
    expect(screen.getByText('Category "Consulting" saved.')).toBeInTheDocument();
    expect(screen.queryByText("No categories registered yet.")).not.toBeInTheDocument();
  });

  it("submits with the Enter key", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText("Category Name"), "Rental");
    await user.type(screen.getByLabelText("Description"), "Apartment{Enter}");
    expect(screen.getByRole("cell", { name: "Rental" })).toBeInTheDocument();
  });

  it("deletes one category after confirmation and restores the empty state", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await user.click(screen.getByRole("button", { name: "Delete Consulting" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await confirmDelete(user, "Delete category");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("No categories registered yet.")).toBeInTheDocument();
  });

  it("keeps the category when the delete is cancelled", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await user.click(screen.getByRole("button", { name: "Delete Consulting" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Consulting" })).toBeInTheDocument();
  });

  it("closes the dialog with the Escape key", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await user.click(screen.getByRole("button", { name: "Delete Consulting" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Delete All removes every category", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await addCategory(user, "Royalties", "Books");
    await user.click(within(card(/Registered Categories/)).getByRole("button", { name: "Delete All" }));
    await confirmDelete(user, "Delete everything");
    expect(screen.getByText("No categories registered yet.")).toBeInTheDocument();
  });
});

describe("category edit and search", () => {
  it("edits a category through the form", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await user.click(screen.getByRole("button", { name: "Edit Consulting" }));
    expect(screen.getByLabelText("Category Name")).toHaveValue("Consulting");
    expect(screen.getByRole("button", { name: "Update Category" })).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Category Name"));
    await user.type(screen.getByLabelText("Category Name"), "Advisory");
    await user.click(screen.getByRole("button", { name: "Update Category" }));
    expect(screen.getByRole("cell", { name: "Advisory" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Consulting" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Category" })).toBeInTheDocument();
    expect(screen.getByLabelText("Category Name")).toHaveValue("");
  });

  it("cancel leaves the category unchanged", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await user.click(screen.getByRole("button", { name: "Edit Consulting" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Save Category" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Consulting" })).toBeInTheDocument();
  });

  it("filters the category table by search text", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await addCategory(user, "Royalties", "Books");
    await user.type(screen.getByLabelText("Search categories"), "roy");
    expect(screen.getByRole("cell", { name: "Royalties" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Consulting" })).not.toBeInTheDocument();
    await user.clear(screen.getByLabelText("Search categories"));
    await user.type(screen.getByLabelText("Search categories"), "zzz");
    expect(screen.getByText("No categories match your search.")).toBeInTheDocument();
  });
});

describe("income transactions", () => {
  it("validates category and amount before saving", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await user.click(screen.getByRole("button", { name: "Save Transaction" }));
    expect(screen.getByLabelText("Category")).toHaveClass("is-invalid");
    expect(screen.getByLabelText("Amount (PHP)")).toHaveClass("is-invalid");
    expect(screen.getByLabelText("Category")).toHaveFocus();

    await user.selectOptions(screen.getByLabelText("Category"), "Consulting");
    await user.type(screen.getByLabelText("Amount (PHP)"), "0");
    await user.click(screen.getByRole("button", { name: "Save Transaction" }));
    expect(screen.getByLabelText("Amount (PHP)")).toHaveClass("is-invalid");
    expect(screen.getByLabelText("Amount (PHP)")).toHaveFocus();
    expect(screen.getByText("No income transactions recorded yet.")).toBeInTheDocument();
  });

  it("records income, updates totals and summary cards, and resets the amount", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await addTransaction(user, "Consulting", "1500.5", "Retainer");

    const txnCard = within(card(/Income Transactions/));
    expect(txnCard.getByText("Retainer")).toBeInTheDocument();
    expect(screen.getByTestId("transactions-total")).toHaveTextContent(/1,500\.50/);
    expect(screen.getByRole("region", { name: "Income summary" })).toHaveTextContent(/1,500\.50/);
    expect(within(screen.getByRole("region", { name: "Income summary" })).getByText("Consulting")).toBeInTheDocument();
    // category table shows its income
    expect(within(card(/Registered Categories/)).getByText(/1,500\.50/)).toBeInTheDocument();
    expect(screen.getByLabelText("Amount (PHP)")).toHaveValue(null);
    expect(screen.getByLabelText("Category")).toHaveDisplayValue("Consulting"); // kept for fast entry
  });

  it("edits a transaction", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await addTransaction(user, "Consulting", "100");
    await user.click(screen.getByRole("button", { name: /Edit transaction of/ }));
    expect(screen.getByLabelText("Amount (PHP)")).toHaveValue(100);
    await user.clear(screen.getByLabelText("Amount (PHP)"));
    await user.type(screen.getByLabelText("Amount (PHP)"), "250");
    await user.click(screen.getByRole("button", { name: "Update Transaction" }));
    expect(screen.getByTestId("transactions-total")).toHaveTextContent(/250\.00/);
    expect(screen.getByRole("button", { name: "Save Transaction" })).toBeInTheDocument();
  });

  it("deletes a transaction after confirmation", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await addTransaction(user, "Consulting", "100");
    await user.click(screen.getByRole("button", { name: /Delete transaction of/ }));
    await confirmDelete(user, "Delete transaction");
    expect(screen.getByText("No income transactions recorded yet.")).toBeInTheDocument();
  });

  it("Delete All transactions keeps the categories", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await addTransaction(user, "Consulting", "100");
    await user.click(within(card(/Income Transactions/)).getByRole("button", { name: "Delete All" }));
    await confirmDelete(user, "Delete all");
    expect(screen.getByText("No income transactions recorded yet.")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Consulting" })).toBeInTheDocument();
  });

  it("filters transactions by category and by note, with a filtered total", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await addCategory(user, "Royalties", "Books");
    await addTransaction(user, "Consulting", "100", "Audit");
    await addTransaction(user, "Royalties", "40", "Q3 royalty");

    await user.selectOptions(screen.getByLabelText("Filter transactions by category"), "Royalties");
    expect(screen.queryByText("Audit")).not.toBeInTheDocument();
    expect(screen.getByTestId("transactions-total")).toHaveTextContent(/40\.00/);
    expect(screen.getByText("Filtered total")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter transactions by category"), "All categories");
    await user.type(screen.getByLabelText("Search transaction notes"), "audit");
    expect(screen.getByText("Audit")).toBeInTheDocument();
    expect(screen.queryByText("Q3 royalty")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("Search transaction notes"));
    await user.type(screen.getByLabelText("Search transaction notes"), "nothing");
    expect(screen.getByText("No transactions match your filters.")).toBeInTheDocument();
  });

  it("deleting a category also deletes its transactions and says so in the dialog", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await addTransaction(user, "Consulting", "100");
    await addTransaction(user, "Consulting", "200");
    await user.click(screen.getByRole("button", { name: "Delete Consulting" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(/2 income transactions/);
    await confirmDelete(user, "Delete category");
    expect(screen.getByText("No categories registered yet.")).toBeInTheDocument();
    expect(screen.getByText("No income transactions recorded yet.")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(TRANSACTIONS_KEY))).toEqual([]);
  });

  it("renames a category and the transaction table follows", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    await addTransaction(user, "Consulting", "100");
    await user.click(screen.getByRole("button", { name: "Edit Consulting" }));
    await user.clear(screen.getByLabelText("Category Name"));
    await user.type(screen.getByLabelText("Category Name"), "Advisory");
    await user.click(screen.getByRole("button", { name: "Update Category" }));
    const txnCard = within(card(/Income Transactions/));
    expect(txnCard.getByRole("cell", { name: /Advisory/ })).toBeInTheDocument();
    expect(txnCard.queryByRole("cell", { name: /Consulting/ })).not.toBeInTheDocument();
  });

  it("accepts a specific date", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addCategory(user, "Consulting", "Support");
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-03-15" } });
    await addTransaction(user, "Consulting", "75");
    expect(within(card(/Income Transactions/)).getByText("Mar 15, 2026")).toBeInTheDocument();
  });
});

describe("persistence (localStorage)", () => {
  it("restores categories and transactions after a 'refresh'", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await addCategory(user, "Consulting", "Support");
    await addTransaction(user, "Consulting", "321.45", "Saved note");
    expect(JSON.parse(window.localStorage.getItem(CATEGORIES_KEY))).toHaveLength(1);
    first.unmount();

    render(<App />);
    expect(screen.getByRole("cell", { name: "Consulting" })).toBeInTheDocument();
    expect(screen.getByText("Saved note")).toBeInTheDocument();
    expect(screen.getByTestId("transactions-total")).toHaveTextContent(/321\.45/);
  });

  it("starts empty when saved data is corrupted", () => {
    window.localStorage.setItem(CATEGORIES_KEY, "{not json");
    window.localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify({ wrong: "shape" }));
    render(<App />);
    expect(screen.getByText("No categories registered yet.")).toBeInTheDocument();
    expect(screen.getByText("No income transactions recorded yet.")).toBeInTheDocument();
  });
});
