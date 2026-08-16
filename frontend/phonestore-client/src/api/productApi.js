import axiosClient from "./axiosClient";
import { MOCK_PRODUCTS } from "../data/mockData";

const productApi = {
    async getAll() {
        try {
            const res = await axiosClient.get("/Product");
            if (Array.isArray(res.data) && res.data.length > 0) return res;
            return { data: MOCK_PRODUCTS };
        } catch {
            return { data: MOCK_PRODUCTS };
        }
    },

    async getById(id) {
        try {
            const res = await axiosClient.get(`/Product/${id}`);
            if (res.data) return res;
            const fallback = MOCK_PRODUCTS.find(p => p.productId === Number(id)) || MOCK_PRODUCTS[0];
            return { data: fallback };
        } catch {
            const fallback = MOCK_PRODUCTS.find(p => p.productId === Number(id)) || MOCK_PRODUCTS[0];
            return { data: fallback };
        }
    },

    async query(params = {}) {
        try {
            const res = await axiosClient.get("/Product/query", { params });
            if (res.data && res.data.items && res.data.items.length > 0) return res;
            return {
                data: {
                    items: filterMockProducts(params),
                    totalItems: MOCK_PRODUCTS.length,
                    page: params.page || 1,
                    pageSize: params.pageSize || 8,
                    totalPages: Math.ceil(MOCK_PRODUCTS.length / (params.pageSize || 8))
                }
            };
        } catch {
            return {
                data: {
                    items: filterMockProducts(params),
                    totalItems: MOCK_PRODUCTS.length,
                    page: params.page || 1,
                    pageSize: params.pageSize || 8,
                    totalPages: Math.ceil(MOCK_PRODUCTS.length / (params.pageSize || 8))
                }
            };
        }
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

function filterMockProducts(params = {}) {
    let result = [...MOCK_PRODUCTS];
    if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        result = result.filter(p => p.productName.toLowerCase().includes(kw));
    }
    if (params.brandId) {
        result = result.filter(p => p.brandId === Number(params.brandId));
    }
    if (params.categoryId) {
        result = result.filter(p => p.categoryId === Number(params.categoryId));
    }
    if (params.minPrice) {
        result = result.filter(p => p.price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
        result = result.filter(p => p.price <= Number(params.maxPrice));
    }
    return result;
}

export default productApi;