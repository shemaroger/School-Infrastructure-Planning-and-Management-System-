import { useState, useEffect } from 'react';
import { Eye, TrendingUp, Building2, Users, Home, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { predictionService, getCurrentUser } from '../../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SchoolPredictions() {
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [schoolData, setSchoolData] = useState(null);

    useEffect(() => {
        const userData = getCurrentUser();
        setSchoolData(userData.school);
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {
        setIsLoading(true);
        try {
            const userData = getCurrentUser();
            const schoolId = userData.school.id;

            const result = await predictionService.getAllPredictions();
            if (result.success) {
                const filteredPredictions = result.data.filter(
                    prediction => prediction.school?.id === schoolId
                );

                const enhancedData = filteredPredictions.map(pred => {
                    const existing = pred.school?.number_of_rooms || 0;
                    const required = pred.required_rooms || 0;
                    const students = pred.school?.student_population || 0;
                    let detail = '';
                    let remaining_students = 0;
                    let status = 'neutral';

                    if (existing > required) {
                        const remainingRooms = existing - required;
                        remaining_students = remainingRooms * 35;
                        detail = `Your school has extra ${remainingRooms} room(s). The remaining rooms can fit approximately ${remaining_students} more students.`;
                        status = 'surplus';
                    } else if (existing === required) {
                        detail = `Your school has just enough rooms for all ${students} students.`;
                        remaining_students = 0;
                        status = 'optimal';
                    } else {
                        const deficit = required - existing;
                        detail = `Your school needs ${deficit} more room(s) to fit all ${students} students.`;
                        remaining_students = 0;
                        status = 'deficit';
                    }

                    return { ...pred, detail, remaining_students, status };
                });

                setPredictions(enhancedData);
            }
        } catch (error) {
            console.error("Error fetching predictions:", error);
            toast.error("Error loading predictions");
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (prediction) => {
        setSelectedPrediction(prediction);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedPrediction(null);
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
            case 'surplus': return 'Surplus Capacity';
            case 'optimal': return 'Optimal Capacity';
            case 'deficit': return 'Needs More Rooms';
            default: return 'Unknown';
        }
    };

    const stats = {
        totalPredictions: predictions.length,
        totalRoomsNeeded: predictions.reduce((sum, p) => sum + (p.rooms_to_build || 0), 0),
        deficit: predictions.filter(p => p.status === 'deficit').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="border border-blue-600 rounded-2xl p-4 shadow-lg">
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">School Predictions</h1>
                            <p className="text-gray-600 mt-1">
                                Capacity predictions for {schoolData?.name || 'your school'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                                    <Home className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Action Required</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.deficit}</p>
                                </div>
                                <div className="bg-red-100 rounded-full p-4">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Required Rooms</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rooms to Build</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estimated Budget</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                                <p className="text-gray-600 font-medium">Loading predictions...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : predictions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-gray-100 rounded-full p-6 mb-4">
                                                    <TrendingUp className="w-12 h-12 text-gray-400" />
                                                </div>
                                                <p className="text-gray-600 font-medium text-lg">No predictions found</p>
                                                <p className="text-gray-400 text-sm mt-1">Predictions will appear here when created</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    predictions.map((prediction, index) => (
                                        <tr key={prediction.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
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
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{prediction.estimated_budget.toLocaleString()} RWF</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>{new Date(prediction.created_at).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleViewDetails(prediction)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium text-sm"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showDetailModal && selectedPrediction && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">Prediction Details</h2>
                                    <p className="text-blue-100 mt-1">Complete capacity analysis</p>
                                </div>
                                <button
                                    onClick={handleCloseDetailModal}
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
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

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}