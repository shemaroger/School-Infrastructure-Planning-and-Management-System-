import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { USER_ROLES, getRoleLabel } from '../../constants/roles';
import { parseLocation } from '../../constants/locations';
import { userService, schoolService, getCurrentUser } from '../../api';
import { ArrowLeft, Save, X, User, Mail, Shield, MapPin, Building2, AlertCircle, Edit3, Loader, Lock, Eye, EyeOff, Check } from 'lucide-react';

export default function EditUserPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [schools, setSchools] = useState([]);
    const [isMyProfile, setIsMyProfile] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '', requirements: [] });
    const storedUserData = getCurrentUser();
    const id = storedUserData.id;

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirm_password: '',
        role: USER_ROLES.SCHOOL,
        school: '',
        district: '',
        sector: ''
    });

    const checkPasswordStrength = (password) => {
        const requirements = [
            { label: 'At least 8 characters', met: password.length >= 8 },
            { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
            { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
            { label: 'Contains number', met: /[0-9]/.test(password) },
            { label: 'Contains special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
        ];

        const metCount = requirements.filter(r => r.met).length;

        let score, label, color;

        if (password.length === 0) {
            score = 0;
            label = '';
            color = 'bg-gray-200';
        } else if (metCount <= 1) {
            score = 1;
            label = 'Very Weak';
            color = 'bg-red-500';
        } else if (metCount === 2) {
            score = 2;
            label = 'Weak';
            color = 'bg-orange-500';
        } else if (metCount === 3) {
            score = 3;
            label = 'Fair';
            color = 'bg-yellow-500';
        } else if (metCount === 4) {
            score = 4;
            label = 'Strong';
            color = 'bg-blue-500';
        } else {
            score = 5;
            label = 'Very Strong';
            color = 'bg-green-500';
        }

        return { score, label, color, requirements };
    };

    useEffect(() => {
        if (storedUserData.id) {
            setIsMyProfile(true);
        }

        fetchSchools();
        fetchUser();
    }, [id]);

    useEffect(() => {
        if (formData.password) {
            setPasswordStrength(checkPasswordStrength(formData.password));
        } else {
            setPasswordStrength({ score: 0, label: '', color: 'bg-gray-200', requirements: [] });
        }
    }, [formData.password]);

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
            const result = await userService.getById(storedUserData.id);
            if (result.success) {
                const user = result.data;
                console.log("user data :", result.data)
                const location = user.sector ? parseLocation(user.sector) : { district: '', sector: '' };
                setFormData({
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    password: '',
                    confirm_password: '',
                    role: user.role,
                    school: user.school?.id || '',
                    district: location.district || '',
                    sector: location.sector || ''
                });

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password || formData.confirm_password) {
            if (formData.password !== formData.confirm_password) {
                toast.error("Passwords do not match");
                return;
            }

            if (passwordStrength.score < 3) {
                toast.error("Please use a stronger password. It should include uppercase, lowercase, numbers, and special characters.");
                return;
            }
        }

        setIsLoading(true);
        try {
            const userData = {
                username: formData.username,
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
            };

            if (formData.password) {
                userData.password = formData.password;
            }

            const result = await userService.update(id, userData);
            if (result.success) {
                toast.success("User updated successfully");
                navigate("/main/users/views/profile")
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
                        <div>
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-lg">
                                    <Edit3 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900">{isMyProfile ? 'Edit My Profile' : 'Edit User'}</h1>
                                    <p className="text-gray-600 mt-1">Update user information and settings</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <form onSubmit={handleSubmit}>
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

                                <div className="space-y-2 md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Lock className="w-4 h-4 text-gray-500" />
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter new password (optional)"
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {formData.password && (
                                        <div className="mt-3 space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-600">Password Strength:</span>
                                                    <span className={`text-sm font-semibold ${passwordStrength.score <= 1 ? 'text-red-600' :
                                                        passwordStrength.score === 2 ? 'text-orange-600' :
                                                            passwordStrength.score === 3 ? 'text-yellow-600' :
                                                                passwordStrength.score === 4 ? 'text-blue-600' :
                                                                    'text-green-600'
                                                        }`}>
                                                        {passwordStrength.label}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength.score
                                                                ? passwordStrength.color
                                                                : 'bg-gray-200'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <p className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {passwordStrength.requirements.map((req, index) => (
                                                        <div
                                                            key={index}
                                                            className={`flex items-center gap-2 text-sm transition-colors ${req.met ? 'text-green-600' : 'text-gray-500'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${req.met ? 'bg-green-100' : 'bg-gray-200'
                                                                }`}>
                                                                {req.met ? (
                                                                    <Check className="w-3 h-3" />
                                                                ) : (
                                                                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                                                )}
                                                            </div>
                                                            <span>{req.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {passwordStrength.score > 0 && passwordStrength.score < 3 && (
                                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-red-700">
                                                        Your password is too weak. Please add more variety including uppercase letters, numbers, and special characters.
                                                    </p>
                                                </div>
                                            )}

                                            {passwordStrength.score >= 4 && (
                                                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-green-700">
                                                        Great! Your password is strong and secure.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!formData.password && (
                                        <p className="text-xs text-gray-500">Leave blank to keep current password</p>
                                    )}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Lock className="w-4 h-4 text-gray-500" />
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirm_password"
                                            value={formData.confirm_password}
                                            onChange={handleInputChange}
                                            placeholder="Confirm new password"
                                            disabled={isLoading}
                                            className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed ${formData.confirm_password && formData.password !== formData.confirm_password
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                                : formData.confirm_password && formData.password === formData.confirm_password
                                                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                                                    : 'border-gray-200 focus:border-blue-500'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {formData.confirm_password && (
                                        <div className={`flex items-center gap-2 text-sm ${formData.password === formData.confirm_password
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                            }`}>
                                            {formData.password === formData.confirm_password ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    <span>Passwords match</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>Passwords do not match</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-purple-50/50 to-white border-b border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-purple-100 rounded-lg p-2">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Role & Permissions</h2>
                                    <p className="text-sm text-gray-500">View user role and access level (read-only)</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Shield className="w-4 h-4 text-gray-500" />
                                    User Role
                                </label>
                                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium">
                                    {getRoleLabel(formData.role)}
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3 text-purple-500" />
                                    Role cannot be changed from this page
                                </p>
                            </div>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-green-50/50 to-white border-b border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-100 rounded-lg p-2">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Location Information</h2>
                                    <p className="text-sm text-gray-500">View geographic assignment and school details (read-only)</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        District
                                    </label>
                                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                                        {formData.district || 'Not set'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        Sector
                                    </label>
                                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                                        {formData.sector || 'Not set'}
                                    </div>
                                </div>

                                {formData.role === USER_ROLES.SCHOOL && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <Building2 className="w-4 h-4 text-gray-500" />
                                            School Assignment
                                        </label>
                                        <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                                            {schools.find(s => s.id === formData.school)?.name || 'Not assigned'}
                                            {schools.find(s => s.id === formData.school)?.location &&
                                                ` - ${schools.find(s => s.id === formData.school)?.location}`}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-4">
                                <AlertCircle className="w-3 h-3 text-green-500" />
                                Location and school assignment cannot be changed from this page
                            </p>
                        </div>

                        <div className="p-8 bg-gray-50">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(isMyProfile ? '/main/users/views/profile' : '/main/users/views/profile')}
                                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 border-2 border-gray-200 flex items-center justify-center gap-2 group"
                                    disabled={isLoading}
                                >
                                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || (formData.password && passwordStrength.score < 3) || (formData.confirm_password && formData.password !== formData.confirm_password)}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            <span>Updating {isMyProfile ? 'Profile' : 'User'}...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>Update {isMyProfile ? 'Profile' : 'User'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Need to change role, location, or school? Contact your system administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}