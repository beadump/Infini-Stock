import { Activity, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { activityApi } from '../api'
import { Badge } from '../components/ui/Badge'
import { capitalize } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationLink,
} from '../components/ui/Pagination'

function ActivityLogs() {
    const currentUser = (() => {
        try {
            const raw = localStorage.getItem('user')
            return raw ? JSON.parse(raw) : null
        } catch {
            return null
        }
    })()
    const isAdmin = currentUser?.role === 'admin'

    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filter, setFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data } = await activityApi.listLogs(200)
                setLogs(data)
                setError(null)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
    }, [])

    const normalizedFilter = (filter || '').toLowerCase()
    const filteredLogs = filter
        ? logs.filter((log) => {
            const actionMatch = (log.action || '').toLowerCase().includes(normalizedFilter)
            const assetMatch = (log.assetQrCode || '').toLowerCase().includes(normalizedFilter)
            const nameMatch = isAdmin
                ? (log.userName || '').toLowerCase().includes(normalizedFilter)
                : false
            return actionMatch || assetMatch || nameMatch
        })
        : logs

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [filter])

    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    )
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

    const getActionVariant = (action) => {
        const variants = {
            move: 'info',
            update: 'warning',
            repair: 'warning',
            swap: 'secondary',
        }
        return variants[action] || 'secondary'
    }

    return (
        <div className="content-full bg-[#171717]">
            <div className="content-centered">
                <div className="py-8">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
                        <Activity className="text-gray-300" size={36} />
                        Activity Logs
                    </h1>
                    <p className="text-gray-400">
                        {isAdmin
                            ? 'Search and filter all asset movements and changes'
                            : 'Search and filter your asset movements and changes'}
                    </p>
                </div>

                <div className="mb-6">
                    <Input
                        placeholder="Search by action or QR code..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full"
                        icon={<Search size={18} />}
                    />
                </div>

                <div className="rounded-xl border border-[#3d2e5c] bg-[#0f0a1a] overflow-hidden mb-8">
                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="inline-block animate-spin">
                                <Activity className="text-gray-300" size={24} />
                            </div>
                            <p className="text-gray-400 mt-2">Loading logs...</p>
                        </div>
                    ) : error ? (
                        <div className="m-6 rounded-lg border border-red-500/30 bg-red-600/20 p-6 text-red-300">
                            ⚠️ Error: {error}
                        </div>
                    ) : filteredLogs.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Action</TableHead>
                                    {isAdmin ? <TableHead>Name</TableHead> : null}
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Old Value</TableHead>
                                    <TableHead>New Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-xs text-gray-400">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getActionVariant(log.action)}>
                                                {capitalize(log.action)}
                                            </Badge>
                                        </TableCell>
                                        {isAdmin ? (
                                            <TableCell className="text-gray-200 text-sm">
                                                {log.userName || '—'}
                                            </TableCell>
                                        ) : null}
                                        <TableCell>
                                            <code className="text-xs bg-gray-900 text-white px-2 py-1 rounded font-mono">
                                                {log.assetQrCode?.slice(0, 16)}
                                                {log.assetQrCode?.length > 16 && '...'}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-xs max-w-xs truncate">
                                            {log.oldStatus || log.oldLocation ? log.oldStatus || log.oldLocation : '—'}
                                        </TableCell>
                                        <TableCell className="text-gray-300 text-xs max-w-xs truncate">
                                            {log.newStatus || log.newLocation ? log.newStatus || log.newLocation : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-12 text-center">
                            <Activity className="text-gray-600 mx-auto mb-3" size={40} />
                            <p className="text-gray-400">
                                {filter ? 'No logs found matching your search' : 'No activity logs yet'}
                            </p>
                        </div>
                    )}
                </div>

                {filteredLogs.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-400">
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                        {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of{' '}
                                        {filteredLogs.length} logs
                                    </p>
                                </div>

                                {totalPages > 1 && (
                                    <Pagination>
                                        <PaginationContent className="gap-2">
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() =>
                                                        setCurrentPage((prev) =>
                                                            prev > 1 ? prev - 1 : 1,
                                                        )
                                                    }
                                                    disabled={currentPage === 1}
                                                />
                                            </PaginationItem>

                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(
                                                    (page) =>
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        (page >= currentPage - 1 &&
                                                            page <= currentPage + 1),
                                                )
                                                .map((page, index, arr) => (
                                                    <div key={page}>
                                                        {index > 0 && arr[index - 1] !== page - 1 && (
                                                            <PaginationItem>
                                                                <span className="text-gray-500">
                                                                    ...
                                                                </span>
                                                            </PaginationItem>
                                                        )}
                                                        <PaginationItem>
                                                            <PaginationLink
                                                                isActive={page === currentPage}
                                                                onClick={() =>
                                                                    setCurrentPage(page)
                                                                }
                                                            >
                                                                {page}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    </div>
                                                ))}

                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() =>
                                                        setCurrentPage((prev) =>
                                                            prev < totalPages
                                                                ? prev + 1
                                                                : totalPages,
                                                        )
                                                    }
                                                    disabled={currentPage === totalPages}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default ActivityLogs
