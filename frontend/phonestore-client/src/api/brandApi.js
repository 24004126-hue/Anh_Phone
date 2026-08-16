import axiosClient from "./axiosClient";
import { INITIAL_BRANDS } from "../data/mockData";

function getStoredBrands() {
    try {
        const stored = localStorage.getItem("phonestore_all_brands");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn("Could not load brands", e);
    }
    return INITIAL_BRANDS;
}

function saveStoredBrands(brands) {
    try {
        localStorage.setItem("phonestore_all_brands", JSON.stringify(brands));
    } catch (e) {
        console.warn("Could not save brands", e);
    }
}

const brandApi = {
    async getAll() {
        try {
            const res = await axiosClient.get("/Brand");
            if (Array.isArray(res.data) && res.data.length > 0) return res;
            return { data: getStoredBrands() };
        } catch {
            return { data: getStoredBrands() };
        }
    },

    async getById(id) {
        try {
            const res = await axiosClient.get(`/Brand/${id}`);
            if (res.data) return res;
            const brands = getStoredBrands();
            const found = brands.find(b => b.brandId === Number(id)) || brands[0];
            return { data: found };
        } catch {
            const brands = getStoredBrands();
            const found = brands.find(b => b.brandId === Number(id)) || brands[0];
            return { data: found };
        }
    },

    async create(data) {
        try {
            return await axiosClient.post("/Brand", data);
        } catch {
            const brands = getStoredBrands();
            const newBrand = {
                brandId: Date.now(),
                brandName: data.brandName,
                description: data.description || ""
            };
            brands.push(newBrand);
            saveStoredBrands(brands);
            return { data: newBrand };
        }
    },

    async update(data) {
        try {
            return await axiosClient.put(
                `/Brand/${data.brandId}`,
                data
            );
        } catch {
            const brands = getStoredBrands();
            const index = brands.findIndex(b => b.brandId === Number(data.brandId));
            if (index !== -1) {
                brands[index] = { ...brands[index], ...data };
                saveStoredBrands(brands);
            }
            return { data };
        }
    },

    async delete(id) {
        try {
            return await axiosClient.delete(`/Brand/${id}`);
        } catch {
            let brands = getStoredBrands();
            brands = brands.filter(b => b.brandId !== Number(id));
            saveStoredBrands(brands);
            return { data: { message: "Đã xóa thương hiệu thành công" } };
        }
    }
};

export default brandApi;