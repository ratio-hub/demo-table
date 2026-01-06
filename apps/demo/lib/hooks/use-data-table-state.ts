"use client";

import { useEffect, useMemo, useTransition } from "react";

import { useQueryStates } from "nuqs";

import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";

import {
  pageParser,
  perPageParser,
  sortParser,
  filterParser,
  type Filters,
  type Sort,
} from "@/lib/search-params/posts-search-params";
import { useLocalStorage } from "./use-local-storage";

export const filterVariantsSchema = [
  "text",
  "dateRange",
  "multiSelect",
  "user",
] as const;
export type FilterVariant = (typeof filterVariantsSchema)[number];

export function useDataTableState() {
  const [isPending, startTransition] = useTransition();
  const [localStoragePerPage, setLocalStoragePerPage] = useLocalStorage<number>(
    "data-table-per-page",
    20
  );

  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: pageParser,
      perPage: perPageParser,
      sort: sortParser,
      filter: filterParser,
    },
    {
      shallow: false,
      startTransition,
    }
  );

  const paginationState = useMemo<PaginationState>(
    () => ({
      pageIndex: searchParams.page - 1,
      pageSize: searchParams.perPage,
    }),
    [searchParams.page, searchParams.perPage]
  );

  const setPaginationState = (pagination: PaginationState) => {
    setSearchParams({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
    });
  };

  const sortingState = useMemo<SortingState>(
    () =>
      Object.entries(searchParams.sort).map(([id, direction]) => ({
        id,
        desc: direction === "desc",
      })),
    [searchParams.sort]
  );

  const setSortingState = (sorting: SortingState) => {
    const sortRecord: Sort = {};
    for (const { id, desc } of sorting) {
      sortRecord[id] = desc ? "desc" : "asc";
    }
    setSearchParams({
      sort: Object.keys(sortRecord).length > 0 ? sortRecord : null,
    });
  };

  const columnFiltersState = useMemo<ColumnFiltersState>(
    () =>
      Object.entries(searchParams.filter)
        .filter(([, value]) => value !== undefined)
        .map(([id, value]) => ({
          id,
          value,
        })),
    [searchParams.filter]
  );

  const setColumnFiltersState = (columnFilters: ColumnFiltersState) => {
    const filterRecord: Filters = {};
    for (const { id, value } of columnFilters) {
      if (value !== undefined && value !== null) {
        filterRecord[id] = value as Filters[string];
      }
    }
    setSearchParams({
      filter: Object.keys(filterRecord).length > 0 ? filterRecord : null,
    });
  };

  useEffect(() => {
    if (searchParams.perPage) {
      setLocalStoragePerPage(searchParams.perPage);
    }
  }, [searchParams.perPage, setLocalStoragePerPage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("perPage") && localStoragePerPage !== searchParams.perPage) {
      setSearchParams({ perPage: localStoragePerPage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    paginationState,
    setPaginationState,
    sortingState,
    setSortingState,
    columnFiltersState,
    setColumnFiltersState,
    isPending,
  };
}
