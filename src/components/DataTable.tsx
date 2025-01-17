import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Search } from 'lucide-react';

interface DataRow {
  domainName: string;
  category: string;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: string;
}

const columnHelper = createColumnHelper<DataRow>();

const columns = [
  columnHelper.accessor('domainName', {
    header: 'Domain Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('category', {
    header: 'Category',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('pageViews', {
    header: 'Page Views',
    cell: (info) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('uniqueVisitors', {
    header: 'Unique Visitors',
    cell: (info) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('bounceRate', {
    header: 'Bounce Rate',
    cell: (info) => info.getValue(),
  }),
];

export function DataTable() {
  const [data, setData] = useState<DataRow[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/1vwc803C8MwWBMc7ntCre3zJ5xZtG881HKkxlIrwwxNs/gviz/tq?tqx=out:csv');
        const csvText = await response.text();
        
        // Parse CSV (simple implementation - you might want to use a CSV parser library for production)
        const rows = csvText.split('\n').slice(1); // Skip header
        const parsedData = rows.map(row => {
          const [domainName, category, pageViews, uniqueVisitors, bounceRate] = row.split(',');
          return {
            domainName: domainName.replace(/"/g, ''),
            category: category.replace(/"/g, ''),
            pageViews: parseInt(pageViews.replace(/"/g, ''), 10),
            uniqueVisitors: parseInt(uniqueVisitors.replace(/"/g, ''), 10),
            bounceRate: bounceRate.replace(/"/g, ''),
          };
        });
        
        setData(parsedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Search domains..."
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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