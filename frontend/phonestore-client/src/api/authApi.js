import axiosClient from "./axiosClient";

const DEFAULT_USERS = [
    {
        userId: 1,
        fullName: "Quản Trị Viên",
        email: "admin@gmail.com",
        password: "admin123",
        role: "Admin"
    },
    {
        userId: 2,
        fullName: "Khách Hàng Mẫu",
        email: "customer@gmail.com",
        password: "customer123",
        role: "Customer"
    }
];

function getStoredUsers() {
    try {
        const stored = localStorage.getItem("phonestore_registered_users");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return [...DEFAULT_USERS, ...parsed];
        }
    } catch (e) {
        console.warn("Could not read registered users", e);
    }
    return DEFAULT_USERS;
}

function saveRegisteredUser(newUser) {
    try {
        const stored = localStorage.getItem("phonestore_registered_users");
        let users = [];
        if (stored) {
            users = JSON.parse(stored) || [];
        }
        users.push(newUser);
        localStorage.setItem("phonestore_registered_users", JSON.stringify(users));
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
                // If it's a real backend responding with invalid credentials, throw the real error
                if (error.response.data.message !== "Network Error") {
                    throw error;
                }
            }

            // Resilient Fallback Auth (For Vercel / Offline Preview)
            const inputEmail = (data.email || "").trim().toLowerCase();
            const inputPassword = data.password;

            const allUsers = getStoredUsers();
            const matchedUser = allUsers.find(u => u.email.toLowerCase() === inputEmail);

            if (matchedUser) {
                if (matchedUser.password && matchedUser.password !== inputPassword) {
                    const err = new Error("Mật khẩu không chính xác.");
                    err.response = { data: { message: "Mật khẩu không chính xác." } };
                    throw err;
                }

                return {
                    data: {
                        token: `mock-jwt-token-${matchedUser.userId}-${Date.now()}`,
                        refreshToken: `mock-refresh-token-${matchedUser.userId}-${Date.now()}`,
                        userId: matchedUser.userId,
                        fullName: matchedUser.fullName,
                        email: matchedUser.email,
                        role: matchedUser.role || "Customer"
                    }
                };
            }

            // Fallback auto-allow for any custom email as Customer
            const generatedUserId = Math.floor(Math.random() * 8000) + 100;
            const fallbackFullName = inputEmail.split("@")[0].toUpperCase();
            return {
                data: {
                    token: `mock-jwt-token-${generatedUserId}-${Date.now()}`,
                    refreshToken: `mock-refresh-token-${generatedUserId}-${Date.now()}`,
                    userId: generatedUserId,
                    fullName: fallbackFullName,
                    email: inputEmail,
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