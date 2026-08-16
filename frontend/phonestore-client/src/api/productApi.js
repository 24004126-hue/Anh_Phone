import axiosClient from "./axiosClient";
import { INITIAL_PRODUCTS } from "../data/mockData";

function getStoredProducts() {
    try {
        const stored = localStorage.getItem("phonestore_all_products");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn("Could not load products", e);
    }
    return INITIAL_PRODUCTS;
}

function saveStoredProducts(products) {
    try {
        localStorage.setItem("phonestore_all_products", JSON.stringify(products));
    } catch (e) {
        console.warn("Could not save products", e);
    }
}

const productApi = {
    async getAll() {
        try {
            const res = await axiosClient.get("/Product");
            if (Array.isArray(res.data) && res.data.length > 0) return res;
            return { data: getStoredProducts() };
        } catch {
            return { data: getStoredProducts() };
        }
    },

    async getById(id) {
        try {
            const res = await axiosClient.get(`/Product/${id}`);
            if (res.data) return res;
            const products = getStoredProducts();
            const found = products.find(p => p.productId === Number(id)) || products[0];
            return { data: found };
        } catch {
            const products = getStoredProducts();
            const found = products.find(p => p.productId === Number(id)) || products[0];
            return { data: found };
        }
    },

    async query(params = {}) {
        try {
            const res = await axiosClient.get("/Product/query", { params });
            if (res.data && res.data.items && res.data.items.length > 0) return res;
            const filtered = filterMockProducts(params);
            const pageSize = Number(params.pageSize || 8);
            const page = Number(params.page || 1);
            const start = (page - 1) * pageSize;
            const items = filtered.slice(start, start + pageSize);

            return {
                data: {
                    items,
                    totalItems: filtered.length,
                    page,
                    pageSize,
                    totalPages: Math.ceil(filtered.length / pageSize) || 1
                }
            };
        } catch {
            const filtered = filterMockProducts(params);
            const pageSize = Number(params.pageSize || 8);
            const page = Number(params.page || 1);
            const start = (page - 1) * pageSize;
            const items = filtered.slice(start, start + pageSize);

            return {
                data: {
                    items,
                    totalItems: filtered.length,
                    page,
                    pageSize,
                    totalPages: Math.ceil(filtered.length / pageSize) || 1
                }
            };
        }
    },

    async create(data) {
        try {
            return await axiosClient.post("/Product", data);
        } catch {
            const products = getStoredProducts();
            const newProduct = {
                productId: Date.now(),
                ...data,
                price: Number(data.price || 0),
                discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
                quantity: Number(data.quantity || 0),
                soldQuantity: 0,
                status: data.status || "Available",
                createdAt: new Date().toISOString()
            };
            products.unshift(newProduct);
            saveStoredProducts(products);
            return { data: newProduct };
        }
    },

    async update(data) {
        try {
            return await axiosClient.put(
                `/Product/${data.productId}`,
                data
            );
        } catch {
            const products = getStoredProducts();
            const index = products.findIndex(p => p.productId === Number(data.productId));
            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    ...data,
                    price: Number(data.price || products[index].price),
                    discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
                    quantity: Number(data.quantity !== undefined ? data.quantity : products[index].quantity),
                    updatedAt: new Date().toISOString()
                };
                saveStoredProducts(products);
            }
            return { data };
        }
    },

    async delete(id) {
        try {
            return await axiosClient.delete(`/Product/${id}`);
        } catch {
            let products = getStoredProducts();
            products = products.filter(p => p.productId !== Number(id));
            saveStoredProducts(products);
            return { data: { message: "Đã xóa sản phẩm thành công" } };
        }
    },

    async saveVariants(productId, variants) {
        try {
            return await axiosClient.post(`/Product/${productId}/variants`, variants);
        } catch {
            return { data: { message: "Đã lưu biến thể thành công" } };
        }
    },

    async uploadImage(file) {
        try {
            const formData = new FormData();
            formData.append("file", file);
            return await axiosClient.post(
                "/Product/upload-image",
                formData
            );
        } catch {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({ data: { url: e.target.result } });
                };
                reader.readAsDataURL(file);
            });
        }
    }
};

function filterMockProducts(params = {}) {
    let result = getStoredProducts();
    if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        result = result.filter(p => p.productName.toLowerCase().includes(kw) || p.description?.toLowerCase().includes(kw));
    }
    if (params.brandId) {
        result = result.filter(p => p.brandId === Number(params.brandId));
    }
    if (params.categoryId) {
        result = result.filter(p => p.categoryId === Number(params.categoryId));
    }
    if (params.minPrice) {
        result = result.filter(p => (p.discountPrice || p.price) >= Number(params.minPrice));
    }
    if (params.maxPrice) {
        result = result.filter(p => (p.discountPrice || p.price) <= Number(params.maxPrice));
    }
    return result;
}

export default productApi;