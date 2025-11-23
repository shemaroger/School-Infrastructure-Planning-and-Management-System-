import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user_data");
        }
        return Promise.reject(error);
    }
);

const handleError = (error) => {
    if (error.response) {
        const { status, data } = error.response;
        return {
            success: false,
            message: data.error || data.message || "Something went wrong",
            details: data,
            status,
        };
    } else if (error.request) {
        return {
            success: false,
            message: "Network error. Please check your internet connection.",
            status: 0,
        };
    } else {
        return {
            success: false,
            message: error.message || "Unexpected error occurred",
            status: 0,
        };
    }
};

export const authService = {
    async register(userData) {
        try {
            const response = await api.post("/register/", userData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    async login(email, password) {
        try {
            const response = await api.post('/login/', { email, password });
            const { token, user } = response.data;

            if (token?.access) {
                localStorage.setItem('access_token', token.access);
                localStorage.setItem('refresh_token', token.refresh);
                localStorage.setItem('user_data', JSON.stringify(user));
            }

            return { success: true, data: user };
        } catch (error) {
            return { success: false, error: handleError(error) };
        }
    },

    async logout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_data");
        return { success: true };
    },
};

export const userService = {
    async list() {
        try {
            const response = await api.get("/users/");
            return { success: true, data: response.data };
        } catch (error) {
            const errorResult = handleError(error);
            return errorResult;
        }
    },

    async getById(userid) {
        try {
            const response = await api.get(`/users/detail/${userid}/`);
            return { success: true, data: response.data };
        } catch (error) {
            const errorResult = handleError(error);
            return errorResult;
        }
    },

    async create(userData) {
        try {
            const response = await api.post("/register/", userData);
            return { success: true, data: response.data };
        } catch (error) {
            const errorResult = handleError(error);
            return errorResult;
        }
    },

    async update(userId, userData) {
        try {
            const response = await api.put(`/users/${userId}/`, userData);
            return { success: true, data: response.data };
        } catch (error) {
            const errorResult = handleError(error);
            return errorResult;
        }
    },

    async delete(userId) {
        try {
            const response = await api.delete(`/users/${userId}/`);
            return { success: true, data: response.data };
        } catch (error) {
            const errorResult = handleError(error);
            return errorResult;
        }
    },
};

export const schoolService = {
    async getAllSchools() {
        try {
            const response = await api.get("/schools/");
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    async getById(schoolId) {
        try {
            const response = await api.get(`/schools/detail/${schoolId}/`);
            return { success: true, data: response.data };
        } catch (error) {
            const errorResult = handleError(error);
            return errorResult;
        }
    },

    async create(schoolData) {
        try {
            const response = await api.post("/schools/", schoolData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    async update(schoolId, schoolData) {
        try {
            const response = await api.put(`/schools/${schoolId}/`, schoolData);
            return { success: true, data: response.data };
        } catch (error) {
            const errorResult = handleError(error);
            return errorResult;
        }
    },
};

export const predictionService = {
    async getAllPredictions() {
        try {
            const response = await api.get("/predictions/");
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    async create(predictionData) {
        try {
            const response = await api.post("/predictions/", predictionData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },
};

export const predictionReportService = {

    async create(location, pdfBlob, created_by) {
        const formData = new FormData();
        formData.append("location", location);
        formData.append("document", pdfBlob, `School_Predictions_Report_${location}.pdf`);
        formData.append("created_by", created_by);

        const response = await api.post("/prediction-reports/upload/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    async sendToMineduc(reportId) {
        try {
            const response = await api.post(`/send-to-mineduc/${reportId}/`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    async approve(id) {
        try {
            const response = await api.post(`/prediction-reports/mineduc/approve/${id}/`);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },
    async deny(id, reason) {
        try {
            const response = await api.post(`/prediction-reports/mineduc/deny/${id}/`, {
                reason: reason
            });
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },





    async saveHtml(location, htmlContent, createdBy) {
        try {
            const response = await api.post('/prediction-reports/save-html/', {
                location,
                html_content: htmlContent,
                created_by: createdBy,
            });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    async getAll(locationFilter = null) {
        try {
            const params = locationFilter ? { location: locationFilter } : {};
            const response = await api.get('/prediction-reports/', { params });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    async getById(id) {
        try {
            const response = await api.get(`/prediction-reports/${id}/`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    async getByLocation(location) {
        try {
            const response = await api.get(`/prediction-reports/by-location/${location}/`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    async delete(id) {
        try {
            const response = await api.delete(`/prediction-reports/${id}/`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
};

export const projectService = {
    async list() {
        try {
            const response = await api.get("/projects/");
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    async create(projectData) {
        try {
            const response = await api.post("/projects/", projectData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },
};

export const budgetService = {
    async list() {
        try {
            const response = await api.get("/budget-tracking/");
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    async create(budgetData) {
        try {
            const response = await api.post("/budget-tracking/", budgetData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },
};

export const notificationService = {
    async getAllNotifications() {
        const res = await api.get("/notifications/");
        return { success: true, data: res.data };
    },

    async sendNotification(data) {
        try {
            const res = await api.post("/notifications/", data);
            return { success: true, data: res.data };
        } catch (error) {
            console.error("Error sending notification:", error);
            return { success: false, error };
        }
    },
};

export const summaryService = {
    async getDistrictSummary(umurengeId) {
        try {
            const response = await api.get(`/district-summary/?umurenge=${umurengeId}`);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },
};

export const getCurrentUser = () => {
    const userData = localStorage.getItem("user_data");
    if (!userData) return null;
    try {
        return JSON.parse(userData);
    } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
    }
};