"use client";

import * as React from "react";

import { CalendarIcon, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverPanel,
} from "@/components/animate-ui/components/base/popover";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";

import type { Column } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";

type DateSelection = Date[] | DateRange;

function getIsDateRange(value: DateSelection): value is DateRange {
  return value && typeof value === "object" && !Array.isArray(value);
}

function parseAsDate(timestamp: number | string | undefined): Date | undefined {
  if (!timestamp) return;
  const numericTimestamp =
    typeof timestamp === "string" ? Number(timestamp) : timestamp;
  const date = new Date(numericTimestamp);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseColumnFilterValue(value: unknown) {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "number" || typeof item === "string") {
        return item;
      }
      return;
    });
  }

  if (typeof value === "string" || typeof value === "number") {
    return [value];
  }

  return [];
}

interface DataTableDateFilterProps<TData> {
  column: Column<TData, unknown>;
  title?: string;
}

export function DataTableDateFilter<TData>({
  column,
  title,
}: DataTableDateFilterProps<TData>) {
  const columnFilterValue = (
    column.getFilterValue() as Record<string, unknown>
  )?.["dateRange"];

  const selectedDates = React.useMemo<DateSelection>(() => {
    if (!columnFilterValue) {
      return { from: undefined, to: undefined };
    }

    const timestamps = parseColumnFilterValue(columnFilterValue);
    return {
      from: parseAsDate(timestamps[0]),
      to: parseAsDate(timestamps[1]),
    };
  }, [columnFilterValue]);

  const onSelect = React.useCallback(
    (date: Date | DateRange | undefined) => {
      if (!date) {
        column.setFilterValue(undefined);
        return;
      }

      if (!("getTime" in date)) {
        const from = date.from?.getTime();
        const to = date.to?.getTime();
        column.setFilterValue(
          from || to
            ? {
                dateRange: [from, to],
              }
            : undefined
        );
      }
    },
    [column]
  );

  const onReset = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      column.setFilterValue(undefined);
    },
    [column]
  );

  const hasValue = React.useMemo(() => {
    if (!getIsDateRange(selectedDates)) return false;
    return selectedDates.from || selectedDates.to;
  }, [selectedDates]);

  const formatDateRange = React.useCallback((range: DateRange) => {
    if (!(range.from || range.to)) return "";
    if (range.from && range.to) {
      return `${formatDate(range.from)} - ${formatDate(range.to)}`;
    }
    return formatDate(range.from ?? range.to);
  }, []);

  const label = React.useMemo(() => {
    if (!getIsDateRange(selectedDates)) return null;

    const hasSelectedDates = selectedDates.from || selectedDates.to;
    const dateText = hasSelectedDates
      ? formatDateRange(selectedDates)
      : "Select date range";

    return (
      <span className="flex items-center gap-2">
        <span>{title}</span>
        {hasSelectedDates && (
          <>
            <Separator
              className="mx-0.5 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
            <span>{dateText}</span>
          </>
        )}
      </span>
    );
  }, [selectedDates, formatDateRange, title]);

  return (
    <Popover>
      <PopoverTrigger
        nativeButton
        render={
          <Button className="border-dashed font-normal" variant="outline" />
        }
      >
        {hasValue ? (
          <div
            aria-label={`Clear ${title} filter`}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onClick={onReset}
            role="button"
            tabIndex={0}
          >
            <XCircle />
          </div>
        ) : (
          <CalendarIcon />
        )}
        {label}
      </PopoverTrigger>
      <PopoverPanel align="start" className="w-auto p-0">
        <Calendar
          autoFocus
          captionLayout="dropdown"
          mode="range"
          onSelect={onSelect}
          selected={
            getIsDateRange(selectedDates)
              ? selectedDates
              : { from: undefined, to: undefined }
          }
        />
      </PopoverPanel>
    </Popover>
  );
}
