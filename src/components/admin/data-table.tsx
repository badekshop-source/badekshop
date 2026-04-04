import { cn } from "@/lib/utils";

interface DataTableProps {
  headers: {
    key: string;
    label: string;
    className?: string;
  }[];
  rows: {
    id: string;
    cells: Record<string, React.ReactNode>;
    className?: string;
  }[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable({ headers, rows, emptyMessage = "No data available", className }: DataTableProps) {
  if (rows.length === 0) {
    return (
      <div className={cn("bg-white rounded-xl border border-gray-200 p-12 text-center", className)}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  scope="col"
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    header.className
                  )}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.id} className={cn("hover:bg-gray-50 transition-colors", row.className)}>
                {headers.map((header) => (
                  <td key={`${row.id}-${header.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {row.cells[header.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
