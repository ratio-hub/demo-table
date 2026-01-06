"use client";

import * as React from "react";

import { Check, PlusCircle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverPanel,
} from "@/components/animate-ui/components/base/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { Column } from "@tanstack/react-table";
import type { Option } from "@/types/data-table";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: Option[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);

  const columnFilterValue = (
    column?.getFilterValue() as Record<string, unknown>
  )?.["multiSelect"];
  const selectedValues = new Set(
    Array.isArray(columnFilterValue) ? columnFilterValue : []
  );

  const onItemSelect = React.useCallback(
    (option: Option, isSelected: boolean) => {
      if (!column) return;

      const newSelectedValues = new Set(selectedValues);
      if (isSelected) {
        newSelectedValues.delete(option.value);
      } else {
        newSelectedValues.add(option.value);
      }

      console.log(newSelectedValues);
      const filterValues = Array.from(newSelectedValues);
      column.setFilterValue(
        filterValues.length ? { multiSelect: filterValues } : undefined
      );
    },
    [column, selectedValues]
  );

  const onReset = React.useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      column?.setFilterValue(undefined);
    },
    [column]
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        nativeButton
        render={
          <Button className="border-dashed font-normal" variant="outline" />
        }
      >
        {selectedValues?.size > 0 ? (
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
          <PlusCircle />
        )}
        {title}
        {selectedValues?.size > 0 && (
          <>
            <Separator
              className="mx-0.5 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
            <Badge
              className="rounded-sm px-1 font-normal lg:hidden"
              variant="secondary"
            >
              {selectedValues.size}
            </Badge>

            <Badge
              className="h-full min-w-16 rounded-none border px-1.5 font-normal"
              variant="ghost"
            >
              <div className="flex items-center -space-x-2">
                {options
                  .filter((option) => selectedValues.has(option.value))
                  .map((option) => (
                    <div
                      className="rounded-full border bg-background p-0.5"
                      key={option.value}
                    >
                      {option.icon && <option.icon className="size-3.5" />}
                    </div>
                  ))}
              </div>

              <span className="truncate">
                {selectedValues.size > 1
                  ? `${selectedValues.size} selected`
                  : [...selectedValues].at(-1)}
              </span>
            </Badge>
          </>
        )}
      </PopoverTrigger>
      <PopoverPanel align="start" className="w-50 p-0">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList className="max-h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden">
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => onItemSelect(option, isSelected)}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check />
                    </div>
                    {option.icon && <option.icon />}
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    className="justify-center text-center"
                    onSelect={() => onReset()}
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverPanel>
    </Popover>
  );
}
