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

const COLUMN_VISIBILITY_STORAGE_KEY = "posts-table-column-visibility"

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

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    if (typeof window === 'undefined') return {}; 
    
    try {
      const saved = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load column visibility from localStorage:', error);
      return {};
    }
  });

  // Save column visibility to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(columnVisibility));
    } catch (error) {
      console.error('Failed to save column visibility to localStorage:', error);
    }
  }, [columnVisibility]);


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
