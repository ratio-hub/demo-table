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

const STORAGE_KEY = "data-table-view-state";

function getStoredViewState(): {
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
} {
  if (typeof window === "undefined") {
    return { columnVisibility: {}, columnOrder: [] };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    //ignore parse errors
  }
  return { columnVisibility: {}, columnOrder: [] };
}

function saveViewState(
  columnVisibility: VisibilityState,
  columnOrder: ColumnOrderState
) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ columnVisibility, columnOrder })
    );
  } catch {
    //ignore storage errors
  }
}

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
  "use no memo";
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
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(getStoredViewState().columnVisibility);
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
    getStoredViewState().columnOrder
  );

  React.useEffect(() => {
    saveViewState(columnVisibility, columnOrder);
  }, [columnVisibility, columnOrder]);

  function onSortingChange(updaterOrValue: Updater<SortingState>) {
    if (typeof updaterOrValue === "function") {
      setSortingState(updaterOrValue(sortingState));
    } else {
      setSortingState(updaterOrValue);
    }
  }

  function onPaginationChange(updaterOrValue: Updater<PaginationState>) {
    if (typeof updaterOrValue === "function") {
      setPaginationState(updaterOrValue(paginationState));
    } else {
      setPaginationState(updaterOrValue);
    }
  }

  function onColumnFiltersChange(updaterOrValue: Updater<ColumnFiltersState>) {
    if (typeof updaterOrValue === "function") {
      setColumnFiltersState(updaterOrValue(columnFiltersState));
    } else {
      setColumnFiltersState(updaterOrValue);
    }
  }

  const table = useReactTable({
    ...tableProps,
    columns,
    pageCount,
    state: {
      sorting: sortingState,
      pagination: paginationState,
      columnVisibility,
      rowSelection,
      columnFilters: columnFiltersState,
      columnVisibility,
      columnOrder,
    },

    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: false,
    },

    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,

    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
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
