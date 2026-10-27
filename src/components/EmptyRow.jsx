export default function EmptyRow({ message = "No categories registered yet.", colSpan = 4 }) {
  return (
    <tr className="empty-row">
      <td colSpan={colSpan} className="text-center text-muted">
        {message}
      </td>
    </tr>
  );
}
