import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Table = forwardRef(({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-xl border border-[#4a3a6b]/60 bg-[#0f0a1a] shadow-2xl backdrop-blur-md">
        <table
            ref={ref}
            className={cn('w-full caption-bottom text-sm', className)}
            {...props}
        />
    </div>
))
Table.displayName = 'Table'

const TableHeader = forwardRef(({ className, ...props }, ref) => (
    <thead
        ref={ref}
        className={cn('border-b border-[#4a3a6b]/50 bg-gradient-to-r from-[#1a1428]/80 to-[#2d1f4d]/60 text-gray-300', className)}
        {...props}
    />
))
TableHeader.displayName = 'TableHeader'

const TableBody = forwardRef(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
    />
))
TableBody.displayName = 'TableBody'

const TableFooter = forwardRef(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            'border-t border-[#3d2e5c] bg-[#1a1525] font-medium [&>tr]:last:border-b-0',
            className,
        )}
        {...props}
    />
))
TableFooter.displayName = 'TableFooter'

const TableRow = forwardRef(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            'border-b border-[#4a3a6b]/30 bg-gradient-to-r from-[#2d1f3f]/60 via-[#3d2a4d]/50 to-[#2d1f3f]/60 transition-all duration-200 hover:from-[#3d2a4d]/70 hover:via-[#4a3a6b]/60 hover:to-[#3d2a4d]/70 data-[state=selected]:bg-gradient-to-r data-[state=selected]:from-[#4a3a6b]/80 data-[state=selected]:via-[#5a4a7b]/70 data-[state=selected]:to-[#4a3a6b]/80 backdrop-blur-sm shadow-lg shadow-[#4a3a6b]/10',
            className,
        )}
        {...props}
    />
))
TableRow.displayName = 'TableRow'

const TableHead = forwardRef(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            'h-14 bg-transparent px-6 py-3 text-left align-middle text-xs font-semibold uppercase tracking-wider text-gray-300 first:pl-8 last:pr-8 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
            className,
        )}
        {...props}
    />
))
TableHead.displayName = 'TableHead'

const TableCell = forwardRef(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            'px-6 py-4 align-middle text-gray-100 first:pl-8 last:pr-8 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
            className,
        )}
        {...props}
    />
))
TableCell.displayName = 'TableCell'

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
}
