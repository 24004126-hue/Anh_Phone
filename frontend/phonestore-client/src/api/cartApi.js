import axiosClient from "./axiosClient";
import { MOCK_PRODUCTS } from "../data/mockData";

function getLocalCart(userId) {
    try {
        const stored = localStorage.getItem(`phonestore_cart_${userId}`);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn("Could not read local cart", e);
    }
    return { cartId: 1, userId, items: [] };
}

function saveLocalCart(userId, cart) {
    try {
        localStorage.setItem(`phonestore_cart_${userId}`, JSON.stringify(cart));
    } catch (e) {
        console.warn("Could not save local cart", e);
    }
}

const cartApi = {
    async addToCart(data) {
        try {
            return await axiosClient.post("/Cart/add", data);
        } catch {
            const userId = data.userId || localStorage.getItem("userId") || 1;
            const cart = getLocalCart(userId);
            const existing = cart.items.find(i => i.productId === Number(data.productId));

            if (existing) {
                existing.quantity += Number(data.quantity || 1);
            } else {
                const product = MOCK_PRODUCTS.find(p => p.productId === Number(data.productId)) || MOCK_PRODUCTS[0];
                cart.items.push({
                    cartItemId: Date.now(),
                    productId: product.productId,
                    quantity: Number(data.quantity || 1),
                    productName: product.productName,
                    price: product.price,
                    discountPrice: product.discountPrice,
                    thumbnail: product.thumbnail,
                    product: product
                });
            }

            saveLocalCart(userId, cart);
            return { data: cart };
        }
    },

    async getCart(userId) {
        try {
            const res = await axiosClient.get(`/Cart/${userId}`);
            return res;
        } catch {
            const cart = getLocalCart(userId);
            return { data: cart };
        }
    },

    async updateQuantity(data) {
        try {
            return await axiosClient.put("/Cart/update", data);
        } catch {
            const userId = localStorage.getItem("userId") || 1;
            const cart = getLocalCart(userId);
            const item = cart.items.find(i => i.cartItemId === Number(data.cartItemId));
            if (item) {
                item.quantity = Number(data.quantity);
                if (item.quantity <= 0) {
                    cart.items = cart.items.filter(i => i.cartItemId !== Number(data.cartItemId));
                }
                saveLocalCart(userId, cart);
            }
            return { data: cart };
        }
    },

    async removeItem(cartItemId) {
        try {
            return await axiosClient.delete(`/Cart/remove/${cartItemId}`);
        } catch {
            const userId = localStorage.getItem("userId") || 1;
            const cart = getLocalCart(userId);
            cart.items = cart.items.filter(i => i.cartItemId !== Number(cartItemId));
            saveLocalCart(userId, cart);
            return { data: cart };
        }
    }
};

export default cartApi;