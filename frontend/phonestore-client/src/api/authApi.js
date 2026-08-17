import axiosClient from "./axiosClient";
import { INITIAL_USERS } from "../data/mockData";

const DEFAULT_USERS = INITIAL_USERS;

function getStoredUsers() {
    try {
        const storedAll = localStorage.getItem("phonestore_all_users");
        const storedRegistered = localStorage.getItem("phonestore_registered_users");
        
        let usersMap = new Map();
        
        // 1. Initial base users (Admin & Customer mẫu)
        DEFAULT_USERS.forEach(u => usersMap.set(u.userId, u));
        
        // 2. All users in storage
        if (storedAll) {
            const parsed = JSON.parse(storedAll);
            if (Array.isArray(parsed)) {
                parsed.forEach(u => usersMap.set(u.userId, u));
            }
        }
        
        // 3. Registered users
        if (storedRegistered) {
            const parsed = JSON.parse(storedRegistered);
            if (Array.isArray(parsed)) {
                parsed.forEach(u => usersMap.set(u.userId, u));
            }
        }
        
        return Array.from(usersMap.values());
    } catch (e) {
        console.warn("Could not read stored users", e);
    }
    return DEFAULT_USERS;
}

function saveRegisteredUser(newUser) {
    try {
        // Save to registered users collection
        const stored = localStorage.getItem("phonestore_registered_users");
        let users = [];
        if (stored) {
            users = JSON.parse(stored) || [];
        }
        const existingIdx = users.findIndex(u => u.userId === newUser.userId || u.email === newUser.email);
        if (existingIdx !== -1) {
            users[existingIdx] = { ...users[existingIdx], ...newUser };
        } else {
            users.push(newUser);
        }
        localStorage.setItem("phonestore_registered_users", JSON.stringify(users));

        // Also sync to phonestore_all_users
        const storedAll = localStorage.getItem("phonestore_all_users");
        let allUsers = storedAll ? JSON.parse(storedAll) : [...DEFAULT_USERS];
        if (!Array.isArray(allUsers)) allUsers = [...DEFAULT_USERS];
        const allIdx = allUsers.findIndex(u => u.userId === newUser.userId || u.email === newUser.email);
        if (allIdx !== -1) {
            allUsers[allIdx] = { ...allUsers[allIdx], ...newUser };
        } else {
            allUsers.push(newUser);
        }
        localStorage.setItem("phonestore_all_users", JSON.stringify(allUsers));
    } catch (e) {
        console.warn("Could not save registered user", e);
    }
}

const authApi = {
    async login(data) {
        try {
            const res = await axiosClient.post("/Auth/login", data);
            return res;
        } catch (error) {
            // If backend returned a specific 400 error message (like wrong password), pass it through
            if (error.response && error.response.status === 400 && error.response.data?.message) {
                if (error.response.data.message !== "Network Error") {
                    throw error;
                }
            }

            // Resilient Fallback Auth (For Vercel / Offline Preview)
            const inputEmail = (data.email || "").trim().toLowerCase();
            const inputPassword = data.password;

            const allUsers = getStoredUsers();
            const matchedUser = allUsers.find(u => (u.email || "").toLowerCase() === inputEmail);

            if (matchedUser) {
                if (matchedUser.password && matchedUser.password !== inputPassword) {
                    const err = new Error("Mật khẩu không chính xác.");
                    err.response = { data: { message: "Mật khẩu không chính xác." } };
                    throw err;
                }

                // Check for user-specific isolated profile updates
                let userProfile = null;
                try {
                    const savedProf = localStorage.getItem(`phonestore_profile_${matchedUser.userId}`);
                    if (savedProf) userProfile = JSON.parse(savedProf);
                } catch {}

                const resolvedFullName = userProfile?.fullName || matchedUser.fullName || "";
                const resolvedPhone = userProfile?.phone !== undefined ? userProfile.phone : (matchedUser.phone || "");
                const resolvedAddress = userProfile?.address !== undefined ? userProfile.address : (matchedUser.address || "");

                return {
                    data: {
                        token: `mock-jwt-token-${matchedUser.userId}-${Date.now()}`,
                        refreshToken: `mock-refresh-token-${matchedUser.userId}-${Date.now()}`,
                        userId: matchedUser.userId,
                        fullName: resolvedFullName,
                        email: matchedUser.email,
                        phone: resolvedPhone,
                        address: resolvedAddress,
                        role: matchedUser.role || "Customer"
                    }
                };
            }

            // Fallback for custom email login without prior registration
            const generatedUserId = Math.floor(Math.random() * 8000) + 100;
            const fallbackFullName = inputEmail.split("@")[0].toUpperCase();
            const createdFallbackUser = {
                userId: generatedUserId,
                fullName: fallbackFullName,
                email: inputEmail,
                password: inputPassword,
                phone: "",
                address: "",
                role: "Customer",
                createdAt: new Date().toISOString()
            };
            saveRegisteredUser(createdFallbackUser);

            return {
                data: {
                    token: `mock-jwt-token-${generatedUserId}-${Date.now()}`,
                    refreshToken: `mock-refresh-token-${generatedUserId}-${Date.now()}`,
                    userId: generatedUserId,
                    fullName: fallbackFullName,
                    email: inputEmail,
                    phone: "",
                    address: "",
                    role: "Customer"
                }
            };
        }
    },

    async register(data) {
        try {
            const res = await axiosClient.post("/Auth/register", data);
            return res;
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data?.message) {
                if (error.response.data.message !== "Network Error") {
                    throw error;
                }
            }

            // Resilient Fallback Register (Stores user in local memory)
            const newUserId = Math.floor(Math.random() * 8000) + 100;
            const newUser = {
                userId: newUserId,
                fullName: data.fullName,
                email: (data.email || "").trim().toLowerCase(),
                password: data.password,
                phone: "",
                address: "",
                role: "Customer",
                createdAt: new Date().toISOString()
            };

            saveRegisteredUser(newUser);

            return {
                data: {
                    message: "Đăng ký tài khoản thành công!",
                    userId: newUserId
                }
            };
        }
    },

    async refreshToken(refreshToken) {
        try {
            return await axiosClient.post("/Auth/refresh-token", { refreshToken });
        } catch {
            return {
                data: {
                    token: `mock-refreshed-token-${Date.now()}`,
                    refreshToken: `mock-refreshed-refresh-token-${Date.now()}`
                }
            };
        }
    },

    async revokeToken(refreshToken) {
        try {
            return await axiosClient.post("/Auth/revoke-token", { refreshToken });
        } catch {
            return { data: { message: "Token revoked" } };
        }
    }
};

export default authApi;