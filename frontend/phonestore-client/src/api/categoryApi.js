import axiosClient from "./axiosClient";
import { MOCK_CATEGORIES } from "../data/mockData";

const categoryApi = {
    async getAll() {
        try {
            const res = await axiosClient.get("/Category");
            if (Array.isArray(res.data) && res.data.length > 0) return res;
            return { data: MOCK_CATEGORIES };
        } catch {
            return { data: MOCK_CATEGORIES };
        }
    },

    getById(id) {
        return axiosClient.get(`/Category/${id}`);
    },

    create(data) {
        return axiosClient.post("/Category", data);
    },

    update(data) {
        return axiosClient.put(
            `/Category/${data.categoryId}`,
            data
        );
    },

    delete(id) {
        return axiosClient.delete(`/Category/${id}`);
    }
};

export default categoryApi;