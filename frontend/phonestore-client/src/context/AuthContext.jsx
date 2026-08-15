import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const userId = localStorage.getItem("userId");
        // Legacy cleanup if exists
        localStorage.removeItem("userAvatar");
        const userAvatar = userId ? (localStorage.getItem(`userAvatar_${userId}`) || "") : "";

        return {
            token,
            refreshToken: localStorage.getItem("refreshToken"),
            userId,
            fullName: localStorage.getItem("fullName"),
            email: localStorage.getItem("email"),
            role: localStorage.getItem("role"),
            avatar: userAvatar
        };
    });

    function login(data) {
        if (data.token) localStorage.setItem("token", data.token);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        if (data.userId) localStorage.setItem("userId", data.userId);
        if (data.fullName) localStorage.setItem("fullName", data.fullName);
        if (data.email) localStorage.setItem("email", data.email);
        if (data.role) localStorage.setItem("role", data.role);

        const userId = data.userId || localStorage.getItem("userId");
        let avatar = data.avatar;
        if (avatar !== undefined) {
            if (avatar) {
                localStorage.setItem(`userAvatar_${userId}`, avatar);
            } else {
                localStorage.removeItem(`userAvatar_${userId}`);
            }
        } else {
            avatar = userId ? (localStorage.getItem(`userAvatar_${userId}`) || "") : "";
        }

        setUser({
            token: data.token || localStorage.getItem("token"),
            refreshToken: data.refreshToken || localStorage.getItem("refreshToken"),
            userId,
            fullName: data.fullName || localStorage.getItem("fullName"),
            email: data.email || localStorage.getItem("email"),
            role: data.role || localStorage.getItem("role"),
            avatar: avatar || ""
        });
    }

    function updateAvatar(newAvatarUrl) {
        const userId = user?.userId || localStorage.getItem("userId");
        if (userId) {
            if (newAvatarUrl) {
                localStorage.setItem(`userAvatar_${userId}`, newAvatarUrl);
            } else {
                localStorage.removeItem(`userAvatar_${userId}`);
            }
        }
        setUser(prev => prev ? { ...prev, avatar: newAvatarUrl || "" } : null);
    }

    function updateProfile(updatedData) {
        if (updatedData.fullName) localStorage.setItem("fullName", updatedData.fullName);
        if (updatedData.email) localStorage.setItem("email", updatedData.email);
        if (updatedData.phone) localStorage.setItem("phone", updatedData.phone);
        if (updatedData.address) localStorage.setItem("address", updatedData.address);

        setUser(prev => prev ? { ...prev, ...updatedData } : null);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("fullName");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        localStorage.removeItem("phone");
        localStorage.removeItem("address");
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                updateAvatar,
                updateProfile,
                logout,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}