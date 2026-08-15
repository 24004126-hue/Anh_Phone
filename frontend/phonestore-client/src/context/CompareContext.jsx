import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const CompareContext = createContext();

export function CompareProvider({ children }) {
    const [compareList, setCompareList] = useState(() => {
        try {
            const saved = localStorage.getItem("phonestore_compare");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("phonestore_compare", JSON.stringify(compareList));
    }, [compareList]);

    function addToCompare(product) {
        if (!product) return;

        if (compareList.some(item => item.productId === product.productId)) {
            setCompareList(prev => prev.filter(item => item.productId !== product.productId));
            toast.info(`Đã xóa "${product.productName}" khỏi bộ so sánh.`);
            return;
        }

        if (compareList.length >= 3) {
            toast.warn("Bạn chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc.");
            return;
        }

        setCompareList(prev => [...prev, product]);
        toast.success(`Đã thêm "${product.productName}" vào bộ so sánh! (${compareList.length + 1}/3)`);
    }

    function removeFromCompare(productId) {
        setCompareList(prev => prev.filter(item => item.productId !== productId));
    }

    function isInCompare(productId) {
        return compareList.some(item => item.productId === productId);
    }

    function clearCompare() {
        setCompareList([]);
    }

    return (
        <CompareContext.Provider
            value={{
                compareList,
                compareCount: compareList.length,
                addToCompare,
                removeFromCompare,
                isInCompare,
                clearCompare
            }}
        >
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    return useContext(CompareContext);
}
