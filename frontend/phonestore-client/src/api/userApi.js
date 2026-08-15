import axiosClient from "./axiosClient";

const userApi = {

    getAll() {
        return axiosClient.get("/User");
    },

    getById(id) {
        return axiosClient.get(`/User/${id}`);
    },

    create(data) {
        return axiosClient.post("/User", data);
    },

    update(data) {
        return axiosClient.put(
            `/User/${data.userId}`,
            data
        );
    },

    delete(id) {
        return axiosClient.delete(`/User/${id}`);
    }

};

export default userApi;