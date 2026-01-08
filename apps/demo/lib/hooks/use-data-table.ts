'use client'

import * as React from 'react'
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
	type VisibilityState
} from '@tanstack/react-table'

interface UseDataTableProps<TData>
	extends
		Omit<TableOptions<TData>, 'state' | 'pageCount' | 'getCoreRowModel' | 'manualFiltering' | 'manualPagination' | 'manualSorting'>,
		Required<Pick<TableOptions<TData>, 'pageCount'>> {
	paginationState: PaginationState
	setPaginationState: (updaterOrValue: PaginationState) => void

	sortingState: SortingState
	setSortingState: (updaterOrValue: SortingState) => void

	columnFiltersState: ColumnFiltersState
	setColumnFiltersState: (updaterOrValue: ColumnFiltersState) => void
}

const COLUMN_VISIBILITY_STORAGE_KEY = 'posts-table-column-visibility'

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
	'use no memo'
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
	} = props

	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
		if (typeof localStorage === 'undefined') {
			return {}
		}

		const stored = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY)
		if (stored) {
			const parsed = JSON.parse(stored) as VisibilityState

			const visibility: VisibilityState = {}
			for (const [key, value] of Object.entries(parsed)) {
				if (typeof value === 'boolean') {
					visibility[key] = value
				}
			}

			return visibility
		}

		return {}
	})

	React.useEffect(() => {
		if (Object.keys(columnVisibility).length > 0) {
			localStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(columnVisibility))
		} else {
			localStorage.removeItem(COLUMN_VISIBILITY_STORAGE_KEY)
		}
	}, [columnVisibility])

	function onSortingChange(updaterOrValue: Updater<SortingState>) {
		if (typeof updaterOrValue === 'function') {
			setSortingState(updaterOrValue(sortingState))
		} else {
			setSortingState(updaterOrValue)
		}
	}

	function onPaginationChange(updaterOrValue: Updater<PaginationState>) {
		if (typeof updaterOrValue === 'function') {
			setPaginationState(updaterOrValue(paginationState))
		} else {
			setPaginationState(updaterOrValue)
		}
	}

	function onColumnFiltersChange(updaterOrValue: Updater<ColumnFiltersState>) {
		if (typeof updaterOrValue === 'function') {
			setColumnFiltersState(updaterOrValue(columnFiltersState))
		} else {
			setColumnFiltersState(updaterOrValue)
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
			columnFilters: columnFiltersState
		},

		defaultColumn: {
			...tableProps.defaultColumn,
			enableColumnFilter: false
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
		enableRowSelection: true
	})

	return { table }
}
