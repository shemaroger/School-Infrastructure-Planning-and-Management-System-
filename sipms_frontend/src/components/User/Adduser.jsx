import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { USER_ROLES, getRoles, getRoleLabel } from '../../constants/roles';
import { getDistricts, getSectorsByDistrict, formatLocation } from '../../constants/locations';
import { userService, schoolService, getCurrentUser } from '../../api';
import { ArrowLeft, Save, X, User, Mail, Shield, MapPin, Building2, AlertCircle, Check } from 'lucide-react';

export default function AddUserPage() {
    const navigate = useNavigate();
    const loggedUser = getCurrentUser();
    const [isLoading, setIsLoading] = useState(false);
    const [districts, setDistricts] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [schools, setSchools] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: USER_ROLES.SCHOOL,
        school: '',
        district: '',
        sector: ''
    });

    useEffect(() => {
        setDistricts(getDistricts());
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const result = await schoolService.getAllSchools();
            if (result.success) setSchools(result.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'role' && value !== USER_ROLES.SCHOOL) {
            setFormData(prev => ({ ...prev, school: '' }));
        }
        if (name === 'district') {
            setSectors(getSectorsByDistrict(value));
            setFormData(prev => ({ ...prev, sector: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const location = formatLocation(formData.district, formData.sector);
            const userData = {
                username: formData.username,
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                role: formData.role,
                sector: location,
                password: '12345678!'
            };
            if (formData.role === USER_ROLES.SCHOOL && formData.school) {
                userData.school_id = parseInt(formData.school);
            }
            const result = await userService.create(userData);
            if (result.success) {
                toast.success('User Added Successfully!');
                navigate('/main/users/list');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error('Error saving user');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {/* Left side */}
                        <div>

                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900">Add New User</h1>
                                    <p className="text-gray-600 mt-1">
                                        Create a new user account with role assignment
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/main/users/list')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-medium">Back to Users</span>
                            </button>

                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <form onSubmit={handleSubmit}>
                        {/* Personal Information Section */}
                        <div className="p-8 border-b border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-blue-100 rounded-lg p-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                    <p className="text-sm text-gray-500">Basic user details and credentials</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Username */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <User className="w-4 h-4 text-gray-500" />
                                        Username
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Enter username"
                                        required
                                        disabled={isLoading}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        Email Address
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="user@example.com"
                                        required
                                        disabled={isLoading}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* First Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        First Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter first name"
                                        required
                                        disabled={isLoading}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        Last Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter last name"
                                        required
                                        disabled={isLoading}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role & Permissions Section */}
                        <div className="p-8 bg-gradient-to-br from-purple-50/50 to-white border-b border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-purple-100 rounded-lg p-2">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Role & Permissions</h2>
                                    <p className="text-sm text-gray-500">Assign user role and access level</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Shield className="w-4 h-4 text-gray-500" />
                                    User Role
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed bg-white"
                                >
                                    {loggedUser?.role === "UMURENGE" ? (
                                        <option value={USER_ROLES.SCHOOL}>
                                            {getRoleLabel(USER_ROLES.SCHOOL)}
                                        </option>
                                    ) : (
                                        getRoles().map((role) => (
                                            <option key={role} value={role}>
                                                {getRoleLabel(role)}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Location Information Section */}
                        <div className="p-8 bg-gradient-to-br from-green-50/50 to-white border-b border-gray-100">
                            {formData.role !== USER_ROLES.MINEDUC && (
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-green-100 rounded-lg p-2">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Location Information</h2>
                                        <p className="text-sm text-gray-500">Geographic assignment and school details</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* District */}
                                {formData.role !== USER_ROLES.MINEDUC && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            District
                                        </label>
                                        <select
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed bg-white"
                                        >
                                            <option value="">Select District</option>
                                            {districts.map((district, i) => (
                                                <option key={i} value={district}>{district}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {formData.role !== USER_ROLES.DISTRICT && formData.role !== USER_ROLES.MINEDUC && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            Sector
                                        </label>
                                        <select
                                            name="sector"
                                            value={formData.sector}
                                            onChange={handleInputChange}
                                            disabled={!formData.district || isLoading}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed bg-white"
                                        >
                                            <option value="">Select Sector</option>
                                            {sectors.map((sector, i) => (
                                                <option key={i} value={sector}>{sector}</option>
                                            ))}
                                        </select>
                                        {!formData.district && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Please select a district first
                                            </p>
                                        )}
                                    </div>

                                )}

                                {/* School (conditional) */}


                                {formData.role !== USER_ROLES.DISTRICT && formData.role !== USER_ROLES.MINEDUC && formData.role === USER_ROLES.SCHOOL && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <Building2 className="w-4 h-4 text-gray-500" />
                                            School Assignment
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="school"
                                            value={formData.school}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed bg-white"
                                        >
                                            <option value="">Select School</option>
                                            {schools.map((school) => (
                                                <option key={school.id} value={school.id}>
                                                    {school.name} - {school.location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="p-8 bg-gradient-to-br from-yellow-50/50 to-white border-b border-gray-100">
                            <div className="bg-white border-2 border-yellow-200 rounded-xl p-5 flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="bg-yellow-100 rounded-full p-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Default Password</h3>
                                    <p className="text-sm text-gray-600">
                                        All new users are assigned the default password: <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">12345678!</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Users should change this password upon first login for security.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-8 bg-gray-50">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/main/users/list')}
                                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 border-2 border-gray-200 flex items-center justify-center gap-2 group"
                                    disabled={isLoading}
                                >
                                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                            </svg>
                                            <span>Creating User...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            <span>Create User</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Need help? Contact your system administrator for assistance.
                    </p>
                </div>
            </div>
        </div>
    );
}