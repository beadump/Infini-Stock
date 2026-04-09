import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-lavender-500 focus:ring-offset-[#171717] backdrop-blur-sm',
    {
        variants: {
            variant: {
                default: 'border-lavender-500/60 bg-gradient-to-r from-lavender-600/40 to-lavender-500/30 text-lavender-100 hover:from-lavender-600/50 hover:to-lavender-500/40 shadow-lg shadow-lavender-500/20',
                secondary: 'border-[#4a3a6b]/60 bg-gradient-to-r from-[#2d1f4d]/40 to-[#1f1a2f]/30 text-lavender-200 hover:from-[#3d2e5c]/50 hover:to-[#2d1f4d]/40',
                destructive: 'border-red-500/60 bg-gradient-to-r from-red-600/40 to-red-500/30 text-red-100 hover:from-red-600/50 hover:to-red-500/40 shadow-lg shadow-red-500/20',
                outline: 'border-lavender-500/60 text-lavender-300 hover:bg-lavender-600/10',
                success: 'border-green-500/60 bg-gradient-to-r from-green-600/40 to-green-500/30 text-green-100 hover:from-green-600/50 hover:to-green-500/40 shadow-lg shadow-green-500/20',
                warning: 'border-amber-500/60 bg-gradient-to-r from-amber-600/40 to-amber-500/30 text-amber-100 hover:from-amber-600/50 hover:to-amber-500/40 shadow-lg shadow-amber-500/20',
                info: 'border-blue-500/60 bg-gradient-to-r from-blue-600/40 to-blue-500/30 text-blue-100 hover:from-blue-600/50 hover:to-blue-500/40 shadow-lg shadow-blue-500/20',
                active: 'border-green-500/60 bg-gradient-to-r from-green-600/40 to-green-500/30 text-green-100 hover:from-green-600/50 hover:to-green-500/40 shadow-lg shadow-green-500/20',
                inactive: 'border-gray-500/60 bg-gradient-to-r from-gray-600/40 to-gray-500/30 text-gray-200 hover:from-gray-600/50 hover:to-gray-500/40',
                maintenance: 'border-amber-500/60 bg-gradient-to-r from-amber-600/40 to-amber-500/30 text-amber-100 hover:from-amber-600/50 hover:to-amber-500/40 shadow-lg shadow-amber-500/20',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
)

const Badge = forwardRef(({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
))
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
