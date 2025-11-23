import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Loader2,
    CheckCircle,
    ArrowLeft,
    Building2,
    TrendingUp,
    Save,
    AlertCircle,
    MapPin,
    Users,
    BookOpen,
    User,
    Mail,
    Phone,
} from "lucide-react";
import { schoolService, predictionService, getCurrentUser } from "../../api";

export default function CreatePrediction() {
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState("");
    const [selectedSchoolDetails, setSelectedSchoolDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await schoolService.getAllSchools();
                const allSchools = res.data || [];
                setSchools(allSchools);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load schools.");
            }
        };
        fetchData();
    }, []);

    const fetchSchoolDetails = async (schoolId) => {
        try {
            const res = await schoolService.getById(schoolId);
            setSelectedSchoolDetails(res.data);
        } catch (error) {
            console.error("Error fetching school details:", error);
            toast.error("Failed to load school details.");
        }
    };

    const handleSchoolChange = (e) => {
        const id = e.target.value;
        setSelectedSchool(id);
        if (id) fetchSchoolDetails(id);
        else setSelectedSchoolDetails(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccess(false);

        const userdata = getCurrentUser();

        try {
            if (!selectedSchool) {
                toast.error("Please select a school first.");
                setIsLoading(false);
                return;
            }

            await predictionService.create({
                school_id: selectedSchool,
                created_by: userdata.id,
            });

            setSuccess(true);
            toast.success("Prediction created successfully!");
            setTimeout(() => navigate("/main/predictions/list"), 1500);
        } catch (error) {
            console.error("Error creating prediction:", error);
            toast.error("Failed to create prediction.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className=" bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="border border-blue-600 rounded-2xl p-3 shadow-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create Predictions</h1>
                            <p className="text-gray-600 mt-1 text-sm">Generate predictions by school</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </button>
                </div>


                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                    <form onSubmit={handleSubmit} className="p-8">
                        <>
                            <div className="mb-8">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Building2 className="w-4 h-4 text-gray-500" />
                                        Select School
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedSchool}
                                        onChange={handleSchoolChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                        required
                                    >
                                        <option value="">-- Select School --</option>
                                        {schools.map((school) => (
                                            <option key={school.id} value={school.id}>
                                                {school.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {selectedSchoolDetails && (
                                <div className="mb-8">
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                                School Details
                                            </h3>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="border border-blue-600 rounded-lg p-2">
                                                        <MapPin className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-semibold">Location</p>
                                                        <p className="text-sm font-semibold text-gray-900">{selectedSchoolDetails.location}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="border border-green-600 rounded-lg p-2">
                                                        <Users className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-semibold">Students</p>
                                                        <p className="text-sm font-semibold text-gray-900">{selectedSchoolDetails.student_population}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="border border-purple-600 rounded-lg p-2">
                                                        <BookOpen className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-semibold">Rooms</p>
                                                        <p className="text-sm font-semibold text-gray-900">{selectedSchoolDetails.number_of_rooms}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="border border-yellow-600 rounded-lg p-2">
                                                        <User className="w-4 h-4 text-yellow-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-semibold">Head Teacher</p>
                                                        <p className="text-sm font-semibold text-gray-900">{selectedSchoolDetails.head_teacher}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="border border-red-600 rounded-lg p-2">
                                                        <Mail className="w-4 h-4 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-semibold">Email</p>
                                                        <p className="text-sm font-semibold text-gray-900 break-all">{selectedSchoolDetails.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="border border-indigo-600 rounded-lg p-2">
                                                        <Phone className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-semibold">Phone</p>
                                                        <p className="text-sm font-semibold text-gray-900">{selectedSchoolDetails.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>

                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 border border-gray-200 flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Cancel</span>
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl border border-green-700"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Creating...</span>
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Created Successfully!</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Create Prediction</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {selectedSchool && (
                            <div className="mt-6 bg-white rounded-xl p-5 border border-blue-200">
                                <div className="flex items-start gap-3">
                                    <div className="border border-blue-600 rounded-full p-2 mt-1">
                                        <AlertCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-1">Ready to Generate</p>
                                        <p className="text-sm text-gray-600">
                                            Clicking **'Create Prediction'** will analyze the selected school's capacity and generate infrastructure predictions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}