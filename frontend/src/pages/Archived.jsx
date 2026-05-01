import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { unitApi, monitorApi } from '../api'
import { Card } from '../components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table'
import FullPageLoader from '../components/FullPageLoader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { capitalize, formatId } from '../lib/utils'
import { clampRowCount, exportToCsv } from '../lib/export'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import TablePagination from '../components/TablePagination'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, useDialog } from '../components/ui/Dialog'
import { Download, RefreshCw, RotateCcw, Search } from 'lucide-react'
import { ToastContainer } from '../components/ui/Toast'

function Archived({ type = 'unit' }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [conditionFilter, setConditionFilter] = useState('all')
    const [selectedItems, setSelectedItems] = useState(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const [exportRows, setExportRows] = useState('50')
    const [exporting, setExporting] = useState(false)
    const [restoring, setRestoring] = useState(false)
    const [toasts, setToasts] = useState([])
    const exportDialogState = useDialog()

    const addToast = (message, type = 'success', duration = 3000) => {
        setToasts(prev => {
            const lastId = prev.length ? prev[prev.length - 1].id : 0
            const id = lastId + 1
            return [...prev, { id, message, type, duration }]
        })
    }

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))
    const navigate = useNavigate()

    const formatDateTime = (value) => {
        if (!value) return '—'
        const dt = new Date(value)
        if (Number.isNaN(dt.getTime())) return '—'
        return dt.toLocaleString()
    }

    const archivedLabel = type === 'unit' ? 'system units' : 'monitors'
    const archivedTitle = type === 'unit' ? 'Archived System Units' : 'Archived Monitors'
    const apiListArchived = type === 'unit' ? unitApi.listArchivedUnits : monitorApi.listArchivedMonitors
    const apiRestore = type === 'unit' ? unitApi.restoreFromLog : monitorApi.restoreFromLog

    const statusOptions = ['all', 'active', 'inactive', 'maintenance', 'broken', 'repair']
    const conditionOptions = ['all', 'new', 'good', 'fair', 'poor', 'excellent']

    const exportColumns = useMemo(() => {
        const baseColumns = [
            { header: 'Infocom ID', key: 'id' },
            { header: 'QR Code', key: 'qrCode' },
            { header: 'Device Name', key: 'deviceName' },
            { header: 'Status', key: 'status' },
            { header: 'Condition', key: 'condition' },
            { header: 'Deleted By', key: 'deletedBy' },
            { header: 'Deleted At', key: 'deletedAt' },
        ]

        if (type === 'unit') {
            return [
                ...baseColumns,
                { header: 'Location', key: 'location' },
                { header: 'Model', key: 'modelType' },
                { header: 'Serial', key: 'serialNumber' },
                { header: 'Notes', key: 'notes' },
            ]
        }

        return [
            ...baseColumns,
            { header: 'Linked Unit', key: 'linkedUnit' },
            { header: 'Location', key: 'location' },
            { header: 'Model', key: 'modelType' },
            { header: 'Serial', key: 'serialNumber' },
            { header: 'Notes', key: 'notes' },
        ]
    }, [type])

    const fetchArchived = useCallback(async () => {
        setRefreshing(true)
        try {
            const { data } = await apiListArchived()
            setItems(Array.isArray(data) ? data : [])
            setSelectedItems(new Set())
            setCurrentPage(1)
        } catch {
            setItems([])
            setSelectedItems(new Set())
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [apiListArchived])

    useEffect(() => {
        fetchArchived()
    }, [fetchArchived])

    const filteredItems = useMemo(() => {
        const normalized = searchQuery.trim().toLowerCase()
        return items.filter((item) => {
            const textMatch = !normalized || [
                item.qrCode,
                item.deviceName,
                item.deletedBy,
                item.location,
                item.modelType,
                item.serialNumber,
                item.notes,
                item.status,
                item.condition,
                item.linkedUnit?.deviceName,
                item.linkedUnit?.qrCode,
            ].some((value) => String(value || '').toLowerCase().includes(normalized))

            const statusMatch = statusFilter === 'all' || item.status === statusFilter
            const conditionMatch = conditionFilter === 'all' || item.condition === conditionFilter

            return textMatch && statusMatch && conditionMatch
        })
    }, [items, searchQuery, statusFilter, conditionFilter])

    const itemsPerPage = 10
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
    const pagedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    const selectedCount = selectedItems.size
    const allVisibleSelected = pagedItems.length > 0 && pagedItems.every((item) => selectedItems.has(item.id))

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, statusFilter, conditionFilter])

    const getStatusVariant = (status) => {
        const variants = {
            active: 'success',
            inactive: 'secondary',
            maintenance: 'warning',
            broken: 'destructive',
            repair: 'warning',
        }
        return variants[status] || 'outline'
    }

    const handleToggleItem = (itemId) => {
        const next = new Set(selectedItems)
        if (next.has(itemId)) next.delete(itemId)
        else next.add(itemId)
        setSelectedItems(next)
    }

    const handleToggleAllVisible = () => {
        const next = new Set(selectedItems)
        if (allVisibleSelected) {
            pagedItems.forEach((item) => next.delete(item.id))
        } else {
            pagedItems.forEach((item) => next.add(item.id))
        }
        setSelectedItems(next)
    }

    const restoreItems = async (ids) => {
        if (!ids.length) return

        setRestoring(true)
        try {
            const results = await Promise.allSettled(ids.map((id) => apiRestore(id)))
            const restoredIds = ids.filter((_, index) => results[index].status === 'fulfilled')
            const failedCount = results.filter((result) => result.status === 'rejected').length

            if (restoredIds.length > 0) {
                setItems((prev) => prev.filter((item) => !restoredIds.includes(item.id)))
                setSelectedItems((prev) => {
                    const next = new Set(prev)
                    restoredIds.forEach((id) => next.delete(id))
                    return next
                })
            }

            if (restoredIds.length > 0) {
                addToast(`Restored ${restoredIds.length} ${archivedLabel.slice(0, -1)}${restoredIds.length > 1 ? 's' : ''} successfully`, 'success')
            }
            if (failedCount > 0) {
                addToast(`Failed to restore ${failedCount} item${failedCount > 1 ? 's' : ''}`, 'error')
            }
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to restore archived items', 'error')
        } finally {
            setRestoring(false)
        }
    }

    const handleExport = async () => {
        const count = clampRowCount(exportRows, filteredItems.length)
        const rows = filteredItems.slice(0, count).map((item) => {
            const baseRow = {
                id: formatId(item.id),
                qrCode: item.qrCode || '—',
                deviceName: item.deviceName || '—',
                status: item.status || '—',
                condition: item.condition || '—',
                deletedBy: item.deletedBy || '—',
                deletedAt: formatDateTime(item.deletedAt),
            }

            if (type === 'unit') {
                return {
                    ...baseRow,
                    location: item.location || '—',
                    modelType: item.modelType || '—',
                    serialNumber: item.serialNumber || '—',
                    notes: item.notes || '—',
                }
            }

            return {
                ...baseRow,
                linkedUnit: item.linkedUnit?.deviceName || item.linkedUnit?.qrCode || '—',
                location: item.location || '—',
                modelType: item.modelType || '—',
                serialNumber: item.serialNumber || '—',
                notes: item.notes || '—',
            }
        })

        if (rows.length === 0) {
            addToast('No archived rows to export', 'error')
            return
        }

        setExporting(true)
        try {
            exportToCsv({
                filename: `archived-${type === 'unit' ? 'units' : 'monitors'}.csv`,
                columns: exportColumns,
                rows,
            })
            exportDialogState.onOpenChange(false)
            addToast(`Export successful - ${rows.length} rows exported`, 'success')
        } catch {
            addToast('Failed to export', 'error')
        } finally {
            setExporting(false)
        }
    }

    if (loading) return <FullPageLoader title={`Loading archived ${type === 'unit' ? 'units' : 'monitors'}...`} />

    return (
        <div className="content-full">
            <div className="content-centered">
                <div className="py-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">{archivedTitle}</h1>
                        <p className="text-gray-400">Browse, filter, export, and restore archived {archivedLabel}.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => restoreItems(Array.from(selectedItems))}
                            disabled={selectedCount === 0 || restoring}
                            className="flex items-center gap-2"
                        >
                            <RotateCcw size={16} />
                            Restore Selected{selectedCount > 0 ? ` (${selectedCount})` : ''}
                        </Button>
                        <Dialog open={exportDialogState.open} onOpenChange={exportDialogState.onOpenChange}>
                            <Button variant="secondary" onClick={() => exportDialogState.onOpenChange(true)} className="flex items-center gap-2">
                                <Download size={16} />
                                Export CSV
                            </Button>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Export Archived {type === 'unit' ? 'Units' : 'Monitors'} to CSV</DialogTitle>
                                    <DialogDescription>Select how many rows to export from the filtered archived list.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Rows to export</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="Leave empty to export all"
                                        value={exportRows}
                                        onChange={(e) => setExportRows(e.target.value)}
                                        disabled={exporting}
                                    />
                                    <p className="text-xs text-gray-400">Available rows: {filteredItems.length}. Leave empty to export all.</p>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => exportDialogState.onOpenChange(false)} disabled={exporting}>Cancel</Button>
                                    <Button onClick={handleExport} disabled={exporting || filteredItems.length === 0}>{exporting ? 'Exporting…' : 'Export'}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button onClick={fetchArchived} disabled={refreshing} className="flex items-center gap-2">
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button variant="outline" onClick={() => navigate(type === 'unit' ? '/units' : '/monitors')}>Back to list</Button>
                    </div>
                </div>

                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Search</label>
                        <Input
                            placeholder="Search archived items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={<Search size={18} />}
                        />
                    </div>
                    <div className="w-full lg:w-48">
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>{status === 'all' ? 'All statuses' : capitalize(status)}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="w-full lg:w-48">
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Condition</label>
                        <Select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
                            {conditionOptions.map((condition) => (
                                <option key={condition} value={condition}>{condition === 'all' ? 'All conditions' : capitalize(condition)}</option>
                            ))}
                        </Select>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchQuery('')
                            setStatusFilter('all')
                            setConditionFilter('all')
                        }}
                        disabled={!searchQuery && statusFilter === 'all' && conditionFilter === 'all'}
                    >
                        Clear Filters
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <input
                                            type="checkbox"
                                            checked={allVisibleSelected}
                                            onChange={handleToggleAllVisible}
                                            className="appearance-none w-4 h-4 border-2 border-[#3d2e5c] bg-[#0f0a1a] rounded cursor-pointer checked:bg-lavender-600 checked:border-lavender-600 checked:bg-[length:100%_100%] checked:[background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0id2hpdGUiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTE2LjcwNyA1LjI5M2ExIDEgMCAwIDEgMCAxLjQxNGwtOCA4YTEgMSAwIDAgMS0xLjQxNCAwbC00LTRhMSAxIDAgMCAxIDEuNDE0LTEuNDE0TDggMTIuNTg2bDcuMjkzLTcuMjkzYTEgMSAwIDAgMSAxLjQxNCAweiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] checked:bg-center checked:bg-no-repeat transition-colors"
                                        />
                                    </TableHead>
                                    <TableHead>Device ID</TableHead>
                                    <TableHead>Device</TableHead>
                                    <TableHead>QR Code</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Condition</TableHead>
                                    {type === 'monitor' ? <TableHead>Linked Unit</TableHead> : null}
                                    <TableHead>Deleted By</TableHead>
                                    <TableHead>Deleted At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagedItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={type === 'unit' ? 9 : 10} className="text-center text-gray-400">No archived items found.</TableCell>
                                    </TableRow>
                                ) : (
                                    pagedItems.map((it) => (
                                        <TableRow key={it.id} className="hover:bg-white/5 transition-colors">
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(it.id)}
                                                    onChange={() => handleToggleItem(it.id)}
                                                    className="appearance-none w-4 h-4 border-2 border-[#3d2e5c] bg-[#0f0a1a] rounded cursor-pointer checked:bg-lavender-600 checked:border-lavender-600 checked:bg-[length:100%_100%] checked:[background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0id2hpdGUiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTE2LjcwNyA1LjI5M2ExIDEgMCAwIDEgMCAxLjQxNGwtOCA4YTEgMSAwIDAgMS0xLjQxNCAwbC00LTRhMSAxIDAgMCAxIDEuNDE0LTEuNDE0TDggMTIuNTg2bDcuMjkzLTcuMjkzYTEgMSAwIDAgMSAxLjQxNCAweiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] checked:bg-center checked:bg-no-repeat transition-colors"
                                                />
                                            </TableCell>
                                            <TableCell>{formatId(it.id)}</TableCell>
                                            <TableCell>
                                                <div className="max-w-[240px] truncate text-sm font-medium text-white">
                                                    {it.deviceName || it.item_name || '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-lavender-300">{it.qrCode}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(it.status)}>
                                                    {it.status ? capitalize(it.status.replaceAll('_', ' ')) : '—'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{it.condition || '—'}</TableCell>
                                            {type === 'monitor' ? (
                                                <TableCell>{it.linkedUnit ? `${it.linkedUnit.deviceName || '—'} (${it.linkedUnit.qrCode || '—'})` : '—'}</TableCell>
                                            ) : null}
                                            <TableCell>{it.deletedBy || '—'}</TableCell>
                                            <TableCell>{formatDateTime(it.deletedAt || it.deleted_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="flex items-center gap-2"
                                                    onClick={async () => restoreItems([it.id])}
                                                    disabled={restoring}
                                                >
                                                    <RotateCcw size={14} />
                                                    Restore
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {filteredItems.length > 0 && (
                    <div className="mt-5 flex justify-end">
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            align="end"
                        />
                    </div>
                )}
                <ToastContainer toasts={toasts} onRemove={removeToast} />
            </div>
        </div>
    )
}

export default Archived
