import React, { useState, useEffect } from 'react';
import {
    Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, Line, ComposedChart
} from 'recharts';
import { Users, School, Wallet, Hammer } from 'lucide-react';
import { schoolService, userService, predictionService } from '../../api';

const Dashboard = () => {
    const [schools, setSchools] = useState([]);
    const [users, setUsers] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const schoolRes = await schoolService.getAllSchools();
                if (schoolRes.success) setSchools(schoolRes.data);

                const userRes = await userService.list();
                setUsers(userRes.data || userRes);

                const predRes = await predictionService.getAllPredictions();
                setPredictions(predRes.data || predRes);

            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalBudget = predictions.reduce((sum, item) => sum + parseFloat(item.estimated_budget || 0), 0);
    const totalRoomsToBuild = predictions.reduce((sum, item) => sum + (item.rooms_to_build || 0), 0);

    const constructionData = predictions
        .sort((a, b) => parseFloat(b.estimated_budget) - parseFloat(a.estimated_budget))
        .slice(0, 10)
        .map((p) => ({
            name: `School ${p.school}`,
            budget: parseFloat(p.estimated_budget),
            rooms: p.rooms_to_build,
            required: p.required_rooms
        }));

    const roleCounts = users.reduce((acc, user) => {
        const role = user.role || 'Unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const userRoleData = Object.keys(roleCounts).map(role => ({
        name: role,
        value: roleCounts[role]
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(value);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading System Data...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 bg-blue-100 rounded-full text-blue-600 mr-4">
                        <School size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Registered Schools</p>
                        <h3 className="text-2xl font-bold">{schools.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 bg-green-100 rounded-full text-green-600 mr-4">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Est. Budget Required</p>
                        <h3 className="text-xl font-bold text-green-700">
                            {(totalBudget / 1000000).toFixed(1)}M <span className="text-sm text-gray-400">RWF</span>
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 bg-orange-100 rounded-full text-orange-600 mr-4">
                        <Hammer size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">New Rooms Needed</p>
                        <h3 className="text-2xl font-bold">{totalRoomsToBuild}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 bg-purple-100 rounded-full text-purple-600 mr-4">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">System Users</p>
                        <h3 className="text-2xl font-bold">{users.length}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Construction Budget vs Rooms</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={constructionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={false} />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                <Tooltip formatter={(value, name) => name === 'budget' ? formatCurrency(value) : value} />
                                <Legend />
                                <Bar yAxisId="right" dataKey="rooms" name="Rooms to Build" barSize={20} fill="#413ea0" />
                                <Line yAxisId="left" type="monotone" dataKey="budget" name="Est. Budget (RWF)" stroke="#ff7300" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">User Distribution by Role</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userRoleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userRoleData.map((entry, index) => (
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
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Registered Schools Overview</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 uppercase font-medium">
                            <tr>
                                <th className="p-4">School Name</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Head Teacher</th>
                                <th className="p-4 text-center">Student Pop.</th>
                                <th className="p-4 text-center">Rooms</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.slice(0, 5).map((school, idx) => (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">{school.name}</td>
                                    <td className="p-4">{school.location}</td>
                                    <td className="p-4">{school.head_teacher || "-"}</td>
                                    <td className="p-4 text-center">{school.student_population}</td>
                                    <td className="p-4 text-center">{school.number_of_rooms}</td>
                                </tr>
                            ))}
                            {schools.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center">No schools found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;