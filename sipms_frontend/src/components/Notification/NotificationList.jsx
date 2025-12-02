import { useState, useEffect } from 'react';
import { Loader2, Eye, Bell, Shield, Calendar, MessageSquare, X } from "lucide-react";
import { notificationService, getCurrentUser } from '../../api';
import 'react-toastify/dist/ReactToastify.css';

export default function NotificationList() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);


    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const result = await notificationService.getAllNotifications();

            if (result.success) {
                const user = getCurrentUser();
                const role = user?.role?.toUpperCase();
                const filteredData = result.data.filter(
                    (notification) => notification.role?.toUpperCase() === role || notification.sender?.toUpperCase() === role
                );

                setNotifications(filteredData);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleOpenModal = (notification) => {
        setSelectedNotification(notification);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedNotification(null);
    };

    const truncateMessage = (message, length = 50) => {
        if (!message) return '';
        return message.length > length ? message.slice(0, length) + '...' : message;
    };

    const getRoleBadgeColor = (role) => {
        const roleUpper = role?.toUpperCase();
        switch (roleUpper) {
            case 'ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'DISTRICT': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'SCHOOL': return 'bg-green-100 text-green-800 border-green-200';
            case 'UMURENGE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const stats = {
        total: notifications.length,
        today: notifications.filter(n => {
            const today = new Date();
            const notifDate = new Date(n.created_at);
            return notifDate.toDateString() === today.toDateString();
        }).length,
        thisWeek: notifications.filter(n => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(n.created_at) >= weekAgo;
        }).length
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg">
                            <Bell className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-gray-600 mt-1">All notifications sent to different roles</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Total Notifications</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="bg-blue-100 rounded-full p-4">
                                    <MessageSquare className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Today</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
                                </div>
                                <div className="bg-green-100 rounded-full p-4">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">This Week</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.thisWeek}</p>
                                </div>
                                <div className="bg-purple-100 rounded-full p-4">
                                    <Bell className="w-6 h-6 text-purple-600" />
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
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">FROM </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">TO</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                                <p className="text-gray-600 font-medium">Loading notifications...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-gray-100 rounded-full p-6 mb-4">
                                                    <Bell className="w-12 h-12 text-gray-400" />
                                                </div>
                                                <p className="text-gray-600 font-medium text-lg">No notifications found</p>
                                                <p className="text-gray-400 text-sm mt-1">Notifications will appear here when sent</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    notifications.map((notification, index) => (
                                        <tr key={notification.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(notification.role)}`}>
                                                    {notification.sender}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(notification.role)}`}>
                                                    {notification.role}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-900">{truncateMessage(notification.message)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />

                                                    <span>
                                                        {new Date(notification.created_at).toLocaleDateString()}{" "}
                                                        {new Date(notification.created_at).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm">
                                                <button
                                                    onClick={() => handleOpenModal(notification)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium text-sm"
                                                    title="View Detail"
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
            </div>

            {showModal && selectedNotification && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">Notification Details</h2>
                                    <p className="text-blue-100 mt-1">Complete notification information</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-6">
                                    <Bell className="w-12 h-12 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Notification to {selectedNotification.role}</h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(selectedNotification.role)}`}>
                                        {selectedNotification.role}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 rounded-full p-2 mt-1">
                                            <MessageSquare className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Message Content</p>
                                            <p className="text-base text-gray-900 leading-relaxed">{selectedNotification.message}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Sent On</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {new Date(selectedNotification.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="bg-purple-100 rounded-full p-4">
                                            <Calendar className="w-8 h-8 text-purple-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-green-100 rounded-full p-2 mt-1">
                                            <Shield className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Target Role</p>
                                            <p className="text-base text-gray-900">This notification was sent to all users with the <span className="font-bold">{selectedNotification.role}</span> role.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 rounded-b-2xl flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
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