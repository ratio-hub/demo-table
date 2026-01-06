"use client";

import {
  type ColumnFiltersState,
  type ColumnOrderState,
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
import { useEffect, useState } from "react";

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key}`, error);
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

  storageKey?: string;
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
    storageKey = "data-table",
    ...tableProps
  } = props;

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(() =>
    getFromStorage(`${storageKey}-row-selection`, {})
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    getFromStorage(`${storageKey}-column-visibility`, {})
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
    getFromStorage(`${storageKey}-column-order`, [])
  );

  useEffect(() => {
    saveToStorage(`${storageKey}-row-selection`, rowSelection);
  }, [rowSelection, storageKey]);

  useEffect(() => {
    saveToStorage(`${storageKey}-column-visibility`, columnVisibility);
  }, [columnVisibility, storageKey]);

  useEffect(() => {
    saveToStorage(`${storageKey}-column-order`, columnOrder);
  }, [columnOrder, storageKey]);

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
      columnOrder,
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
    onColumnOrderChange: setColumnOrder,
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
