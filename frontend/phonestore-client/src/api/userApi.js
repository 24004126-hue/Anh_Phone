import axiosClient from "./axiosClient";
import { INITIAL_USERS } from "../data/mockData";

function getStoredUsers() {
    try {
        const stored = localStorage.getItem("phonestore_all_users");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
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
            if (res.data) return res;
            const users = getStoredUsers();
            const found = users.find(u => u.userId === Number(id)) || users[0];
            return { data: found };
        } catch {
            const users = getStoredUsers();
            const found = users.find(u => u.userId === Number(id)) || users[0];
            return { data: found };
        }
    },

    async create(data) {
        try {
            return await axiosClient.post("/User", data);
        } catch {
            const users = getStoredUsers();
            const newUser = {
                userId: Date.now(),
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
            const users = getStoredUsers();
            const index = users.findIndex(u => u.userId === Number(data.userId));
            if (index !== -1) {
                users[index] = {
                    ...users[index],
                    fullName: data.fullName || users[index].fullName,
                    email: data.email || users[index].email,
                    phone: data.phone !== undefined ? data.phone : users[index].phone,
                    address: data.address !== undefined ? data.address : users[index].address,
                    role: data.role || users[index].role
                };
            } else {
                users.push({
                    userId: Number(data.userId),
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone || "",
                    address: data.address || "",
                    role: data.role || "Customer",
                    createdAt: new Date().toISOString()
                });
            }
            saveStoredUsers(users);

            // Also save to single user profile storage
            localStorage.setItem(`phonestore_profile_${data.userId}`, JSON.stringify(data));

            return { data: users.find(u => u.userId === Number(data.userId)) || data };
        }
    },

    async delete(id) {
        try {
            return await axiosClient.delete(`/User/${id}`);
        } catch {
            let users = getStoredUsers();
            users = users.filter(u => u.userId !== Number(id));
            saveStoredUsers(users);
            return { data: { message: "Đã xóa người dùng thành công" } };
        }
    }
};

export default userApi;