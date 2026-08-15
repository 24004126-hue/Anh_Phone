import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LuShoppingCart, LuCpu, LuCheck, LuHeart, LuGitCompare } from "react-icons/lu";
import cartApi from "../../api/cartApi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCompare } from "../../context/CompareContext";

export function formatPrice(value) {
    if (value == null) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

export default function ProductCard({ product, badge }) {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { refreshCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { isInCompare, addToCompare } = useCompare();

    const isFav = isInWishlist(product?.productId);
    const isComp = isInCompare(product?.productId);

    const hasDiscount =
        product.discountPrice != null &&
        product.discountPrice > 0 &&
        product.discountPrice < product.price;

    const displayPrice = hasDiscount ? product.discountPrice : product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    async function handleQuickAddToCart(e) {
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.warn("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
            navigate("/login");
            return;
        }

        if (product.quantity <= 0) {
            toast.error("Sản phẩm tạm thời hết hàng.");
            return;
        }

        try {
            const userId = user?.userId || localStorage.getItem("userId");
            await cartApi.addToCart({
                userId: Number(userId),
                productId: product.productId,
                quantity: 1
            });
            await refreshCart();
            toast.success(`Đã thêm "${product.productName}" vào giỏ hàng.`);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Không thể thêm vào giỏ hàng.");
        }
    }

    function handleToggleFav(e) {
        e.stopPropagation();
        toggleWishlist(product);
    }

    function handleToggleCompare(e) {
        e.stopPropagation();
        addToCompare(product);
    }

    return (
        <div
            className="product-grid-card position-relative"
            onClick={() => navigate(`/product/${product.productId}`)}
        >
            {/* TOP ACTION BUTTONS: COMPARE & WISHLIST */}
            <div className="position-absolute top-0 start-0 end-0 p-2 d-flex justify-content-between align-items-center z-2 pointer-events-none">
                {/* COMPARE BUTTON */}
                <button
                    type="button"
                    className={`btn btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm pointer-events-auto border ${isComp ? "btn-primary text-white" : "btn-light bg-white bg-opacity-90 text-muted"}`}
                    style={{ width: 28, height: 28 }}
                    onClick={handleToggleCompare}
                    title={isComp ? "Bỏ so sánh" : "Thêm vào so sánh"}
                >
                    <LuGitCompare size={13} />
                </button>

                {/* WISHLIST HEART BUTTON */}
                <button
                    type="button"
                    className={`btn btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm pointer-events-auto border ${isFav ? "btn-danger text-white" : "btn-light bg-white bg-opacity-90 text-muted"}`}
                    style={{ width: 28, height: 28 }}
                    onClick={handleToggleFav}
                    title={isFav ? "Bỏ yêu thích" : "Yêu thích"}
                >
                    <LuHeart size={14} fill={isFav ? "#ffffff" : "none"} />
                </button>
            </div>

            {/* BADGES */}
            <div className="product-card-top-badges mt-4">
                {badge && <span className="badge-genuine-tag">{badge}</span>}
                {hasDiscount && (
                    <span className="badge-discount-tag">-{discountPercent}%</span>
                )}
            </div>

            {/* IMAGE */}
            <div className="product-image-container">
                <img
                    src={product.thumbnail || "/images/products/iphone-16-pro-max.jpg"}
                    alt={product.productName}
                    className="product-thumb-image"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = "https://placehold.co/400x400?text=Smartphone";
                    }}
                />
            </div>

            {/* CONTENT */}
            <div className="product-card-body">
                <div className="product-brand-label">{product.brandName || "Smartphone"}</div>
                <h3 className="product-name-heading" title={product.productName}>
                    {product.productName}
                </h3>

                {/* KEY SPECS CHIPS */}
                <div className="product-specs-row">
                    {product.ram && <span className="spec-micro-tag">{product.ram}</span>}
                    {product.storage && <span className="spec-micro-tag">{product.storage}</span>}
                    {product.chip && (
                        <span className="spec-micro-tag d-flex align-items-center gap-1">
                            <LuCpu size={11} /> {product.chip}
                        </span>
                    )}
                </div>

                {/* PRICE ROW */}
                <div className="product-pricing-box">
                    <span className="product-current-price tabular-nums">
                        {formatPrice(displayPrice)}
                    </span>
                    {hasDiscount && (
                        <span className="product-original-price tabular-nums">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>

                {/* STOCK & ACTION BUTTONS */}
                <div className="product-card-actions">
                    <span className={`stock-indicator ${product.quantity > 0 ? "stock-in" : "stock-out"}`}>
                        {product.quantity > 0 ? (
                            <>
                                <LuCheck size={14} /> Sẵn ({product.quantity})
                            </>
                        ) : (
                            "Hết hàng"
                        )}
                    </span>
                    <button
                        type="button"
                        className="btn-add-cart-outline"
                        title="Thêm vào giỏ hàng"
                        disabled={product.quantity <= 0}
                        onClick={handleQuickAddToCart}
                    >
                        <LuShoppingCart size={14} />
                        <span>Thêm</span>
                    </button>
                </div>
            </div>
        </div>
    );
}