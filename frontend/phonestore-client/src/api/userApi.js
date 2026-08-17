import axiosClient from "./axiosClient";
import { INITIAL_USERS } from "../data/mockData";

function getStoredUsers() {
    try {
        const storedAll = localStorage.getItem("phonestore_all_users");
        const storedRegistered = localStorage.getItem("phonestore_registered_users");

        let usersMap = new Map();

        // 1. Initial base users
        INITIAL_USERS.forEach(u => usersMap.set(Number(u.userId), u));

        // 2. All stored users
        if (storedAll) {
            const parsed = JSON.parse(storedAll);
            if (Array.isArray(parsed)) {
                parsed.forEach(u => usersMap.set(Number(u.userId), u));
            }
        }

        // 3. Registered users
        if (storedRegistered) {
            const parsed = JSON.parse(storedRegistered);
            if (Array.isArray(parsed)) {
                parsed.forEach(u => usersMap.set(Number(u.userId), u));
            }
        }

        return Array.from(usersMap.values());
    } catch (e) {
        console.warn("Could not load users", e);
    }
    return INITIAL_USERS;
}

function saveStoredUsers(users) {
    try {
        localStorage.setItem("phonestore_all_users", JSON.stringify(users));
    } catch (e) {
        console.warn("Could not save users", e);
    }
}

const userApi = {
    async getAll() {
        try {
            const res = await axiosClient.get("/User");
            if (Array.isArray(res.data) && res.data.length > 0) return res;
            return { data: getStoredUsers() };
        } catch {
            return { data: getStoredUsers() };
        }
    },

    async getById(id) {
        try {
            const res = await axiosClient.get(`/User/${id}`);
            if (res.data && res.data.userId) return res;
        } catch {
            // Fallback to local storage below
        }

        const users = getStoredUsers();
        const found = users.find(u => Number(u.userId) === Number(id));

        // Check if there is an isolated profile for this user ID
        let userProfile = null;
        try {
            const savedProf = localStorage.getItem(`phonestore_profile_${id}`);
            if (savedProf) userProfile = JSON.parse(savedProf);
        } catch {}

        if (found) {
            return {
                data: {
                    ...found,
                    fullName: userProfile?.fullName || found.fullName || "",
                    email: userProfile?.email || found.email || "",
                    phone: userProfile?.phone !== undefined ? userProfile.phone : (found.phone || ""),
                    address: userProfile?.address !== undefined ? userProfile.address : (found.address || "")
                }
            };
        }

        // If user is the currently logged-in user in localStorage
        const currentUserId = localStorage.getItem("userId");
        if (String(currentUserId) === String(id)) {
            return {
                data: {
                    userId: Number(id),
                    fullName: userProfile?.fullName || localStorage.getItem("fullName") || "Khách Hàng",
                    email: userProfile?.email || localStorage.getItem("email") || "",
                    phone: userProfile?.phone !== undefined ? userProfile.phone : (localStorage.getItem("phone") || ""),
                    address: userProfile?.address !== undefined ? userProfile.address : (localStorage.getItem("address") || ""),
                    role: localStorage.getItem("role") || "Customer",
                    createdAt: new Date().toISOString()
                }
            };
        }

        // Return clean empty user object (NEVER fallback to users[0] admin!)
        return {
            data: {
                userId: Number(id),
                fullName: "",
                email: "",
                phone: "",
                address: "",
                role: "Customer"
            }
        };
    },

    async create(data) {
        try {
            return await axiosClient.post("/User", data);
        } catch {
            const users = getStoredUsers();
            const newUserId = Date.now();
            const newUser = {
                userId: newUserId,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone || "",
                address: data.address || "",
                role: data.role || "Customer",
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
            saveStoredUsers(users);
            return { data: newUser };
        }
    },

    async update(data) {
        try {
            return await axiosClient.put(`/User/${data.userId}`, data);
        } catch {
            const targetId = Number(data.userId);
            const users = getStoredUsers();
            const index = users.findIndex(u => Number(u.userId) === targetId);

            const updatedUser = {
                userId: targetId,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone !== undefined && data.phone !== null ? data.phone : "",
                address: data.address !== undefined && data.address !== null ? data.address : "",
                role: data.role || (index !== -1 ? users[index].role : "Customer"),
                createdAt: index !== -1 ? users[index].createdAt : new Date().toISOString()
            };

            if (index !== -1) {
                users[index] = { ...users[index], ...updatedUser };
            } else {
                users.push(updatedUser);
            }
            saveStoredUsers(users);

            // Save isolated profile for this specific user ID
            localStorage.setItem(`phonestore_profile_${targetId}`, JSON.stringify(updatedUser));

            return { data: updatedUser };
        }
    },

    async delete(id) {
        try {
            return await axiosClient.delete(`/User/${id}`);
        } catch {
            let users = getStoredUsers();
            users = users.filter(u => Number(u.userId) !== Number(id));
            saveStoredUsers(users);
            localStorage.removeItem(`phonestore_profile_${id}`);
            return { data: { message: "Đã xóa người dùng thành công" } };
        }
    }
};

export default userApi;