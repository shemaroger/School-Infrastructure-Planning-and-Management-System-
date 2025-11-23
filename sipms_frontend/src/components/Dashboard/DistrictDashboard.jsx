import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Bell, CheckCircle, AlertCircle, FileText, DollarSign } from 'lucide-react';
import { predictionService, schoolService, notificationService } from '../../api';

const DistrictDashboard = () => {
    const [predictions, setPredictions] = useState([]);
    const [schools, setSchools] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const predRes = await predictionService.getAllPredictions();
                setPredictions(predRes.data || predRes);

                const schoolRes = await schoolService.getAllSchools();
                if (schoolRes.success) setSchools(schoolRes.data);

                const notifRes = await notificationService.getAllNotifications();
                setNotifications(notifRes.data || notifRes);

            } catch (error) {
                console.error('Error loading district data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const pendingApprovals = predictions.filter(p => !p.approved_by_district);
    const totalBudgetRequest = predictions.reduce((sum, p) => sum + parseFloat(p.estimated_budget || 0), 0);

    const approvalStatusData = [
        { name: 'Approved', value: predictions.filter(p => p.approved_by_district).length },
        { name: 'Pending', value: pendingApprovals.length },
    ];

    const budgetBySchoolData = predictions
        .slice(0, 7)
        .map(p => ({
            name: `School ${p.school}`,
            budget: parseFloat(p.estimated_budget)
        }));

    const COLORS = ['#10B981', '#F59E0B'];

    const formatCurrency = (val) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(val);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading District Panel...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">District Oversight</h1>
                    <p className="text-gray-500">Infrastructure Planning & Approvals</p>
                </div>
                <div className="relative p-2 bg-white rounded-full shadow-sm border border-gray-200">
                    <Bell className="text-gray-600" size={20} />
                    {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center border-l-4 border-l-yellow-500">
                    <div className="p-3 bg-yellow-50 rounded-full text-yellow-600 mr-4">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Pending Approvals</p>
                        <h3 className="text-2xl font-bold text-gray-800">{pendingApprovals.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center border-l-4 border-l-blue-500">
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600 mr-4">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Budget Requested</p>
                        <h3 className="text-xl font-bold text-gray-800">
                            {(totalBudgetRequest / 1000000).toFixed(1)}M <span className="text-xs text-gray-400">RWF</span>
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center border-l-4 border-l-purple-500">
                    <div className="p-3 bg-purple-50 rounded-full text-purple-600 mr-4">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Applications</p>
                        <h3 className="text-2xl font-bold text-gray-800">{predictions.length}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-6">Budget Requests by School</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetBySchoolData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `${val / 1000000}M`} />
                                <Tooltip formatter={(val) => formatCurrency(val)} />
                                <Bar dataKey="budget" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-2">Approval Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={approvalStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {approvalStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-sm text-gray-500">
                            <span className="font-bold text-gray-800">{Math.round((predictions.filter(p => p.approved_by_district).length / predictions.length) * 100) || 0}%</span> of requests approved
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Requests Awaiting Approval</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                                <tr>
                                    <th className="p-4">School</th>
                                    <th className="p-4">Rooms Needed</th>
                                    <th className="p-4">Budget (RWF)</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingApprovals.slice(0, 5).map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="p-4 font-medium">{item.school?.name || "Unknown School"}</td>
                                        <td className="p-4">{item.rooms_to_build}</td>
                                        <td className="p-4 font-mono">{formatCurrency(item.estimated_budget)}</td>
                                        <td className="p-4 text-center">
                                            <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700 transition">
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {pendingApprovals.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-400">All requests have been processed.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold flex items-center">
                            <Bell size={18} className="mr-2" /> Recent Notifications
                        </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-4">
                        {notifications.length > 0 ? notifications.map((notif, idx) => (
                            <div key={idx} className="mb-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <p className="text-sm font-medium text-gray-800">{notif.title || "System Notification"}</p>
                                <p className="text-xs text-gray-500 mt-1">{notif.message || "No details provided."}</p>
                                <span className="text-[10px] text-gray-400 mt-2 block">
                                    {new Date(notif.created_at || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-400 text-sm">No new notifications</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DistrictDashboard;