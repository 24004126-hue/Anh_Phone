import axiosClient from "./axiosClient";
import { MOCK_BRANDS } from "../data/mockData";

const brandApi = {
    async getAll() {
        try {
            const res = await axiosClient.get("/Brand");
            if (Array.isArray(res.data) && res.data.length > 0) return res;
            return { data: MOCK_BRANDS };
        } catch {
            return { data: MOCK_BRANDS };
        }
    },

    getById(id) {
        return axiosClient.get(`/Brand/${id}`);
    },

    create(data) {
        return axiosClient.post("/Brand", data);
    },

    update(data) {
        return axiosClient.put(
            `/Brand/${data.brandId}`,
            data
        );
    },

    delete(id) {
        return axiosClient.delete(`/Brand/${id}`);
    }
};

export default brandApi;