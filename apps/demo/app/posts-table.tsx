"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilter } from "@/components/data-table/data-table-filter";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Spinner } from "@/components/ui/spinner";
import { useDataTable } from "@/lib/hooks/use-data-table";
import { useDataTableState } from "@/lib/hooks/use-data-table-state";
import { postTableColumns } from "@/modules/posts/posts-table-columns";

import type { GetPostsResult } from "@/modules/posts/types";
import { AnimatePresence, motion } from "motion/react";

interface PostsTableProps {
  data: GetPostsResult;
}

export function PostsTable({ data }: PostsTableProps) {
  const tableState = useDataTableState();

  const { table } = useDataTable({
    data: data.posts,
    columns: postTableColumns,
    getRowId: (row) => row.id,
    pageCount: data.total,
    storageKey: "posts-table",
    ...tableState,
  });

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar>
        <DataTableFilter table={table} />

        <DataTableViewOptions table={table} />
      </DataTableToolbar>

      <DataTable table={table} />

      <AnimatePresence>
        {tableState.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-background/50"
          >
            <div className="rounded-md bg-card/20 p-2 shadow-lg">
              <Spinner className="size-10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
