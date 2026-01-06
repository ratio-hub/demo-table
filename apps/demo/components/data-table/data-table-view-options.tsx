"use client";

import * as React from "react";

import { Check, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverPanel,
} from "@/components/animate-ui/components/base/popover";

import type { Table } from "@tanstack/react-table";

interface DataTableViewOptionsProps<TData> extends React.ComponentProps<
  typeof PopoverPanel
> {
  table: Table<TData>;
  disabled?: boolean;
}

export function DataTableViewOptions<TData>({
  table,
  disabled,
  ...props
}: DataTableViewOptionsProps<TData>) {
  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide()
        ),
    [table]
  );

  return (
    <Popover>
      <PopoverTrigger
        nativeButton
        render={
          <Button
            aria-label="Toggle columns"
            className="ml-auto hidden h-8 font-normal lg:flex"
            disabled={disabled}
            role="combobox"
            variant="outline"
          />
        }
      >
        <Settings2 className="text-muted-foreground" />
        View
      </PopoverTrigger>
      <PopoverPanel className="w-52 p-0" {...props}>
        <Command>
          <CommandInput placeholder="Search columns..." />
          <CommandList>
            <CommandEmpty>No columns found.</CommandEmpty>
            <CommandGroup>
              {columns.map((column) => (
                <CommandItem
                  key={column.id}
                  onSelect={() =>
                    column.toggleVisibility(!column.getIsVisible())
                  }
                >
                  <span className="truncate">
                    {column.columnDef.meta?.label ?? column.id}
                  </span>

                  <Check
                    className={cn(
                      "ml-auto size-4 shrink-0",
                      column.getIsVisible() ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverPanel>
    </Popover>
  );
}
