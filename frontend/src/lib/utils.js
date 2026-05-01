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

export function groupMonitorsByUnit(monitors) {
    if (!monitors || !Array.isArray(monitors)) return []
    
    const grouped = {}
    monitors.forEach(monitor => {
        const unitId = monitor.linkedUnit?.id
        if (unitId && !grouped[unitId]) {
            grouped[unitId] = {
                unitId,
                unitName: monitor.linkedUnit?.deviceName || 'Unknown Unit',
                serialNumber: monitor.linkedUnit?.serialNumber,
                monitors: []
            }
        }
        if (unitId) {
            grouped[unitId].monitors.push(monitor)
        }
    })
    return Object.values(grouped)
}
