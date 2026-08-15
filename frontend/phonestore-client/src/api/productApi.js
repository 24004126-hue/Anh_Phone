import axiosClient from "./axiosClient";

const productApi = {
    getAll() {
        return axiosClient.get("/Product");
    },

    getById(id) {
        return axiosClient.get(`/Product/${id}`);
    },

    query(params) {
        return axiosClient.get("/Product/query", {
            params
        });
    },

    create(data) {
        return axiosClient.post("/Product", data);
    },

    update(data) {
        return axiosClient.put(
            `/Product/${data.productId}`,
            data
        );
    },

    delete(id) {
        return axiosClient.delete(`/Product/${id}`);
    },

    saveVariants(productId, variants) {
        return axiosClient.post(`/Product/${productId}/variants`, variants);
    },

    uploadImage(file) {
        const formData = new FormData();
        formData.append("file", file);

        return axiosClient.post(
            "/Product/upload-image",
            formData
        );
    }
};

export default productApi;