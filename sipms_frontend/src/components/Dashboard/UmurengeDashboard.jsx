import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Users, Building, ClipboardCheck, MapPin } from 'lucide-react';
import { schoolService, userService, predictionService, getCurrentUser } from '../../api';
import { USER_ROLES } from '../../constants/roles';


const UmurengeDashboard = () => {
    const [schools, setSchools] = useState([]);
    const [users, setUsers] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    const loggedUser = getCurrentUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const predRes = await predictionService.getAllPredictions();
                let allPredictions = predRes.data || predRes;

                const schoolRes = await schoolService.getAllSchools();
                let allSchools = [];
                if (schoolRes.success) {
                    allSchools = schoolRes.data;

                    if (loggedUser.sector) {
                        allSchools = allSchools.filter(s =>
                            s.location && s.location.toLowerCase().includes(loggedUser.sector.toLowerCase())
                        );
                    }
                    setSchools(allSchools);
                }

                const sectorSchoolIds = allSchools.map(s => s.id);
                const sectorPredictions = allPredictions.filter(p => {
                    const pSchoolId = typeof p.school === 'object' ? p.school.id : p.school;
                    return sectorSchoolIds.includes(pSchoolId);
                });
                setPredictions(sectorPredictions);

                const result = await userService.list();
                if (result.success) {
                    let filtered = result.data;

                    if (loggedUser?.role === "UMURENGE") {
                        filtered = filtered.filter(
                            (u) => u.role === USER_ROLES.SCHOOL
                        );
                    }
                    setUsers(filtered);
                }

            } catch (error) {
                console.error('Error loading Umurenge data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const budgetData = predictions.map(p => ({
        name: p.school?.name || `School ${p.school}`,
        budget: parseFloat(p.estimated_budget)
    }));

    const statusData = [
        { name: 'Pending Sector', value: predictions.filter(p => !p.approved_by_district).length },
        { name: 'Approved', value: predictions.filter(p => p.approved_by_district).length },
    ];

    const COLORS = ['#FFBB28', '#00C49F'];

    const formatCurrency = (val) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(val);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading Sector Data...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Umurenge Dashboard</h1>
                <p className="text-gray-500 flex items-center mt-1">
                    <MapPin size={16} className="mr-1" /> Sector Overview: <span className="font-semibold text-blue-600 ml-1">{loggedUser.sector || "General"}</span>
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 bg-blue-100 rounded-full text-blue-600 mr-4">
                        <Building size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Sector Schools</p>
                        <h3 className="text-2xl font-bold">{schools.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 bg-green-100 rounded-full text-green-600 mr-4">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Head Schools</p>
                        <h3 className="text-2xl font-bold">{users.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 bg-purple-100 rounded-full text-purple-600 mr-4">
                        <ClipboardCheck size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Active Requests</p>
                        <h3 className="text-2xl font-bold">{predictions.length}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Infrastructure Budget Requests</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={false} />
                                <YAxis />
                                <Tooltip formatter={(val) => formatCurrency(val)} />
                                <Legend />
                                <Bar dataKey="budget" name="Est. Budget (RWF)" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Request Status Overview</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold">School Representatives (Head Schools )</h3>
                    <p className="text-sm text-gray-400">Filtered list of SCHOOL role users in this sector</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 uppercase font-medium">
                            <tr>
                                <th className="p-4">Username</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Assigned School</th>
                                <th className="p-4">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, idx) => (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">{user.username}</td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        {user.school ? (typeof user.school === 'object' ? user.school.name : `School ID: ${user.school}`) : "Not Assigned"}
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-semibold">
                                            {user.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-400">No School users found in this sector.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UmurengeDashboard;