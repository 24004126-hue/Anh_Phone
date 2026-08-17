import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Tab-isolated session first, then fallback to global localStorage
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) return null;

        const userId = sessionStorage.getItem("userId") || localStorage.getItem("userId");
        const userAvatar = userId ? (localStorage.getItem(`userAvatar_${userId}`) || "") : "";

        return {
            token,
            refreshToken: sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken"),
            userId,
            fullName: sessionStorage.getItem("fullName") || localStorage.getItem("fullName"),
            email: sessionStorage.getItem("email") || localStorage.getItem("email"),
            phone: sessionStorage.getItem("phone") || localStorage.getItem("phone") || "",
            address: sessionStorage.getItem("address") || localStorage.getItem("address") || "",
            role: sessionStorage.getItem("role") || localStorage.getItem("role"),
            avatar: userAvatar
        };
    });

    function login(data) {
        const userId = data.userId || sessionStorage.getItem("userId") || localStorage.getItem("userId");

        // 1. Write to tab-isolated sessionStorage
        if (data.token) sessionStorage.setItem("token", data.token);
        if (data.refreshToken) sessionStorage.setItem("refreshToken", data.refreshToken);
        if (data.userId) sessionStorage.setItem("userId", data.userId);
        if (data.fullName) sessionStorage.setItem("fullName", data.fullName);
        if (data.email) sessionStorage.setItem("email", data.email);
        if (data.role) sessionStorage.setItem("role", data.role);

        // 2. Also sync to localStorage as default backup
        if (data.token) localStorage.setItem("token", data.token);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        if (data.userId) localStorage.setItem("userId", data.userId);
        if (data.fullName) localStorage.setItem("fullName", data.fullName);
        if (data.email) localStorage.setItem("email", data.email);
        if (data.role) localStorage.setItem("role", data.role);

        // Check for isolated profile storage for this user ID
        let savedProfile = null;
        try {
            const p = localStorage.getItem(`phonestore_profile_${userId}`);
            if (p) savedProfile = JSON.parse(p);
        } catch {}

        const resolvedPhone = data.phone !== undefined ? data.phone : (savedProfile?.phone || "");
        const resolvedAddress = data.address !== undefined ? data.address : (savedProfile?.address || "");

        if (resolvedPhone) {
            sessionStorage.setItem("phone", resolvedPhone);
            localStorage.setItem("phone", resolvedPhone);
        } else {
            sessionStorage.removeItem("phone");
            localStorage.removeItem("phone");
        }

        if (resolvedAddress) {
            sessionStorage.setItem("address", resolvedAddress);
            localStorage.setItem("address", resolvedAddress);
        } else {
            sessionStorage.removeItem("address");
            localStorage.removeItem("address");
        }

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
            token: data.token || sessionStorage.getItem("token") || localStorage.getItem("token"),
            refreshToken: data.refreshToken || sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken"),
            userId,
            fullName: data.fullName || sessionStorage.getItem("fullName") || localStorage.getItem("fullName"),
            email: data.email || sessionStorage.getItem("email") || localStorage.getItem("email"),
            phone: resolvedPhone,
            address: resolvedAddress,
            role: data.role || sessionStorage.getItem("role") || localStorage.getItem("role"),
            avatar: avatar || ""
        });
    }

    function updateAvatar(newAvatarUrl) {
        const userId = user?.userId || sessionStorage.getItem("userId") || localStorage.getItem("userId");
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
        const userId = user?.userId || sessionStorage.getItem("userId") || localStorage.getItem("userId");
        if (updatedData.fullName) {
            sessionStorage.setItem("fullName", updatedData.fullName);
            localStorage.setItem("fullName", updatedData.fullName);
        }
        if (updatedData.email) {
            sessionStorage.setItem("email", updatedData.email);
            localStorage.setItem("email", updatedData.email);
        }

        if (updatedData.phone !== undefined) {
            if (updatedData.phone) {
                sessionStorage.setItem("phone", updatedData.phone);
                localStorage.setItem("phone", updatedData.phone);
            } else {
                sessionStorage.removeItem("phone");
                localStorage.removeItem("phone");
            }
        }
        if (updatedData.address !== undefined) {
            if (updatedData.address) {
                sessionStorage.setItem("address", updatedData.address);
                localStorage.setItem("address", updatedData.address);
            } else {
                sessionStorage.removeItem("address");
                localStorage.removeItem("address");
            }
        }

        if (userId) {
            try {
                const existing = localStorage.getItem(`phonestore_profile_${userId}`);
                const parsed = existing ? JSON.parse(existing) : {};
                localStorage.setItem(`phonestore_profile_${userId}`, JSON.stringify({ ...parsed, ...updatedData }));
            } catch {}
        }

        setUser(prev => prev ? { ...prev, ...updatedData } : null);
    }

    function logout() {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("fullName");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("phone");
        sessionStorage.removeItem("address");

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