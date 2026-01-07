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

interface UseDataTableProps<TData>
  extends
    Omit<
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

interface PersistedTableState {
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
}

function getStorageKey(key: string): string {
  return `table-state-${key}`;
}

function loadPersistedState(storageKey: string): PersistedTableState | null {
  try {
    const stored = localStorage.getItem(getStorageKey(storageKey));
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function savePersistedState(
  storageKey: string,
  state: PersistedTableState
): void {
  try {
    localStorage.setItem(getStorageKey(storageKey), JSON.stringify(state));
  } catch {
    // silently fail if localStorage is unavailable (ignore errors)
  }
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
    storageKey,
    ...tableProps
  } = props;

  const persistedState = storageKey ? loadPersistedState(storageKey) : null;

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    persistedState?.rowSelection ?? {}
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(persistedState?.columnVisibility ?? {});

  React.useEffect(() => {
    if (!storageKey) return;

    savePersistedState(storageKey, {
      columnVisibility,
      rowSelection,
    });
  }, [storageKey, columnVisibility, rowSelection]);

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
