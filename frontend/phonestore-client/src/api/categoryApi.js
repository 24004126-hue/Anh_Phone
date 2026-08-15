import axiosClient from "./axiosClient";

const categoryApi = {

    getAll() {
        return axiosClient.get("/Category");
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