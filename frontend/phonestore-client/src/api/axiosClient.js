import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5055/api";

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request Interceptor: Attach JWT Bearer token
axiosClient.interceptors.request.use(
    config => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        } else {
            config.headers["Content-Type"] = "application/json";
        }

        return config;
    },
    error => Promise.reject(error)
);

// Response Interceptor: Auto Refresh Token on 401
axiosClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If not 401 or request already retried, pass error through
        if (!error.response || error.response.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Avoid infinite loop if refresh token endpoint itself fails
        if (originalRequest.url?.includes("/Auth/refresh-token") || originalRequest.url?.includes("/Auth/login")) {
            return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            // No refresh token available, logout
            handleSessionExpired();
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // If already refreshing, queue this request until refresh finishes
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                })
                .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Call refresh-token endpoint directly via axios to avoid interceptor loop
            const response = await axios.post(`${API_BASE_URL}/Auth/refresh-token`, {
                refreshToken: refreshToken
            });

            const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem("token", newAccessToken);
            if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
            }

            axiosClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            return axiosClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            handleSessionExpired();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

function handleSessionExpired() {
    const hasToken = localStorage.getItem("token");
    if (hasToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("fullName");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
            window.location.href = "/login?expired=1";
        }
    }
}

export default axiosClient;