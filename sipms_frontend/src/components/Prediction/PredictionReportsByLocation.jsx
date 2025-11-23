import { useState, useEffect, useRef } from "react";
import {
    Eye,
    Search,
    Filter,
    FileText,
    Calendar,
    MapPin,
    Loader,
    X,
    Download,
    User,
    ExternalLink,
    MoreVertical,
    FileCheck,
    Check
} from "lucide-react";
import { predictionReportService } from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MineducReports() {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const result = await predictionReportService.getAll();
            if (result.success) {
                setReports(result.data);
            }
        } catch (error) {
            toast.error("Error loading MINEDUC reports");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedReport(null);
    };

    const handleApprove = async (report) => {
        const res = await predictionReportService.approve(report.id);
        if (res.success) {
            toast.success("Report approved successfully");
            fetchReports();
        }
    };

    const handleReject = async (report) => {
        const res = await predictionReportService.reject(report.id);
        if (res.success) {
            toast.error("Report rejected");
            fetchReports();
        }
    };

    const handleDownload = (report) => {
        if (!report.document_url) {
            toast.error("No document found");
            return;
        }
        const link = document.createElement("a");
        link.href = report.document_url;
        link.download = `mineduc_report_${report.location}_${report.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const filteredReports = reports.filter(
        (item) =>
            item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.month?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                MINEDUC Reports
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Reports sent to MINEDUC
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
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

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Created By</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Location</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Created</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Decision</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600 mb-4"></div>
                                                <p className="text-gray-600 font-medium">Loading reports...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-gray-100 p-6 rounded-full mb-4">
                                                    <FileText className="w-12 h-12 text-gray-400" />
                                                </div>
                                                <p className="text-gray-600 font-medium text-lg">No reports found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report, index) => (
                                        <tr key={report.id} className="hover:bg-blue-50/50 transition">
                                            <td className="px-6 py-4">{index + 1}</td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                    {report.created_by_name}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    {report.location}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </td>

                                            {/* ✅ STATUS — APPROVED / REJECTED / PENDING */}
                                            <td className="px-6 py-4">
                                                {report.status === "approved" ? (
                                                    <span className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-full">
                                                        ✓ Approved
                                                    </span>
                                                ) : report.status === "Rejected" ? (
                                                    <span className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-full">
                                                        ✕ Rejected
                                                    </span>
                                                ) : (
                                                    <div className="flex gap-4 items-center">
                                                        <button
                                                            onClick={() => handleApprove(report)}
                                                            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 transition"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            Approve
                                                        </button>

                                                        <button
                                                            onClick={() => handleReject(report)}
                                                            className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-700 rounded-lg hover:bg-red-50 transition"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 relative">
                                                <button
                                                    onClick={() => setOpenDropdownId(report.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </button>

                                                {openDropdownId === report.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-8 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                                                    >
                                                        <button
                                                            onClick={() => handleDownload(report)}
                                                            className="w-full px-4 py-2 hover:bg-green-50 flex gap-3"
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

            {/* MODAL */}
            {showDetailModal && selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-y-auto">
                        <div className="bg-blue-900 px-8 py-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-bold text-white">
                                    MINEDUC Report Details
                                </h2>
                                <button onClick={handleCloseDetailModal}>
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-gray-500 font-semibold">Created By</p>
                                    <p className="text-lg font-bold">{selectedReport.created_by_name}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 font-semibold">Location</p>
                                    <p className="text-lg font-bold">{selectedReport.location}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 font-semibold">Uploaded</p>
                                    <p className="text-lg font-bold">
                                        {new Date(selectedReport.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {selectedReport.document_url && (
                                <button
                                    onClick={() => handleDownload(selectedReport)}
                                    className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl"
                                >
                                    <Download className="w-5 h-5" />
                                    Download File
                                </button>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t flex justify-end">
                            <button
                                onClick={handleCloseDetailModal}
                                className="px-6 py-3 bg-gray-200 rounded-xl hover:bg-gray-300"
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
