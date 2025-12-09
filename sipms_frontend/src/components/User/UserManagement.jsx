import { useState, useEffect, useRef } from 'react';
import { Trash2, Pen, Eye, MoreVertical, Plus, Search, Filter, Users as UsersIcon, Mail, Shield, School as SchoolIcon } from "lucide-react";
import { userService, getCurrentUser } from '../../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { USER_ROLES, getRoleLabel } from '../../constants/roles';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);
    const dropdownRef = useRef(null);

    const loggedUser = getCurrentUser();

    useEffect(() => {

        fetchUsers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const result = await userService.list();
            if (result.success) {
                let filtered = result.data;

                if (loggedUser?.role === USER_ROLES.UMURENGE) {
                    filtered = filtered.filter(
                        (u) =>
                            u.role === USER_ROLES.SCHOOL
                        // u.sector?.toLowerCase() === loggedUser.sector?.toLowerCase()
                    );
                }

                setUsers(filtered);
            }
        } catch (error) {
            toast.error("Error fetching users")
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSchoolName = (user) => {
        if (user.role === USER_ROLES.SCHOOL && user.school) {
            return user.school.name || '-';
        }
        return '-';
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
        setOpenDropdownId(null);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedUser(null);
    };

    const toggleDropdown = (userId) => {
        setOpenDropdownId(openDropdownId === userId ? null : userId);
    };

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getRoleLabel(user.role)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case USER_ROLES.ADMIN: return 'bg-purple-100 text-purple-800 border-purple-200';
            case USER_ROLES.DISTRICT: return 'bg-blue-100 text-blue-800 border-blue-200';
            case USER_ROLES.SCHOOL: return 'bg-green-100 text-green-800 border-green-200';
            case USER_ROLES.UMURENGE: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const Pagination = ({ totalPages, currentPage, paginate }) => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

        return (
            <div className="flex justify-end mt-4 gap-1">
                <button
                    className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 mr-3"
                    onClick={() => paginate(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>

                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-lg border ${currentPage === number ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}
                    >
                        {number}
                    </button>
                ))}

                <button
                    className="px-3 py-1 rounded-lg border border-gray-300 ml-3 hover:bg-gray-100"
                    onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </button>
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                User Management
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <UsersIcon className="w-4 h-4" />
                                {loggedUser?.role === USER_ROLES.UMURENGE
                                    ? "School Users in Your Sector"
                                    : "Manage system users"}
                            </p>
                        </div>

                        {loggedUser?.role !== USER_ROLES.UMURENGE && (
                            <a
                                href="/main/users/add"
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add User</span>
                            </a>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, username..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Sector</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">School</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                                <p className="text-gray-600 font-medium">Loading users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <p className="text-gray-600 font-medium text-lg">No users found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    currentUsers.map((user, index) => (
                                        <tr key={user.id} className="hover:bg-blue-50/50 transition-colors text-sm">

                                            <td className="px-6 py-2">{indexOfFirstUser + index + 1}.</td>
                                            <td className="px-6 py-2">

                                                <p className="">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex items-center gap-2 ">
                                                    <Mail className="w-4 h-4  text-gray-400" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">{user.sector || '-'}</td>
                                            <td className="px-6 py-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2">{getSchoolName(user)}</td>

                                            <td className="px-6 py-2 relative">
                                                <button
                                                    onClick={() => toggleDropdown(user.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </button>

                                                {openDropdownId === user.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-8 top-10 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                                                    >
                                                        <button
                                                            onClick={() => handleViewDetails(user)}
                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-3"
                                                        >
                                                            <Eye className="w-4 h-4 text-blue-600" />
                                                            View Details
                                                        </button>

                                                        {loggedUser?.role !== USER_ROLES.UMURENGE && (
                                                            <a
                                                                href={`/main/users/edit/${user.id}`}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-3"
                                                            >
                                                                <Pen className="w-4 h-4 text-green-600" />
                                                                Edit User
                                                            </a>
                                                        )}

                                                        {/* {loggedUser?.role !== USER_ROLES.UMURENGE && (
                                                            <>
                                                                <hr className="my-2 border-gray-100" />
                                                                <button
                                                                    onClick={() => {
                                                                        setOpenDropdownId(null);
                                                                        handleDelete(user.id);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete User
                                                                </button>
                                                            </>
                                                        )} */}
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

                {totalPages > 1 && (
                    <Pagination totalPages={totalPages} currentPage={currentPage} paginate={paginate} />
                )}
            </div>

            {showDetailModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-blue-600 px-8 py-6 rounded-t-2xl text-white flex justify-between">
                            <h2 className="text-3xl font-bold">User Details</h2>
                            <button
                                onClick={handleCloseDetailModal}
                                className="p-2 hover:bg-white/20 rounded-full"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-8">
                            <h3 className="text-xl font-bold">
                                {selectedUser.first_name} {selectedUser.last_name}
                            </h3>
                            <p className="text-gray-600">@{selectedUser.username}</p>

                            <div className="mt-4 space-y-2">
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Sector:</strong> {selectedUser.sector || "-"}</p>
                                <p><strong>School:</strong> {getSchoolName(selectedUser)}</p>
                                <p><strong>Role:</strong> {getRoleLabel(selectedUser.role)}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-100 flex justify-end rounded-b-2xl">
                            <button
                                onClick={handleCloseDetailModal}
                                className="bg-gray-900 text-white px-6 py-3 rounded-xl"
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