// src/components/table/DataTable.jsx
export default function DataTable({ 
  columns, 
  rows, 
  emptyLabel = "No data",
  loading = false 
}) {
  // Ensure rows is always an array
  const safeRows = Array.isArray(rows) ? rows : [];

  if (loading) {
    return (
      <div className="overflow-x-auto bg-white rounded-2xl shadow-card">
        <div className="p-8 text-center text-slate-500">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-card">
      <table className="w-full text-left">
        <thead className="text-slate-600 text-sm border-b">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 font-medium">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {safeRows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                {emptyLabel}
              </td>
            </tr>
          ) : safeRows.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 align-middle">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}