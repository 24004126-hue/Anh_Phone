import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem("phonestore_wishlist");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("phonestore_wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    function toggleWishlist(product) {
        if (!product) return;
        const exists = wishlist.some(item => item.productId === product.productId);

        if (exists) {
            setWishlist(prev => prev.filter(item => item.productId !== product.productId));
            toast.info(`Đã bỏ "${product.productName}" khỏi danh sách yêu thích.`);
        } else {
            setWishlist(prev => [...prev, product]);
            toast.success(`Đã thêm "${product.productName}" vào danh sách yêu thích! ❤️`);
        }
    }

    function isInWishlist(productId) {
        return wishlist.some(item => item.productId === productId);
    }

    function removeFromWishlist(productId) {
        setWishlist(prev => prev.filter(item => item.productId !== productId));
    }

    function clearWishlist() {
        setWishlist([]);
    }

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                wishlistCount: wishlist.length,
                toggleWishlist,
                isInWishlist,
                removeFromWishlist,
                clearWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    return useContext(WishlistContext);
}
