import { forwardRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './Button'

const Pagination = forwardRef(({ className, ...props }, ref) => (
    <nav
        ref={ref}
        className={cn('flex items-center justify-between', className)}
        {...props}
    />
))
Pagination.displayName = 'Pagination'

const PaginationContent = forwardRef(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        className={cn('flex flex-row items-center gap-1', className)}
        {...props}
    />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = forwardRef(({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

const PaginationLink = forwardRef(({ isActive, disabled, className, ...props }, ref) => (
    <Button
        ref={ref}
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        disabled={disabled}
        className={cn('h-9 w-9 p-0 rounded-md', className)}
        {...props}
    />
))
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = forwardRef(({ className, ...props }, ref) => (
    <PaginationLink
        ref={ref}
        variant="outline"
        size="default"
        className={cn('gap-1 pr-2.5', className)}
        {...props}
    >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline-block">Previous</span>
    </PaginationLink>
))
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = forwardRef(({ className, ...props }, ref) => (
    <PaginationLink
        ref={ref}
        variant="outline"
        size="default"
        className={cn('gap-1 pl-2.5', className)}
        {...props}
    >
        <span className="hidden sm:inline-block">Next</span>
        <ChevronRight className="h-4 w-4" />
    </PaginationLink>
))
PaginationNext.displayName = 'PaginationNext'

export {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
}
