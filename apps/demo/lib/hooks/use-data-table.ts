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

const TABLE_VIEW_STORAGE_KEY = "demo-table-view";

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
    paginationState: propsPaginationState,
    setPaginationState: propsSetPaginationState,
    sortingState: propsSortingState,
    setSortingState: propsSetSortingState,
    columnFiltersState: propsColumnFiltersState,
    setColumnFiltersState: propsSetColumnFiltersState,
    ...tableProps
  } = props;

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // added persistence for column visibility
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(TABLE_VIEW_STORAGE_KEY);
      return stored ? JSON.parse(stored).columnVisibility ?? {} : {};
    } catch {
      return {};
    }
  });

  // added persistence for column order
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(TABLE_VIEW_STORAGE_KEY);
      return stored ? JSON.parse(stored).columnOrder ?? [] : [];
    } catch {
      return [];
    }
  });

  // this part saves column visibility and order to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(
        TABLE_VIEW_STORAGE_KEY,
        JSON.stringify({ columnVisibility, columnOrder })
      );
    } catch {}
  }, [columnVisibility, columnOrder]);

  const onSortingChange = (updaterOrValue: Updater<SortingState>) => {
    const newState =
      typeof updaterOrValue === "function" ? updaterOrValue(propsSortingState) : updaterOrValue;
    propsSetSortingState(newState);
  };

  const onPaginationChange = (updaterOrValue: Updater<PaginationState>) => {
    const newState =
      typeof updaterOrValue === "function" ? updaterOrValue(propsPaginationState) : updaterOrValue;
    propsSetPaginationState(newState);
  };

  const onColumnFiltersChange = (updaterOrValue: Updater<ColumnFiltersState>) => {
    const newState =
      typeof updaterOrValue === "function" ? updaterOrValue(propsColumnFiltersState) : updaterOrValue;
    propsSetColumnFiltersState(newState);
  };

  const table = useReactTable({
    ...tableProps,
    columns,
    pageCount,
    state: {
      sorting: propsSortingState,
      pagination: propsPaginationState,
      columnVisibility,   
      rowSelection,
      columnFilters: propsColumnFiltersState,
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