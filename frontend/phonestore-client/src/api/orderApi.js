import axiosClient from "./axiosClient";

const orderApi = {
    checkout(data) {
        return axiosClient.post("/Order/checkout", data);
    },

    getByUser(userId) {
        const id = userId || localStorage.getItem("userId");
        return axiosClient.get(`/Order/user/${id}`);
    },

    getMyOrders(userId) {
        const id = userId || localStorage.getItem("userId");
        return axiosClient.get(`/Order/user/${id}`);
    },

    getById(orderId) {
        return axiosClient.get(`/Order/${orderId}`);
    },

    cancelOrder(orderId) {
        return axiosClient.put(`/Order/${orderId}/cancel`);
    },

    getAllAdmin() {
        return axiosClient.get("/Order/admin");
    },

    updateStatus(orderId, status) {
        return axiosClient.put(
            `/Order/${orderId}/status`,
            { status }
        );
    }
};

export default orderApi;