import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2, CheckCircle, ArrowLeft, BookOpen, Users, Home, User, Mail, Phone, Building2, Calendar, Save, Eye, Edit3, MapPin } from "lucide-react";
import { schoolService, getCurrentUser } from "../../api";

export default function SchoolAdditionalInfo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [schoolData, setSchoolData] = useState(null);
    const [userdata, setUserData] = useState(getCurrentUser());
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        established_year: "",
        student_population: "",
        number_of_rooms: "",
        head_teacher: "",
        email: "",
        phone: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const storedUserData = getCurrentUser();
        setUserData(storedUserData);
        const fetchSchool = async () => {
            try {
                const res = await schoolService.getById(storedUserData.school.id);
                setSchoolData(res.data);
                setFormData({
                    established_year: res.data.established_year || "",
                    student_population: res.data.student_population || "",
                    number_of_rooms: res.data.number_of_rooms || "",
                    head_teacher: res.data.head_teacher || "",
                    email: res.data.email || "",
                    phone: res.data.phone || "",
                });
            } catch (error) {
                console.error("Error fetching school:", error);
                toast.error("Failed to load school details.");
            }
        };
        fetchSchool();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccess(false);
        try {
            await schoolService.update(userdata.school.id, formData);
            setSuccess(true);
            toast.success("School details updated successfully!");
            setSchoolData({ ...schoolData, ...formData });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating school:", error);
            toast.error("Failed to update school details.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!schoolData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4 mx-auto"></div>
                    <p className="text-gray-600 font-medium text-lg">Loading school information...</p>
                </div>
            </div>
        );
    }

    const isComplete =
        schoolData.established_year &&
        schoolData.student_population &&
        schoolData.number_of_rooms &&
        schoolData.head_teacher &&
        schoolData.email &&
        schoolData.phone;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 pb-6  border-gray-200">
                            <div className="border border-blue-600 rounded-full p-6">
                                <Building2 className="w-12 h-12 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-gray-900">{schoolData.name}</h2>
                                <div className="flex items-center gap-2 mt-2 text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{schoolData.location}</span>
                                </div>
                            </div>
                        </div>
                        {isComplete && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="border border-blue-600 font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                <Edit3 className="w-5 h-5" />
                                <span>Edit Information</span>
                            </button>
                        )}
                    </div>
                </div>

                {isComplete && !isEditing ? (
                    /* View Mode - Display Information */
                    <div className="space-y-6">
                        {/* School Header Card */}
                        <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                <StatCard
                                    icon={<Users className="w-5 h-5 text-green-600" />}
                                    label="Total Students"
                                    value={schoolData.student_population?.toLocaleString()}
                                    bgColor="bg-green-50"
                                    borderColor="border-green-200"
                                />
                                <StatCard
                                    icon={<Home className="w-5 h-5 text-purple-600" />}
                                    label="Classrooms"
                                    value={schoolData.number_of_rooms}
                                    bgColor="bg-purple-50"
                                    borderColor="border-purple-200"
                                />
                                <StatCard
                                    icon={<Calendar className="w-5 h-5 text-blue-600" />}
                                    label="Established"
                                    value={schoolData.established_year}
                                    bgColor="bg-blue-50"
                                    borderColor="border-blue-200"
                                />
                            </div>
                        </div>


                        {/* Contact Information */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className=" px-8 py-2">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <User className="w-6 h-6 text-blue-600" />
                                    Contact Information
                                </h3>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DetailCard
                                        icon={<User className="w-5 h-5 text-blue-600" />}
                                        label="Head Teacher"
                                        value={schoolData.head_teacher}
                                    />
                                    <DetailCard
                                        icon={<Mail className="w-5 h-5 text-green-600" />}
                                        label="Email Address"
                                        value={schoolData.email}
                                    />
                                    <DetailCard
                                        icon={<Phone className="w-5 h-5 text-purple-600" />}
                                        label="Phone Number"
                                        value={schoolData.phone}
                                    />
                                    <DetailCard
                                        icon={<MapPin className="w-5 h-5 text-yellow-600" />}
                                        label="Location"
                                        value={schoolData.location}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Capacity Analysis */}
                        {schoolData.student_population > 0 && schoolData.number_of_rooms > 0 && (
                            <div className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-lg">
                                <div className="flex items-start gap-4">
                                    <div className="border border-yellow-600 rounded-full p-3">
                                        <BookOpen className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Capacity Analysis</h3>
                                        <p className="text-gray-700">
                                            {(() => {
                                                const ratio = schoolData.student_population / schoolData.number_of_rooms;
                                                if (ratio > 35) {
                                                    return (
                                                        <span>
                                                            Your school is currently <span className="font-bold text-red-600">overcrowded</span> with an average of{" "}
                                                            <span className="font-bold">{Math.round(ratio)} students per classroom</span>. The recommended ratio is 35 students per room.
                                                        </span>
                                                    );
                                                } else if (ratio === 35) {
                                                    return (
                                                        <span>
                                                            Your school is at <span className="font-bold text-green-600">optimal capacity</span> with exactly{" "}
                                                            <span className="font-bold">35 students per classroom</span>.
                                                        </span>
                                                    );
                                                } else {
                                                    return (
                                                        <span>
                                                            Your school has <span className="font-bold text-green-600">adequate capacity</span> with{" "}
                                                            <span className="font-bold">{Math.round(ratio)} students per classroom</span>, which is below the standard of 35 students per room.
                                                        </span>
                                                    );
                                                }
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Edit Mode - Form */
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="border-b border-blue-600 px-8 py-6">
                            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Edit3 className="w-7 h-7 text-blue-600" />
                                {isComplete ? 'Update School Information' : 'Complete School Information'}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {isComplete ? 'Modify your school details' : 'Please fill in all required information about your school'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            {/* School Details Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="border border-blue-600 rounded-lg p-2">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">School Details</h3>
                                        <p className="text-sm text-gray-500">Basic information about the school</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField
                                        label="Established Year"
                                        name="established_year"
                                        type="number"
                                        value={formData.established_year}
                                        onChange={handleChange}
                                        icon={<Calendar className="w-4 h-4 text-gray-500" />}
                                        placeholder="e.g., 1985"
                                        required
                                    />
                                    <InputField
                                        label="Student Population"
                                        name="student_population"
                                        type="number"
                                        value={formData.student_population}
                                        onChange={handleChange}
                                        icon={<Users className="w-4 h-4 text-gray-500" />}
                                        placeholder="e.g., 450"
                                        required
                                    />
                                    <InputField
                                        label="Number of Rooms"
                                        name="number_of_rooms"
                                        type="number"
                                        value={formData.number_of_rooms}
                                        onChange={handleChange}
                                        icon={<Home className="w-4 h-4 text-gray-500" />}
                                        placeholder="e.g., 12"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="mb-8 pt-8 border-t border-gray-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="border border-green-600 rounded-lg p-2">
                                        <User className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                                        <p className="text-sm text-gray-500">Primary contact details for the school</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField
                                        label="Head Teacher"
                                        name="head_teacher"
                                        type="text"
                                        value={formData.head_teacher}
                                        onChange={handleChange}
                                        icon={<User className="w-4 h-4 text-gray-500" />}
                                        placeholder="Full name"
                                        required
                                    />
                                    <InputField
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        icon={<Mail className="w-4 h-4 text-gray-500" />}
                                        placeholder="school@example.com"
                                        required
                                    />
                                    <InputField
                                        label="Phone Number"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        icon={<Phone className="w-4 h-4 text-gray-500" />}
                                        placeholder="+250 XXX XXX XXX"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                {isComplete && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 border-2 border-gray-200 flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-5 h-5" />
                                        <span>Cancel & View</span>
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`${isComplete ? 'flex-1' : 'w-full'} border border-blue-600   font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Saving Changes...</span>
                                        </>
                                    ) : success ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Saved Successfully!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>{isComplete ? 'Update Information' : 'Save School Information'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, bgColor, borderColor }) {
    return (
        <div className={`bg-white border ${borderColor} rounded-xl p-6 transition-all hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
                <div className="bg-white rounded-full p-3 shadow-sm">
                    {icon}
                </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function DetailCard({ icon, label, value }) {
    return (
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
                <div className="bg-white rounded-lg p-2 shadow-sm mt-1">
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-base font-semibold text-gray-900 break-all">{value}</p>
                </div>
            </div>
        </div>
    );
}

function InputField({ label, name, type, value, onChange, icon, placeholder, required }) {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                {icon}
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
        </div>
    );
}