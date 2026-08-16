import axiosClient from "./axiosClient";
import { INITIAL_ORDERS } from "../data/mockData";

function getStoredOrders() {
    try {
        const stored = localStorage.getItem("phonestore_all_orders");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn("Could not load orders", e);
    }
    return INITIAL_ORDERS;
}

function saveStoredOrders(orders) {
    try {
        localStorage.setItem("phonestore_all_orders", JSON.stringify(orders));
    } catch (e) {
        console.warn("Could not save orders", e);
    }
}

const orderApi = {
    async checkout(data) {
        try {
            return await axiosClient.post("/Order/checkout", data);
        } catch {
            const orders = getStoredOrders();
            const newOrderId = Math.floor(Math.random() * 9000) + 1000;
            const newOrder = {
                orderId: newOrderId,
                userId: Number(data.userId || localStorage.getItem("userId") || 2),
                receiverName: data.receiverName || "Khách Hàng",
                receiverPhone: data.receiverPhone || "",
                shippingAddress: data.shippingAddress || "",
                paymentMethod: data.paymentMethod || "COD",
                notes: data.notes || "",
                totalAmount: Number(data.totalAmount || 0),
                status: "Pending",
                createdAt: new Date().toISOString(),
                orderDetails: (data.items || []).map((item, index) => ({
                    orderDetailId: Date.now() + index,
                    orderId: newOrderId,
                    productId: item.productId,
                    productName: item.productName || item.product?.productName || "Điện thoại",
                    thumbnail: item.thumbnail || item.product?.thumbnail || "/images/hero/iphone16-desert.png",
                    quantity: item.quantity,
                    unitPrice: item.discountPrice || item.price,
                    totalPrice: (item.discountPrice || item.price) * item.quantity
                }))
            };

            orders.unshift(newOrder);
            saveStoredOrders(orders);

            // Clear cart
            const userId = data.userId || localStorage.getItem("userId") || 2;
            localStorage.removeItem(`phonestore_cart_${userId}`);

            return { data: newOrder };
        }
    },

    async getByUser(userId) {
        try {
            const id = userId || localStorage.getItem("userId");
            const res = await axiosClient.get(`/Order/user/${id}`);
            if (Array.isArray(res.data)) return res;
            const orders = getStoredOrders();
            return { data: orders.filter(o => o.userId === Number(id)) };
        } catch {
            const id = userId || localStorage.getItem("userId");
            const orders = getStoredOrders();
            return { data: orders.filter(o => o.userId === Number(id)) };
        }
    },

    async getMyOrders(userId) {
        return this.getByUser(userId);
    },

    async getById(orderId) {
        try {
            const res = await axiosClient.get(`/Order/${orderId}`);
            if (res.data) return res;
            const orders = getStoredOrders();
            const found = orders.find(o => o.orderId === Number(orderId)) || orders[0];
            return { data: found };
        } catch {
            const orders = getStoredOrders();
            const found = orders.find(o => o.orderId === Number(orderId)) || orders[0];
            return { data: found };
        }
    },

    async cancelOrder(orderId) {
        try {
            return await axiosClient.put(`/Order/${orderId}/cancel`);
        } catch {
            const orders = getStoredOrders();
            const order = orders.find(o => o.orderId === Number(orderId));
            if (order) {
                order.status = "Cancelled";
                saveStoredOrders(orders);
            }
            return { data: order };
        }
    },

    async getAllAdmin() {
        try {
            const res = await axiosClient.get("/Order/admin");
            if (Array.isArray(res.data) && res.data.length > 0) return res;
            return { data: getStoredOrders() };
        } catch {
            return { data: getStoredOrders() };
        }
    },

    async updateStatus(orderId, status) {
        try {
            return await axiosClient.put(
                `/Order/${orderId}/status`,
                { status }
            );
        } catch {
            const orders = getStoredOrders();
            const order = orders.find(o => o.orderId === Number(orderId));
            if (order) {
                order.status = status;
                saveStoredOrders(orders);
            }
            return { data: order };
        }
    }
};

export default orderApi;