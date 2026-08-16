import axiosClient from "./axiosClient";
import { INITIAL_CATEGORIES } from "../data/mockData";

function getStoredCategories() {
    try {
        const stored = localStorage.getItem("phonestore_all_categories");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn("Could not load categories", e);
    }
    return INITIAL_CATEGORIES;
}

function saveStoredCategories(categories) {
    try {
        localStorage.setItem("phonestore_all_categories", JSON.stringify(categories));
    } catch (e) {
        console.warn("Could not save categories", e);
    }
}

const categoryApi = {
    async getAll() {
        try {
            const res = await axiosClient.get("/Category");
            if (Array.isArray(res.data) && res.data.length > 0) return res;
            return { data: getStoredCategories() };
        } catch {
            return { data: getStoredCategories() };
        }
    },

    async getById(id) {
        try {
            const res = await axiosClient.get(`/Category/${id}`);
            if (res.data) return res;
            const categories = getStoredCategories();
            const found = categories.find(c => c.categoryId === Number(id)) || categories[0];
            return { data: found };
        } catch {
            const categories = getStoredCategories();
            const found = categories.find(c => c.categoryId === Number(id)) || categories[0];
            return { data: found };
        }
    },

    async create(data) {
        try {
            return await axiosClient.post("/Category", data);
        } catch {
            const categories = getStoredCategories();
            const newCat = {
                categoryId: Date.now(),
                categoryName: data.categoryName,
                description: data.description || ""
            };
            categories.push(newCat);
            saveStoredCategories(categories);
            return { data: newCat };
        }
    },

    async update(data) {
        try {
            return await axiosClient.put(
                `/Category/${data.categoryId}`,
                data
            );
        } catch {
            const categories = getStoredCategories();
            const index = categories.findIndex(c => c.categoryId === Number(data.categoryId));
            if (index !== -1) {
                categories[index] = { ...categories[index], ...data };
                saveStoredCategories(categories);
            }
            return { data };
        }
    },

    async delete(id) {
        try {
            return await axiosClient.delete(`/Category/${id}`);
        } catch {
            let categories = getStoredCategories();
            categories = categories.filter(c => c.categoryId !== Number(id));
            saveStoredCategories(categories);
            return { data: { message: "Đã xóa danh mục thành công" } };
        }
    }
};

export default categoryApi;