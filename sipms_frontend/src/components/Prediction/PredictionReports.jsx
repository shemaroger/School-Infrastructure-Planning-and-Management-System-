import { useState, useEffect, useRef } from "react";
import {
    Eye,
    Plus,
    Search,
    Filter,
    FileText,
    Calendar,
    MapPin,
    Loader,
    X,
    Check,
    MoreVertical,
    Pen,
    AlertCircle,
    Download,
    User,
    ExternalLink
} from "lucide-react";
import { predictionReportService } from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PredictionReports() {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const result = await predictionReportService.getAll();
            if (result.success) {
                setReports(result.data);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error("Error loading prediction reports");
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (report) => {
        setSelectedReport(report);
        setShowDetailModal(true);
        setOpenDropdownId(null);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedReport(null);
    };

    const toggleDropdown = (reportId) => {
        setOpenDropdownId(openDropdownId === reportId ? null : reportId);
    };
    const handleOpen = (report) => {
        if (report.document_url) {
            window.open(report.document_url, '_blank');
            toast.success('Document opened in a new tab');
        } else {
            toast.error('Document URL not available');
        }
    };

    const handleDownload = (report) => {
        if (report.document_url) {
            const link = document.createElement('a');
            link.href = report.document_url;
            link.download = `report_${report.location}_${report.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Download started');
        } else {
            toast.error('Document URL not available');
        }
    };


    const handleSendToMineduc = async (report) => {
        try {
            const result = await predictionReportService.sendToMineduc(report.id);
            if (result.success) {
                setReports((prev) =>
                    prev.map((r) =>
                        r.id === report.id ? { ...r, is_sent_to_mineduc: true } : r
                    )
                );
                toast.success('Report sent to MINEDUC');
            } else {
                toast.error(result.message || 'Failed to send report');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error sending report to MINEDUC');
        }
    };


    const filteredReports = reports.filter(
        (item) =>
            item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.month?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Prediction Reports
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Manage uploaded prediction reports
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by month or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700">
                            <Filter className="w-5 h-5" />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Created By
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        MINEDUC
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600 mb-4"></div>
                                                <p className="text-gray-600 font-medium">
                                                    Loading reports...
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-gray-100 p-6 rounded-full mb-4">
                                                    <FileText className="w-12 h-12 text-gray-400" />
                                                </div>
                                                <p className="text-gray-600 font-medium text-lg">
                                                    No reports found
                                                </p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    Try adjusting your search criteria
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report, index) => (
                                        <tr
                                            key={report.id}
                                            className="hover:bg-blue-50/50 transition"
                                        >
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                {index + 1}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm text-gray-900">
                                                        {report.created_by_name}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {report.location}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <button
                                                    onClick={() => handleSendToMineduc(report)}
                                                    disabled={report.is_sent_to_mineduc}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 rounded-xl transition
                                                    ${report.is_sent_to_mineduc ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'hover:bg-yellow-50 text-yellow-700'}`}
                                                >
                                                    <ExternalLink className="w-4 h-4 text-yellow-600" />
                                                    {report.is_sent_to_mineduc ? 'Sent to MINEDUC' : 'Send to MINEDUC'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 relative">
                                                <button
                                                    onClick={() => toggleDropdown(report.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </button>



                                                {openDropdownId === report.id && (
                                                    <div
                                                        className="absolute right-8 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-slideDown"
                                                    >
                                                        <button
                                                            onClick={() => handleViewDetails(report)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3"
                                                        >
                                                            <Eye className="w-4 h-4 text-blue-600" />
                                                            View Details
                                                        </button>

                                                        <button
                                                            onClick={() => handleOpen(report)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-3"
                                                        >
                                                            <ExternalLink className="w-4 h-4 text-indigo-600" />
                                                            Open
                                                        </button>

                                                        <button
                                                            onClick={() => handleDownload(report)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-3"
                                                        >
                                                            <Download className="w-4 h-4 text-green-600" />
                                                            Download
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showDetailModal && selectedReport && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
                        <div className="sticky top-0 bg-blue-900 px-8 py-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">
                                        Prediction Report Details
                                    </h2>
                                    <p className="text-blue-100 mt-1">Uploaded document information</p>
                                </div>
                                <button
                                    onClick={handleCloseDetailModal}
                                    className="text-white/80 hover:text-white transition"
                                >
                                    <X className="w-7 h-7" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-gray-500 font-semibold text-sm">Created By</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {selectedReport.created_by_name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 font-semibold text-sm">Location</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {selectedReport.location}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 font-semibold text-sm">
                                        Uploaded On
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {new Date(selectedReport.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 font-semibold text-sm">
                                        File Available
                                    </p>
                                    <p
                                        className={`text-lg font-bold ${selectedReport.document_url
                                            ? "text-green-600"
                                            : "text-red-600"
                                            }`}
                                    >
                                        {selectedReport.document_url ? "Yes" : "No"}
                                    </p>
                                </div>
                            </div>

                            {selectedReport.document_url && (
                                <button
                                    onClick={() => handleDownload(selectedReport)}
                                    className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                                >
                                    <Download className="w-5 h-5" />
                                    Download File
                                </button>
                            )}
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-end">
                            <button
                                onClick={handleCloseDetailModal}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
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
