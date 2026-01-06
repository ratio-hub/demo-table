"use client";

import * as React from "react";
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type Updater,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

const TABLE_VIEW_STORAGE_KEY = "ratio-demo-table-view";

interface UseDataTableProps<TData>
  extends Omit<
      TableOptions<TData>,
      | "state"
      | "pageCount"
      | "getCoreRowModel"
      | "manualFiltering"
      | "manualPagination"
      | "manualSorting"
    >,
    Required<Pick<TableOptions<TData>, "pageCount">> {
  paginationState: PaginationState;
  setPaginationState: (updaterOrValue: PaginationState) => void;

  sortingState: SortingState;
  setSortingState: (updaterOrValue: SortingState) => void;

  columnFiltersState: ColumnFiltersState;
  setColumnFiltersState: (updaterOrValue: ColumnFiltersState) => void;
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const {
    columns,
    pageCount = -1,
    paginationState,
    setPaginationState,
    sortingState,
    setSortingState,
    columnFiltersState,
    setColumnFiltersState,
    ...tableProps
  } = props;

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // ✅ Restore column visibility
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      if (typeof window === "undefined") return {};
      try {
        const stored = localStorage.getItem(TABLE_VIEW_STORAGE_KEY);
        return stored ? JSON.parse(stored).columnVisibility ?? {} : {};
      } catch {
        return {};
      }
    });

  // ✅ Restore column order
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(TABLE_VIEW_STORAGE_KEY);
      return stored ? JSON.parse(stored).columnOrder ?? [] : [];
    } catch {
      return [];
    }
  });

  // ✅ Persist view state
  React.useEffect(() => {
    const viewState = {
      columnVisibility,
      columnOrder,
    };

    try {
      localStorage.setItem(TABLE_VIEW_STORAGE_KEY, JSON.stringify(viewState));
    } catch {
      // ignore write errors
    }
  }, [columnVisibility, columnOrder]);

  function onSortingChange(updaterOrValue: Updater<SortingState>) {
    setSortingState(
      typeof updaterOrValue === "function"
        ? updaterOrValue(sortingState)
        : updaterOrValue
    );
  }

  function onPaginationChange(updaterOrValue: Updater<PaginationState>) {
    setPaginationState(
      typeof updaterOrValue === "function"
        ? updaterOrValue(paginationState)
        : updaterOrValue
    );
  }

  function onColumnFiltersChange(updaterOrValue: Updater<ColumnFiltersState>) {
    setColumnFiltersState(
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnFiltersState)
        : updaterOrValue
    );
  }

  const table = useReactTable({
    ...tableProps,
    columns,
    pageCount,
    state: {
      sorting: sortingState,
      pagination: paginationState,
      columnFilters: columnFiltersState,
      rowSelection,
      columnVisibility,
      columnOrder, // ✅ NEW
    },

    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: false,
    },

    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder, // ✅ NEW

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),

    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableMultiSort: true,
    enableRowSelection: true,
  });

  return { table };
}
