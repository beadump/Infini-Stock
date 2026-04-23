import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function capitalize(str) {
    if (!str) return ''
    return String(str).charAt(0).toUpperCase() + String(str).slice(1).toLowerCase()
}

export function formatId(id) {
    if (!id) return ''
    // Extract last 8 characters and prepend prefix
    const lastEight = id.slice(-8)
    return `Infocom_${lastEight}`
}
