import { useState, useEffect } from 'react';
import {
    Eye,
    Search,
    Filter,
    Activity,
    User,
    Calendar,
    FileText,
    ChevronDown,
    X
} from "lucide-react";
import { actionLogService } from '../../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ActionLogs() {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage] = useState(10);

    const ACTION_CHOICES = [
        { value: 'CREATE', label: 'Create', color: 'bg-green-100 text-green-800 border-green-200' },
        { value: 'UPDATE', label: 'Update', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        { value: 'DELETE', label: 'Delete', color: 'bg-red-100 text-red-800 border-red-200' },
        { value: 'SEND', label: 'Send', color: 'bg-purple-100 text-purple-800 border-purple-200' },
        { value: 'APPROVE', label: 'Approve', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        { value: 'DENY', label: 'Deny', color: 'bg-orange-100 text-orange-800 border-orange-200' },
        { value: 'UPLOAD', label: 'Upload', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
        { value: 'OTHER', label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    ];

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const result = await actionLogService.getAllactionLogs();
            if (result.success) {
                setLogs(result.data);
            }
        } catch (error) {
            toast.error("Error fetching action logs");
            console.error('Error fetching logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getActionBadgeColor = (action) => {
        const actionConfig = ACTION_CHOICES.find(a => a.value === action);
        return actionConfig?.color || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getActionLabel = (action) => {
        const actionConfig = ACTION_CHOICES.find(a => a.value === action);
        return actionConfig?.label || action;
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleViewDetails = (log) => {
        setSelectedLog(log);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedLog(null);
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = !actionFilter || log.action === actionFilter;

        return matchesSearch && matchesAction;
    });

    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const Pagination = ({ totalPages, currentPage, paginate }) => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                    Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
                </p>
                <div className="flex gap-1">
                    <button
                        className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => paginate(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        &lt;
                    </button>

                    {startPage > 1 && (
                        <>
                            <button
                                onClick={() => paginate(1)}
                                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100"
                            >
                                1
                            </button>
                            {startPage > 2 && <span className="px-2 py-1">...</span>}
                        </>
                    )}

                    {pageNumbers.map((number) => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 rounded-lg border ${currentPage === number
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            {number}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="px-2 py-1">...</span>}
                            <button
                                onClick={() => paginate(totalPages)}
                                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        &gt;
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Action Logs
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Track all system activities and changes
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-medium">
                                Total: {filteredLogs.length} logs
                            </span>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by user, model name, action..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3 border rounded-xl transition-colors font-medium ${showFilters || actionFilter
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <Filter className="w-5 h-5" />
                            <span>Filters</span>
                            {actionFilter && (
                                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">1</span>
                            )}
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex flex-wrap gap-4 items-center">
                                <span className="text-sm font-medium text-gray-700">Action Type:</span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => { setActionFilter(''); setCurrentPage(1); }}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!actionFilter
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {ACTION_CHOICES.map((action) => (
                                        <button
                                            key={action.value}
                                            onClick={() => { setActionFilter(action.value); setCurrentPage(1); }}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${actionFilter === action.value
                                                ? 'bg-gray-900 text-white'
                                                : `${action.color} hover:opacity-80`
                                                }`}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                                {actionFilter && (
                                    <button
                                        onClick={() => { setActionFilter(''); setCurrentPage(1); }}
                                        className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Model</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Object ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Timestamp</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                                <p className="text-gray-600 font-medium">Loading action logs...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <Activity className="w-12 h-12 text-gray-300 mb-4" />
                                                <p className="text-gray-600 font-medium text-lg">No action logs found</p>
                                                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentLogs.map((log, index) => (
                                        <tr key={log.id} className="hover:bg-blue-50/50 transition-colors text-sm">
                                            <td className="px-6 py-3 text-gray-500">{indexOfFirstLog + index + 1}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {log.user ? `${log.user.first_name || ''} ${log.user.last_name || ''}`.trim() || log.user.username : 'Unkown'}
                                                        </p>
                                                        {log.user?.email && (
                                                            <p className="text-xs text-gray-500">{log.user.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getActionBadgeColor(log.action)}`}>
                                                    {getActionLabel(log.action)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-700">{log.model_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-gray-600 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {log.object_id || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {formatTimestamp(log.timestamp)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <button
                                                    onClick={() => handleViewDetails(log)}
                                                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {totalPages > 1 && (
                    <Pagination totalPages={totalPages} currentPage={currentPage} paginate={paginate} />
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedLog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-2xl text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Log Details</h2>
                                <p className="text-blue-100 text-sm mt-1">Action Log #{selectedLog.id}</p>
                            </div>
                            <button
                                onClick={handleCloseDetailModal}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8">
                            {/* User Info */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">User Information</h3>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    {selectedLog.user ? (
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {`${selectedLog.user.first_name || ''} ${selectedLog.user.last_name || ''}`.trim() || selectedLog.user.username}
                                                </p>
                                                <p className="text-sm text-gray-500">{selectedLog.user.email}</p>
                                                <p className="text-xs text-gray-400">@{selectedLog.user.username}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">System Action</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Details */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Action Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 mb-1">Action Type</p>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getActionBadgeColor(selectedLog.action)}`}>
                                            {getActionLabel(selectedLog.action)}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 mb-1">Model Name</p>
                                        <p className="font-medium text-gray-900">{selectedLog.model_name}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 mb-1">Object ID</p>
                                        <p className="font-mono text-gray-900">{selectedLog.object_id || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                                        <p className="font-medium text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Details JSON */}
                            {selectedLog.details && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Additional Details</h3>
                                    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                                        <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                                            {JSON.stringify(selectedLog.details, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 flex justify-end rounded-b-2xl border-t border-gray-100">
                            <button
                                onClick={handleCloseDetailModal}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}