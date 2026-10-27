/** A numbered section card: coloured title on the left, optional actions on the right. */
export default function Panel({ title, tone = "dark", actions, children }) {
  return (
    <section className="card panel">
      <div className="panel-head">
        <h2 className={`panel-title tone-${tone}`}>{title}</h2>
        {actions && <div className="panel-actions">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
