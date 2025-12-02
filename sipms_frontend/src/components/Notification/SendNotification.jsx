import { useState } from "react";
import { Send, Building2, MapPin } from "lucide-react";
import { notificationService, getCurrentUser } from "../../api";
import { toast } from "react-toastify";

export default function SendNotificationPage() {
    const [recipientType, setRecipientType] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const user = getCurrentUser();

    const sendNotification = async () => {
        if (!recipientType) {
            toast.error("Please choose where to send notification");
            return;
        }

        if (!message.trim()) {
            toast.error("Please type a message");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                role: recipientType,
                message,
                sender: user.role
            };

            const res = await notificationService.sendNotification(payload);

            if (res.success) {
                toast.success("Notification sent successfully!");
                setRecipientType("");
                setMessage("");
            } else {
                toast.error("Failed to send notification");
            }
        } catch (error) {
            console.error("Notification error:", error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <Send className="w-7 h-7 text-green-600" />
                    Send Notification
                </h1>

                <p className="text-gray-600 mb-8">
                    Choose where to send a notification and write your custom message.
                </p>

                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                        Send To:
                    </label>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setRecipientType("UMURENGE")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${recipientType === "UMURENGE"
                                ? "bg-blue-600 text-white border-green-600"
                                : "border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            <MapPin className="w-5 h-5" />
                            UMURENGE
                        </button>

                        <button
                            onClick={() => setRecipientType("MINEDUC")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${recipientType === "MINEDUC"
                                ? "bg-green-600 text-white border-green-600"
                                : "border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            <Building2 className="w-5 h-5" />
                            MINEDUC
                        </button>
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                        Message:
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows="5"
                        placeholder="Type message here..."
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
                <button
                    onClick={sendNotification}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-green-800 to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    <Send className="w-5 h-5" />
                    {isLoading ? "Sending..." : "Send Notification"}
                </button>
            </div>
        </div>
    );
}
