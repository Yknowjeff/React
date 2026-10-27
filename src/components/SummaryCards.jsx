import { formatCurrency, monthTotal, sumAmounts, topCategory, todayISO } from "../utils/ledger.js";

function Stat({ label, value, hint, accent }) {
  return (
    <div className="col-6 col-lg-3">
      <div className={`card shadow-sm h-100 stat-card stat-${accent}`}>
        <div className="card-body">
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
          {hint && <div className="stat-hint">{hint}</div>}
        </div>
      </div>
    </div>
  );
}

export default function SummaryCards({ categories, transactions }) {
  const now = new Date();
  const monthKey = todayISO(now).slice(0, 7);
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const top = topCategory(categories, transactions);

  return (
    <section className="row g-3 mb-4" aria-label="Income summary">
      <Stat label="Total income" value={formatCurrency(sumAmounts(transactions))} accent="green" />
      <Stat
        label="This month"
        value={formatCurrency(monthTotal(transactions, monthKey))}
        hint={monthLabel}
        accent="blue"
      />
      <Stat
        label="Transactions"
        value={transactions.length}
        hint={`${categories.length} ${categories.length === 1 ? "category" : "categories"}`}
        accent="amber"
      />
      <Stat
        label="Top category"
        value={top ? top.category.name : "None yet"}
        hint={top ? formatCurrency(top.total) : "Record income to see this"}
        accent="violet"
      />
    </section>
  );
}
