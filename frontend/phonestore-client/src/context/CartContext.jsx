import { createContext, useContext, useState, useEffect, useCallback } from "react";
import cartApi from "../api/cartApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
    const { isAuthenticated, user } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [cartData, setCartData] = useState(null);
    const [loadingCart, setLoadingCart] = useState(false);

    const refreshCart = useCallback(async () => {
        const userId = user?.userId || localStorage.getItem("userId");
        if (!userId) {
            setCartCount(0);
            setCartData(null);
            return;
        }

        try {
            setLoadingCart(true);
            const res = await cartApi.getCart(userId);
            if (res.data) {
                setCartData(res.data);
                const count = (res.data.items || []).reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(count);
            } else {
                setCartData(null);
                setCartCount(0);
            }
        } catch (error) {
            console.error("Cart fetch error:", error);
            setCartCount(0);
            setCartData(null);
        } finally {
            setLoadingCart(false);
        }
    }, [user]);

    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        } else {
            setCartCount(0);
            setCartData(null);
        }
    }, [isAuthenticated, refreshCart]);

    return (
        <CartContext.Provider
            value={{
                cartCount,
                cartData,
                loadingCart,
                refreshCart,
                setCartCount
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
