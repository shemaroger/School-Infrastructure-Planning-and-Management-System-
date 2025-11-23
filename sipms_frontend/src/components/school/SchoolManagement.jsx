import { useState, useEffect, useRef } from 'react';
import { Eye, Plus, Search, Filter, Building2, Users, Calendar, MapPin, Loader, X, Check, MoreVertical, Pen, AlertCircle } from "lucide-react";
import { getDistricts, getSectorsByDistrict, formatLocation, parseLocation } from '../../constants/locations';
import { schoolService } from '../../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SchoolManagement() {
    const [schools, setSchools] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSchool, setCurrentSchool] = useState(null);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [schoolName, setSchoolName] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const schoolsPerPage = 2;

    useEffect(() => {
        fetchSchools();
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

    const fetchSchools = async () => {
        setIsLoading(true);
        try {
            const result = await schoolService.getAllSchools();
            if (result.success) {
                setSchools(result.data);
            }
        } catch (error) {
            console.error('Error fetching schools:', error);
            toast.error('Error loading schools');
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

    const handleOpenModal = (school = null) => {
        if (school) {
            setIsEditing(true);
            setCurrentSchool(school);
            setSchoolName(school.name);

            const { district, sector } = parseLocation(school.location);
            setSelectedDistrict(district);
            setSelectedSector(sector);
        } else {
            setIsEditing(false);
            setCurrentSchool(null);
            setSchoolName('');
            setSelectedDistrict('');
            setSelectedSector('');
        }
        setShowModal(true);
        setOpenDropdownId(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentSchool(null);
        setSchoolName('');
        setSelectedDistrict('');
        setSelectedSector('');
    };

    const handleViewDetails = (school) => {
        setSelectedSchool(school);
        setShowDetailModal(true);
        setOpenDropdownId(null);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedSchool(null);
    };

    const toggleDropdown = (schoolId) => {
        setOpenDropdownId(openDropdownId === schoolId ? null : schoolId);
    };

    const handleDistrictChange = (e) => {
        setSelectedDistrict(e.target.value);
        setSelectedSector('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const location = formatLocation(selectedDistrict, selectedSector);

            const schoolData = {
                name: schoolName,
                location: location
            };

            let result;

            if (isEditing && currentSchool) {
                result = await schoolService.update(currentSchool.id, schoolData);
                toast.success("School Updated Successfully");
            } else {
                result = await schoolService.create(schoolData);
                toast.success("School Added Successfully");
            }

            if (result.success) {
                await fetchSchools();
                handleCloseModal();
            }
        } catch (error) {
            console.error('Error saving school:', error);
            toast.error('Error saving school');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSchools = schools.filter(school =>
        school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastSchool = currentPage * schoolsPerPage;
    const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
    const currentSchools = filteredSchools.slice(indexOfFirstSchool, indexOfLastSchool);
    const totalPages = Math.ceil(filteredSchools.length / schoolsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const stats = {
        totalSchools: schools.length,
        totalStudents: schools.reduce((sum, s) => sum + (s.student_population || 0), 0),
        totalRooms: schools.reduce((sum, s) => sum + (s.number_of_rooms || 0), 0),
        averageStudents: schools.length > 0
            ? Math.round(schools.reduce((sum, s) => sum + (s.student_population || 0), 0) / schools.length)
            : 0
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                School Management
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Manage all schools in your district
                            </p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add School</span>
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Schools</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalSchools}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-4">
                                <Building2 className="w-6 h-6 text-blue-600" />
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

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Rooms</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalRooms}</p>
                            </div>
                            <div className="bg-purple-100 rounded-full p-4">
                                <Building2 className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Avg Students</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.averageStudents}</p>
                            </div>
                            <div className="bg-yellow-100 rounded-full p-4">
                                <Users className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by school name or location..."
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

                {/* Schools Table */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">School Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Est. Year</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Students</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rooms</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Registered</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                                <p className="text-gray-600 font-medium">Loading schools...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentSchools.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-gray-100 rounded-full p-6 mb-4">
                                                    <Building2 className="w-12 h-12 text-gray-400" />
                                                </div>
                                                <p className="text-gray-600 font-medium text-lg">No schools found</p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first school'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentSchools.map((school, index) => (
                                        <tr key={school.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 rounded-lg p-2">
                                                        <Building2 className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900">{school.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">{school.location || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{school.established_year || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                    {school.student_population || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                    {school.number_of_rooms || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>{new Date(school.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 relative">
                                                <button
                                                    onClick={() => toggleDropdown(school.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openDropdownId === school.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-8 top-12 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-slideDown"
                                                    >
                                                        <button
                                                            onClick={() => handleViewDetails(school)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4 text-blue-600" />
                                                            <span>View Details</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenModal(school)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-3 transition-colors"
                                                        >
                                                            <Pen className="w-4 h-4 text-green-600" />
                                                            <span>Edit School</span>
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
                {totalPages > 1 && (
                    <Pagination totalPages={totalPages} currentPage={currentPage} paginate={paginate} />
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedSchool && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-900 px-8 py-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">School Details</h2>
                                    <p className="text-blue-100 mt-1">Complete school information</p>
                                </div>
                                <button
                                    onClick={handleCloseDetailModal}
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* School Header */}
                            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200">
                                <div className="bg-gradient-to-br from-blue-900 to-blue-900 rounded-full p-6">
                                    <Building2 className="w-12 h-12 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedSchool.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <p className="text-gray-600">{selectedSchool.location || 'Location not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Information */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                        Basic Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">School Name</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedSchool.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Location</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedSchool.location || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Established Year</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedSchool.established_year || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Capacity Information */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-green-600" />
                                        Capacity Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Student Population</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedSchool.student_population || 0} students</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Number of Rooms</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedSchool.number_of_rooms || 0} rooms</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Students per Room</p>
                                            <p className="text-base font-semibold text-gray-900">
                                                {selectedSchool.number_of_rooms > 0
                                                    ? Math.round((selectedSchool.student_population || 0) / selectedSchool.number_of_rooms)
                                                    : 0} students/room
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Information */}
                            <div className="mt-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                    Registration Details
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Registered On</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {new Date(selectedSchool.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="bg-purple-100 rounded-full p-4">
                                        <Calendar className="w-8 h-8 text-purple-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Capacity Status */}
                            {selectedSchool.student_population > 0 && selectedSchool.number_of_rooms > 0 && (
                                <div className="mt-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-6 border border-yellow-200">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-yellow-100 rounded-full p-2 mt-1">
                                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">Capacity Analysis</h3>
                                            <p className="text-sm text-gray-700">
                                                {(() => {
                                                    const ratio = selectedSchool.student_population / selectedSchool.number_of_rooms;
                                                    if (ratio > 35) {
                                                        return `This school is overcrowded with an average of ${Math.round(ratio)} students per room. The recommended ratio is 35 students per room.`;
                                                    } else if (ratio === 35) {
                                                        return `This school is at optimal capacity with exactly 35 students per room.`;
                                                    } else {
                                                        return `This school has adequate capacity with ${Math.round(ratio)} students per room, which is below the standard of 35 students per room.`;
                                                    }
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slideUp">
                        <div className="sticky top-0 bg-gradient-to-r from-green-900 to-green-900 px-8 py-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">
                                        {isEditing ? 'Update School' : 'Add New School'}
                                    </h2>
                                    <p className="text-green-100 mt-1">
                                        {isEditing ? 'Modify school information' : 'Register a new school'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-6">
                                {/* School Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Building2 className="w-4 h-4 text-gray-500" />
                                        School Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={schoolName}
                                        onChange={(e) => setSchoolName(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        placeholder="Enter school name"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* District */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        District
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedDistrict}
                                        onChange={handleDistrictChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed bg-white"
                                        required
                                        disabled={isLoading}
                                    >
                                        <option value="">Select District</option>
                                        {getDistricts().map((district) => (
                                            <option key={district} value={district}>
                                                {district}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sector */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        Sector
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedSector}
                                        onChange={(e) => setSelectedSector(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed bg-white"
                                        required
                                        disabled={isLoading || !selectedDistrict}
                                    >
                                        <option value="">Select Sector</option>
                                        {getSectorsByDistrict(selectedDistrict).map((sector) => (
                                            <option key={sector} value={sector}>
                                                {sector}
                                            </option>
                                        ))}
                                    </select>
                                    {!selectedDistrict && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <Building2 className="w-3 h-3" />
                                            Please select a district first
                                        </p>
                                    )}
                                </div>

                                {/* Note for editing */}
                                {isEditing && currentSchool && (
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="bg-blue-100 rounded-full p-2">
                                                <Building2 className="w-4 h-4 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900 mb-1">Note</p>
                                            <p className="text-sm text-blue-800">
                                                Other details like student population, rooms, and established year can be updated later by the school administrator.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 border-2 border-gray-200 flex items-center justify-center gap-2"
                                    disabled={isLoading}
                                >
                                    <X className="w-5 h-5" />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-gradient-to-r from-green-900 to-green-900 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            <span>{isEditing ? 'Update School' : 'Add School'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}