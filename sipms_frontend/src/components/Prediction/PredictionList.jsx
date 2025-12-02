import { useState, useEffect } from 'react';
import { Eye, Send, Plus, Search, Filter, TrendingUp, Building2, Users, DollarSign } from "lucide-react";
import { predictionService, getCurrentUser, notificationService } from '../../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PredictionManagement() {
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const userdata = getCurrentUser();

    const [currentPage, setCurrentPage] = useState(1);
    const schoolsPerPage = 2;

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {
        setIsLoading(true);
        try {
            const result = await predictionService.getAllPredictions();
            if (result.success) {
                let data = result.data;
                const user = getCurrentUser();
                if (user?.role?.toLowerCase() === "umurenge") {
                    data = data.filter(
                        (prediction) => prediction.created_by?.role?.toLowerCase() === "umurenge"
                    );
                }

                const enhancedData = data.map(pred => {
                    const existing = pred.school?.number_of_rooms || 0;
                    const required = pred.required_rooms || 0;
                    const students = pred.school?.student_population || 0;
                    let detail = '';
                    let remaining_students = 0;
                    let status = 'neutral';

                    if (existing > required) {
                        const remainingRooms = existing - required;
                        remaining_students = remainingRooms * 35;
                        detail = `School has extra ${remainingRooms} room(s). The remaining rooms can fit approximately ${remaining_students} more students.`;
                        status = 'surplus';
                    } else if (existing === required) {
                        detail = `School has just enough rooms for all ${students} students.`;
                        remaining_students = 0;
                        status = 'optimal';
                    } else {
                        const deficit = required - existing;
                        detail = `School needs ${deficit} more room(s) to fit all ${students} students.`;
                        remaining_students = 0;
                        status = 'deficit';
                    }

                    return { ...pred, detail, remaining_students, status };
                });

                setPredictions(enhancedData);
            }
        } catch (error) {
            console.error("Error fetching predictions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Statistics calculations
    const stats = {
        totalPredictions: predictions.length,
        totalRoomsNeeded: predictions.reduce((sum, p) => sum + (p.rooms_to_build || 0), 0),
        totalBudget: predictions.reduce((sum, p) => sum + (p.estimated_budget || 0), 0),
        totalStudents: predictions.reduce((sum, p) => sum + (p.school?.student_population || 0), 0),
    };

    // Filter predictions by search
    const filteredPredictions = predictions.filter(pred =>
        pred.school?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pred.created_by?.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const indexOfLastSchool = currentPage * schoolsPerPage;
    const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
    const currentPredictions = filteredPredictions.slice(indexOfFirstSchool, indexOfLastSchool);
    const totalPages = Math.ceil(filteredPredictions.length / schoolsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // ----- Detail Modal -----
    const handleOpenDetailModal = (prediction) => {
        setSelectedPrediction(prediction);
        setShowDetailModal(true);
    };
    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedPrediction(null);
    };

    // ----- Notification Modal -----
    const handleOpenNotificationModal = () => {
        setNotificationMessage('');
        setShowNotificationModal(true);
    };
    const handleCloseNotificationModal = () => {
        setShowNotificationModal(false);
    };

    const sendNotificationToDistrict = async () => {
        if (!notificationMessage.trim()) {
            toast.error("Please enter a message before sending");
            return;
        }
        setIsLoading(true);
        try {
            const payload = {
                role: "DISTRICT",
                message: notificationMessage,
                sender: userdata.role
            };
            const response = await notificationService.sendNotification(payload);
            if (response.success) {
                toast.success("Notification sent to Districts successfully");
                setShowNotificationModal(false);
            } else {
                toast.error("Failed to send notification");
            }
        } catch (error) {
            console.error("Error sending notification:", error);
            toast.error("Error sending notification");
        } finally {
            setIsLoading(false);
        }
    };


    const Pagination = ({ totalPages, currentPage, paginate }) => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-end mt-4 gap-1">
                <button
                    className="px-3 py-1 rounded-lg border border-gray-300 mr-2 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => paginate(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-lg border ${currentPage === number ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}
                    >
                        {number}
                    </button>
                ))}
                <button
                    className="px-3 py-1 rounded-lg border border-gray-300 ml-2 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </button>
            </div>
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'surplus': return 'bg-green-100 text-green-800 border-green-200';
            case 'optimal': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'deficit': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'surplus': return 'Surplus';
            case 'optimal': return 'Optimal';
            case 'deficit': return 'Deficit';
            default: return 'Unknown';
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Prediction Management
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Monitor and manage school capacity predictions
                            </p>
                        </div>
                        {(userdata?.role === "ADMIN" || userdata?.role === "UMURENGE") && (
                            <div className="flex gap-3">
                                <a
                                    href="/main/predictions/add"
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>New Prediction</span>
                                </a>

                                <button
                                    onClick={handleOpenNotificationModal}
                                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                                    disabled={isLoading}
                                >
                                    <Send className="w-5 h-5" />
                                    <span>Notify Districts</span>
                                </button>
                            </div>
                        )}
                        {userdata?.role === "DISTRICT" && (
                            <div className="flex gap-3">
                                <a
                                    href="/main/predictions/district/add"
                                    className="bg-gradient-to-r from-green-900 to-green-900 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>New Predictions</span>
                                </a>
                                <a
                                    href="/main/notification/send"
                                    className="bg-gradient-to-r from-green-900 to-green-900 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <Send className="w-5 h-5" />
                                    <span>Send Notification</span>
                                </a>
                            </div>
                        )}

                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Predictions</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalPredictions}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-4">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Rooms Needed</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalRoomsNeeded}</p>
                            </div>
                            <div className="bg-purple-100 rounded-full p-4">
                                <Building2 className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-4">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>


                </div>

                <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by school name or role..."
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
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">School</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created By</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Required Rooms</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">To Build</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Budget</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                                <p className="text-gray-600 font-medium">Loading predictions...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentPredictions.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-gray-100 rounded-full p-6 mb-4">
                                                    <TrendingUp className="w-12 h-12 text-gray-400" />
                                                </div>
                                                <p className="text-gray-600 font-medium text-lg">No predictions found</p>
                                                <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentPredictions.map((prediction, index) => (
                                        <tr key={prediction.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{prediction.school?.name || '-'}</p>
                                                    <p className="text-xs text-gray-500">{prediction.school?.student_population || 0} students</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                    {prediction.created_by?.role || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(prediction.status)}`}>
                                                    {getStatusText(prediction.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{prediction.required_rooms}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-blue-100 text-blue-700">
                                                    {prediction.rooms_to_build}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{prediction.estimated_budget.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleOpenDetailModal(prediction)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium text-sm"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>View</span>
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

            {showDetailModal && selectedPrediction && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">Prediction Details</h2>
                                    <p className="text-gray-600 mt-1">Comprehensive prediction analysis</p>
                                </div>
                                <button
                                    onClick={handleCloseDetailModal}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className={`rounded-xl p-5 mb-6 border-l-4 ${selectedPrediction.status === 'surplus' ? 'bg-green-50 border-green-500' :
                                selectedPrediction.status === 'optimal' ? 'bg-blue-50 border-blue-500' :
                                    'bg-red-50 border-red-500'
                                }`}>
                                <div className="flex items-start gap-3">
                                    <div className={`rounded-full p-2 ${selectedPrediction.status === 'surplus' ? 'bg-green-100' :
                                        selectedPrediction.status === 'optimal' ? 'bg-blue-100' :
                                            'bg-red-100'
                                        }`}>
                                        <TrendingUp className={`w-5 h-5 ${selectedPrediction.status === 'surplus' ? 'text-green-600' :
                                            selectedPrediction.status === 'optimal' ? 'text-blue-600' :
                                                'text-red-600'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-semibold mb-1 ${selectedPrediction.status === 'surplus' ? 'text-green-900' :
                                            selectedPrediction.status === 'optimal' ? 'text-blue-900' :
                                                'text-red-900'
                                            }`}>Status: {getStatusText(selectedPrediction.status)}</h3>
                                        <p className={`text-sm ${selectedPrediction.status === 'surplus' ? 'text-green-800' :
                                            selectedPrediction.status === 'optimal' ? 'text-blue-800' :
                                                'text-red-800'
                                            }`}>{selectedPrediction.detail}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                        School Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">School Name</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedPrediction.school?.name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Student Population</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedPrediction.school?.student_population || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Current Rooms</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedPrediction.school?.number_of_rooms || 0}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-purple-600" />
                                        Prediction Data
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Required Rooms</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedPrediction.required_rooms}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Rooms to Build</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedPrediction.rooms_to_build}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Additional Capacity</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedPrediction.remaining_students} students</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-6 border border-yellow-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-yellow-600" />
                                    Budget Estimate
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold text-gray-900">{selectedPrediction.estimated_budget.toLocaleString()}</p>
                                    <p className="text-gray-600 font-medium">RWF</p>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 rounded-b-2xl flex justify-end">
                            <button
                                onClick={handleCloseDetailModal}
                                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showNotificationModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slideUp">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Send className="w-6 h-6" />
                                    Send Notification
                                </h2>
                                <button
                                    onClick={handleCloseNotificationModal}
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-green-100 mt-2">Notify all district administrators</p>
                        </div>

                        <div className="p-8">
                            <textarea
                                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none transition-all"
                                rows={6}
                                placeholder="Write your notification message here..."
                                value={notificationMessage}
                                onChange={(e) => setNotificationMessage(e.target.value)}
                            />
                        </div>

                        <div className="bg-gray-50 px-8 py-4 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={handleCloseNotificationModal}
                                className="bg-white hover:bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors border border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendNotificationToDistrict}
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send Notification'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}