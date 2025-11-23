import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Loader2,
    CheckCircle,
    ArrowLeft,
    MapPin,
    Building2,
    Users,
    TrendingUp,
    Save,
    AlertCircle,
} from "lucide-react";
import { schoolService, predictionService, predictionReportService, getCurrentUser } from "../../api";
import html2pdf from "html2pdf.js";

export default function CreatePredictionByLocation() {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [schoolsInLocation, setSchoolsInLocation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await schoolService.getAllSchools();
                const allSchools = res.data || [];
                const uniqueLocations = [...new Set(allSchools.map((s) => s.location))];
                setLocations(uniqueLocations);
            } catch (error) {
                console.error("Error fetching locations:", error);
                toast.error("Failed to load locations.");
            }
        };
        fetchLocations();
    }, []);

    const handleLocationChange = async (e) => {
        const location = e.target.value;
        setSelectedLocation(location);
        if (!location) return setSchoolsInLocation([]);
        try {
            const res = await schoolService.getAllSchools();
            const filtered = res.data.filter((s) => s.location === location);
            setSchoolsInLocation(filtered);
        } catch (error) {
            console.error("Error fetching schools by location:", error);
            toast.error("Failed to filter schools.");
        }
    };

    const generateReportHTML = (predictions) => {

        // Convert any value to a clean number
        const toNumber = (val) => {
            return Number(String(val || "0").replace(/[^0-9.-]/g, ""));
        };

        // Calculate totals safely
        const totalRequiredRooms = predictions.reduce(
            (sum, p) => sum + toNumber(p.required_rooms),
            0
        );

        const totalRoomsToBuild = predictions.reduce(
            (sum, p) => sum + toNumber(p.rooms_to_build),
            0
        );

        const totalBudget = predictions.reduce(
            (sum, p) => sum + toNumber(p.estimated_budget),
            0
        );

        return `
          <!DOCTYPE html>
          <html>
            <head>
              <title>School Predictions Report - ${selectedLocation}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  color: #000;
                  line-height: 1.4;
                  background: white;
                }
                .container {
                  max-width: 1200px;
                  margin: 0 auto;
                  background: white;
                  border: 2px solid #000;
                }
                .header {
                  background: #f5f5f5;
                  color: #000;
                  padding: 30px;
                  text-align: center;
                }
                .system-info h1 {
                  margin: 0;
                  font-size: 28px;
                  font-weight: bold;
                  text-transform: uppercase;
                }
                .system-info p {
                  margin: 5px 0;
                  font-size: 14px;
                }
                .report-title {
                  font-size: 20px;
                  font-weight: bold;
                  margin: 20px 0 10px 0;
                  text-transform: uppercase;
                }
                .report-date {
                  font-size: 12px;
                }
                .content {
                  padding: 20px;
                }
                .table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 15px;
                  border: 2px solid #000;
                }
                .table th, .table td {
                  border: 1px solid #000;
                  padding: 10px 8px;
                  text-align: left;
                  font-size: 11px;
                }
                .table th {
                  background: #f5f5f5;
                  font-weight: bold;
                  text-transform: uppercase;
                }
                .table tr:nth-child(even) {
                  background: #fafafa;
                }
    
                /* Summary Section */
                .summary-box {
                  margin-top: 20px;
                  padding: 15px;
                  border: 2px solid #000;
                  background: #f9f9f9;
                  font-size: 14px;
                }
                .summary-title {
                  font-weight: bold;
                  margin-bottom: 10px;
                  font-size: 16px;
                  text-transform: uppercase;
                }
                .summary-item {
                  margin: 4px 0;
                }
    
                .footer {
                  margin-top: 10px;
                  padding: 10px;
                  background: #f5f5f5;
                }
                .signature-section {
                  padding-top: 10px;
                  margin-top: 10px;
                }
                .signature-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 60px;
                }
                .signature-line {
                  border-bottom: 1px solid #000;
                  margin: 40px 0 10px 0;
                }
                .signature-label {
                  font-weight: bold;
                  font-size: 12px;
                  text-transform: uppercase;
                }
                @media print {
                  body { background: white !important; }
                  .container { border: none; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="system-info">
                    <h1>School Infrastructure Predictions</h1>
                    <p>Predictions for Schools in ${selectedLocation}</p>
                  </div>
                  <div class="report-title">School Predictions Report</div>
                  <div class="report-date">
                    Generated on ${new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })}
                  </div>
                </div>
    
                <div class="content">
    
                  <!-- TABLE -->
                  <table class="table">
                    <thead>
                      <tr>
                        <th>School Name</th>
                        <th>Location</th>
                        <th>Students</th>
                        <th>Required Rooms</th>
                        <th>Rooms to Build</th>
                        <th>Budget (RWF)</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${predictions
                .map(
                    (pred) => `
                              <tr>
                                <td>${pred.school?.name || "N/A"}</td>
                                <td>${pred.school?.location || "N/A"}</td>
                                <td>${toNumber(pred.school?.student_population)}</td>
                                <td>${toNumber(pred.required_rooms)}</td>
                                <td>${toNumber(pred.rooms_to_build)}</td>
                                <td>${toNumber(pred.estimated_budget).toLocaleString()}</td>
                              </tr>
                          `
                )
                .join("")}
                    </tbody>
                  </table>
    
                  <!-- SUMMARY SECTION -->
                  <div class="summary-box">
                    <div class="summary-title">Summary</div>
                    <div class="summary-item">Total Required Rooms: <strong>${totalRequiredRooms}</strong></div>
                    <div class="summary-item">Total Rooms to Build: <strong>${totalRoomsToBuild}</strong></div>
                    <div class="summary-item">Total Estimated Budget: <strong>${totalBudget.toLocaleString()} RWF</strong></div>
                  </div>
    
                </div>
    
                <div class="footer">
                  <div class="signature-section">
                    <div class="signature-grid">
                      <div style="text-align: center;">
                        <div class="signature-line"></div>
                        <div class="signature-label">System Administrator</div>
                        <div style="font-size: 10px;">School Management System</div>
                        <div style="font-size: 10px;">Date: ${new Date().toLocaleDateString("en-US")}</div>
                      </div>
                      <div style="text-align: center;">
                        <div class="signature-line"></div>
                        <div class="signature-label">Education Officer</div>
                        <div style="font-size: 10px;">Infrastructure Planning</div>
                        <div style="font-size: 10px;">Date: _________________</div>
                      </div>
                    </div>
                  </div>
                </div>
    
              </div>
            </body>
          </html>
          `;
    };
    const generateAndSavePDF = async (predictions) => {
        try {
            const htmlContent = generateReportHTML(predictions);
            const opt = {
                margin: 10,
                filename: `School_Predictions_Report_${selectedLocation}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            };
            const pdfBlob = await html2pdf()
                .from(htmlContent)
                .set(opt)
                .output("blob");
            const saveResult = await predictionReportService.create(
                selectedLocation,
                pdfBlob,
                getCurrentUser().id
            );

            if (saveResult.success) {
                setSuccess(true);
                toast.success("Predictions created and PDF report saved successfully!");
                setTimeout(() => navigate("/main/predictions/list"), 1000);
            } else {
                toast.error("Failed to save PDF report");
            }
        } catch (error) {
            console.error("Error generating or saving PDF:", error);
            toast.error("Failed to generate or save PDF report.");
        }
    };

    const handleSubmit = async (e) => {
        const userdata = getCurrentUser();
        e.preventDefault();
        if (!selectedLocation) {
            toast.error("Please select a location first.");
            return;
        }
        if (schoolsInLocation.length === 0) {
            toast.warn("No schools found in this location.");
            return;
        }
        setIsLoading(true);
        setSuccess(false);
        try {
            for (const school of schoolsInLocation) {
                await predictionService.create({
                    school_id: school.id,
                    created_by: userdata.id,
                });
            }
            const predictionsResult = await predictionService.getAllPredictions();
            if (predictionsResult.success) {
                const schoolIds = schoolsInLocation.map((s) => s.id);
                const relevantPredictions = predictionsResult.data.filter((pred) =>
                    schoolIds.includes(pred.school?.id)
                );
                await generateAndSavePDF(relevantPredictions);
            }
        } catch (error) {
            console.error("Error creating predictions:", error);
            toast.error("Failed to create predictions.");
        } finally {
            setIsLoading(false);
        }
    };

    const totalStudents = schoolsInLocation.reduce((sum, school) => sum + (school.student_population || 0), 0);

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="border border-blue-600 rounded-2xl p-4 shadow-lg">
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Create Predictions by Location</h1>
                            <p className="text-gray-600 mt-1">Generate predictions for all schools in a specific location</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="mb-8">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    Location (Sector)
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedLocation}
                                    onChange={handleLocationChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                    required
                                >
                                    <option value="">-- Select Location --</option>
                                    {locations.map((loc, index) => (
                                        <option key={index} value={loc}>
                                            {loc}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {selectedLocation && schoolsInLocation.length > 0 && (
                            <div className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="bg-white rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 mb-1">Total Schools</p>
                                                <p className="text-3xl font-bold text-gray-900">{schoolsInLocation.length}</p>
                                            </div>
                                            <div className="bg-blue-100 rounded-full p-4">
                                                <Building2 className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-6 border border-green-200 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                                                <p className="text-3xl font-bold text-gray-900">{totalStudents.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-green-100 rounded-full p-4">
                                                <Users className="w-6 h-6 text-green-600" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
                                                <p className="text-lg font-bold text-gray-900">{selectedLocation}</p>
                                            </div>
                                            <div className="bg-purple-100 rounded-full p-4">
                                                <MapPin className="w-6 h-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                            Schools in {selectedLocation}
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-3">
                                            {schoolsInLocation.map((school) => (
                                                <div key={school.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="border border-blue-600 rounded-lg p-2">
                                                            <Building2 className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{school.name}</p>
                                                            <p className="text-sm text-gray-500">{school.location}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Users className="w-4 h-4" />
                                                        <span className="font-medium">{school.student_population || 0} students</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedLocation && schoolsInLocation.length === 0 && (
                            <div className="mb-8">
                                <div className="bg-white rounded-xl p-8 border border-yellow-200">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="border border-yellow-600 rounded-full p-4 mb-4">
                                            <AlertCircle className="w-8 h-8 text-yellow-600" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 mb-2">No Schools Found</p>
                                        <p className="text-gray-600">There are no schools registered in this location yet.</p>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                disabled={isLoading || !selectedLocation || schoolsInLocation.length === 0}
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
                                        <span>Created!</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Create Predictions</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {selectedLocation && schoolsInLocation.length > 0 && (
                            <div className="mt-6 bg-white rounded-xl p-5 border border-blue-200">
                                <div className="flex items-start gap-3">
                                    <div className="border border-blue-600 rounded-full p-2 mt-1">
                                        <AlertCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-1">Important Information</p>
                                        <p className="text-sm text-gray-600">
                                            Clicking "Create Predictions" will generate predictions for all {schoolsInLocation.length} schools.
                                            The report will be saved to the database as a PDF.
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
