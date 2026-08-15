import axiosClient from "./axiosClient";

const brandApi = {

    getAll() {
        return axiosClient.get("/Brand");
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