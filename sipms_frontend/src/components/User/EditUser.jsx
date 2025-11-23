import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { USER_ROLES, getRoles, getRoleLabel } from '../../constants/roles';
import { getDistricts, getSectorsByDistrict, formatLocation, parseLocation } from '../../constants/locations';
import { userService, schoolService } from '../../api';
import { ArrowLeft, Save, X, User, Mail, Shield, MapPin, Building2, AlertCircle, Edit3, Loader } from 'lucide-react';

export default function EditUserPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
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
        fetchUser();
    }, [id]);

    const fetchSchools = async () => {
        try {
            const result = await schoolService.getAllSchools();
            if (result.success) {
                setSchools(result.data);
            }
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const fetchUser = async () => {
        setIsFetching(true);
        try {
            const result = await userService.getById(id);
            if (result.success) {
                const user = result.data;
                const location = user.sector ? parseLocation(user.sector) : { district: '', sector: '' };
                setFormData({
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    role: user.role,
                    school: user.school?.id || '',
                    district: location.district || '',
                    sector: location.sector || ''
                });
                if (location.district) {
                    setSectors(getSectorsByDistrict(location.district));
                }
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Error loading user data');
        } finally {
            setIsFetching(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'role' && value !== USER_ROLES.SCHOOL) {
            setFormData(prev => ({
                ...prev,
                school: ''
            }));
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
            };
            if (formData.role === USER_ROLES.SCHOOL && formData.school) {
                userData.school_id = parseInt(formData.school);
            }
            const result = await userService.update(id, userData);
            if (result.success) {
                toast.success("User updated successfully");
                navigate('/main/users/list');
            } else {
                toast.error("Failed to update user");
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error("Error updating user");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4 mx-auto"></div>
                    <p className="text-gray-600 font-medium text-lg">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {/* Left side */}
                        <div>

                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-lg">
                                    <Edit3 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900">Edit User</h1>
                                    <p className="text-gray-600 mt-1">Update user information and settings</p>
                                </div>
                            </div>
                        </div>

                        {/* Right side */}
                        <button
                            onClick={() => navigate('/main/users/list')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to Users</span>
                        </button>
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
                                    <p className="text-sm text-gray-500">Update basic user details and credentials</p>
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
                                    <p className="text-sm text-gray-500">Update user role and access level</p>
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
                                    {getRoles().map((role) => (
                                        <option key={role} value={role}>
                                            {getRoleLabel(role)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Location Information Section */}
                        <div className="p-8 bg-gradient-to-br from-green-50/50 to-white border-b border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-100 rounded-lg p-2">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Location Information</h2>
                                    <p className="text-sm text-gray-500">Update geographic assignment and school details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* District */}
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

                                {/* Sector */}
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

                                {/* School (conditional) */}
                                {formData.role === USER_ROLES.SCHOOL && (
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

                        {/* Update Notice */}
                        <div className="p-8 bg-gradient-to-br from-blue-50/50 to-white border-b border-gray-100">
                            <div className="bg-white border-2 border-blue-200 rounded-xl p-5 flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="bg-blue-100 rounded-full p-2">
                                        <AlertCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Important Note</h3>
                                    <p className="text-sm text-gray-600">
                                        Changes to user roles may affect their access permissions. The user may need to log in again for changes to take effect.
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
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            <span>Updating User...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>Update User</span>
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
                        Need to reset this user's password? Contact your system administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}