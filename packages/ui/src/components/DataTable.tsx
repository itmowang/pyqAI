import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  title: string;
  render?: (value: any, record: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  rowKey,
}: DataTableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map(record => (
            <tr key={String(record[rowKey])}>
              {columns.map(col => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm">
                  {col.render ? col.render(record[col.key], record) : record[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
