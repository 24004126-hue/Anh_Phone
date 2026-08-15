import axiosClient from "./axiosClient";

const cartApi = {

    addToCart(data) {
        return axiosClient.post("/Cart/add", data);
    },

    getCart(userId) {
        return axiosClient.get(`/Cart/${userId}`);
    },

    updateQuantity(data) {
        return axiosClient.put("/Cart/update", data);
    },

    removeItem(cartItemId) {
        return axiosClient.delete(`/Cart/remove/${cartItemId}`);
    }

};

export default cartApi;