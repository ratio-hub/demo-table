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
  type ColumnOrderState,
} from "@tanstack/react-table";
import { useLocalStorage } from "./use-local-storage";

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
  const [columnVisibility, setColumnVisibility] = useLocalStorage<VisibilityState>(
    "data-table-visibility",
    {}
  );
  const [columnOrder, setColumnOrder] = useLocalStorage<ColumnOrderState>(
    "data-table-order",
    []
  );

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
