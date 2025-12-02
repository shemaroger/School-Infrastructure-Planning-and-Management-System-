import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { USER_ROLES, getRoleLabel } from '../../constants/roles';
import { parseLocation } from '../../constants/locations';
import { userService, schoolService, getCurrentUser } from '../../api';
import { ArrowLeft, User, Mail, Shield, MapPin, Building2, Eye, Loader, Tag, Home, Edit3, KeyRound } from 'lucide-react';

export default function ViewUserPage() {
    const [isFetching, setIsFetching] = useState(true);
    const [schools, setSchools] = useState([]);
    const storedUserData = getCurrentUser();
    const id = storedUserData.id;

    const [userData, setUserData] = useState({
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
                setUserData({
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name || 'N/A',
                    last_name: user.last_name || 'N/A',
                    role: user.role,
                    school: user.school?.id || '',
                    district: location.district || 'N/A',
                    sector: location.sector || 'N/A'
                });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Error loading user data');
        } finally {
            setIsFetching(false);
        }
    };

    const getSchoolName = (schoolId) => {
        const school = schools.find(s => s.id === schoolId);
        return school ? school.name : 'Not assigned';
    };

    const getSchoolLocation = (schoolId) => {
        const school = schools.find(s => s.id === schoolId);
        return school ? school.location : null;
    }

    if (isFetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4 mx-auto"></div>
                    <p className="text-gray-600 font-medium text-lg">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">

                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">

                            <div className="flex items-center gap-3 p-6 bg-blue-50 border-b-4 border-blue-200 rounded-t-2xl">
                                <div className="bg-blue-500 rounded-full p-2">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            Username
                                        </label>
                                        <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-800 font-medium border border-gray-200">
                                            {userData.username || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            Email Address
                                        </label>
                                        <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-800 font-medium border border-gray-200">
                                            {userData.email || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            First Name
                                        </label>
                                        <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-800 font-medium border border-gray-200">
                                            {userData.first_name || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            Last Name
                                        </label>
                                        <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-800 font-medium border border-gray-200">
                                            {userData.last_name || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">

                            <div className="flex items-center gap-3 p-6 bg-purple-50 border-b-4 border-purple-200 rounded-t-2xl">
                                <div className="bg-purple-500 rounded-full p-2">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Role & Permissions</h2>
                            </div>

                            <div className="p-8">
                                <div className="space-y-2 max-w-md">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <Tag className="w-4 h-4 text-purple-600" />
                                        User Role
                                    </label>
                                    <div className="w-full px-4 py-3 bg-purple-50/50 rounded-lg text-purple-800 font-bold border-2 border-purple-200">
                                        {getRoleLabel(userData.role)}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="lg:col-span-1">

                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 space-y-8">

                            <div className="flex items-center gap-3 p-6 bg-green-50 border-b-4 border-green-200 rounded-t-2xl">
                                <div className="bg-green-500 rounded-full p-2">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Geographic Location</h2>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        District
                                    </label>
                                    <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-800 font-medium border border-gray-200">
                                        {userData.district || 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        Sector
                                    </label>
                                    <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-800 font-medium border border-gray-200">
                                        {userData.sector || 'N/A'}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {userData.role === USER_ROLES.SCHOOL && (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mt-8">

                                <div className="flex items-center gap-3 p-6 bg-yellow-50 border-b-4 border-yellow-200 rounded-t-2xl">
                                    <div className="bg-yellow-500 rounded-full p-2">
                                        <Building2 className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">School Assignment</h2>
                                </div>

                                <div className="p-8">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            School Name
                                        </label>
                                        <div className="w-full px-4 py-3 bg-yellow-50 rounded-lg text-yellow-800 font-medium border border-yellow-200">
                                            {getSchoolName(userData.school)}
                                        </div>
                                        {getSchoolLocation(userData.school) && (
                                            <p className="text-sm text-gray-500 flex items-center gap-1 pt-2">
                                                <Home className="w-4 h-4 text-blue-500" />
                                                Located in: **{getSchoolLocation(userData.school)}**
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}