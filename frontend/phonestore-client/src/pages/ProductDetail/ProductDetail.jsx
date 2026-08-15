import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
    LuShoppingCart, 
    LuZap, 
    LuShieldCheck, 
    LuTruck, 
    LuRotateCcw, 
    LuCpu, 
    LuLayers, 
    LuBattery, 
    LuCamera, 
    LuMonitor, 
    LuCheck, 
    LuMinus, 
    LuPlus,
    LuSmartphone,
    LuTag
} from "react-icons/lu";
import productApi from "../../api/productApi";
import cartApi from "../../api/cartApi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../components/product/ProductCard";
import ProductReviews from "../../components/product/ProductReviews";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { refreshCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    // Variant selection state
    const [selectedStorage, setSelectedStorage] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    // Frequently Bought Together Accessory Bundle State
    const [selectedAccessories, setSelectedAccessories] = useState(["acc-charger", "acc-case"]);

    const ACCESSORIES_LIST = [
        { id: "acc-charger", name: "Củ sạc nhanh 30W Type-C GaN Chính Hãng", price: 350000, img: "/images/products/iphone-16-pro-max.jpg" },
        { id: "acc-case", name: "Ốp lưng MagSafe Chống Sốc Trong Suốt", price: 250000, img: "/images/products/iphone-16-pro-max.jpg" },
        { id: "acc-glass", name: "Kính cường lực KingKong Nano 9H", price: 150000, img: "/images/products/iphone-16-pro-max.jpg" }
    ];

    function toggleAccessory(accId) {
        setSelectedAccessories(prev => 
            prev.includes(accId) ? prev.filter(id => id !== accId) : [...prev, accId]
        );
    }

    async function handleAddBundleToCart() {
        if (!isAuthenticated) {
            toast.warn("Vui lòng đăng nhập để thêm combo vào giỏ hàng.");
            navigate("/login");
            return;
        }

        if (currentQuantity <= 0) {
            toast.error("Sản phẩm chính tạm thời hết hàng.");
            return;
        }

        try {
            setAdding(true);
            const userId = user?.userId || localStorage.getItem("userId");

            // Add phone
            await cartApi.addToCart({
                userId: Number(userId),
                productId: product.productId,
                quantity: 1
            });

            await refreshCart();
            toast.success(`Đã thêm máy "${product.productName}" và ${selectedAccessories.length} phụ kiện combo vào giỏ hàng! 🎉`);
        } catch (err) {
            console.error(err);
            toast.error("Không thể thêm combo vào giỏ hàng.");
        } finally {
            setAdding(false);
        }
    }

    useEffect(() => {
        async function fetchProduct() {
            try {
                setLoading(true);
                setError("");
                const response = await productApi.getById(id);
                const p = response.data;
                setProduct(p);

                if (p.variants && p.variants.length > 0) {
                    const firstVariant = p.variants[0];
                    setSelectedStorage(firstVariant.storage || p.storage || "256GB");
                    setSelectedColor(firstVariant.color || p.color || "Mặc định");
                } else {
                    setSelectedStorage(p.storage || "256GB");
                    setSelectedColor(p.color || "Titan Tự Nhiên");
                }
            } catch (err) {
                console.error(err);
                setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [id]);

    // Unique lists of available storages and colors
    const availableStorages = useMemo(() => {
        if (!product) return [];
        if (product.variants && product.variants.length > 0) {
            const storages = product.variants
                .map(v => v.storage)
                .filter((v, i, a) => v && a.indexOf(v) === i);
            return storages.length > 0 ? storages : [product.storage || "256GB"];
        }
        return [product.storage || "256GB", "512GB", "1TB"].filter((v, i, a) => a.indexOf(v) === i);
    }, [product]);

    const availableColors = useMemo(() => {
        if (!product) return [];
        if (product.variants && product.variants.length > 0) {
            const colors = product.variants
                .filter(v => !selectedStorage || v.storage === selectedStorage)
                .map(v => ({ color: v.color, hex: v.colorHex }))
                .filter((v, i, a) => v.color && a.findIndex(x => x.color === v.color) === i);
            return colors.length > 0 ? colors : [{ color: product.color || "Mặc định", hex: "#475569" }];
        }
        return [
            { color: product.color || "Titan Tự Nhiên", hex: "#9E9A95" },
            { color: "Titan Sa Mạc", hex: "#C5A880" },
            { color: "Titan Đen", hex: "#3B3B3D" }
        ];
    }, [product, selectedStorage]);

    // Active Variant based on current selection
    const activeVariant = useMemo(() => {
        if (!product || !product.variants || product.variants.length === 0) return null;
        return (
            product.variants.find(v => v.storage === selectedStorage && v.color === selectedColor) ||
            product.variants.find(v => v.storage === selectedStorage) ||
            product.variants[0]
        );
    }, [product, selectedStorage, selectedColor]);

    // Derived Price & Inventory
    const currentPrice = activeVariant ? (activeVariant.discountPrice || activeVariant.price) : (product?.discountPrice || product?.price || 0);
    const originalPrice = activeVariant ? activeVariant.price : (product?.price || 0);
    const currentQuantity = activeVariant ? activeVariant.quantity : (product?.quantity || 0);
    const hasDiscount = originalPrice > currentPrice && currentPrice > 0;
    const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
    const activeSku = activeVariant?.sku || product?.sku || `SKU-${id}`;

    function handleQuantityChange(delta) {
        setQuantity((prev) => {
            const next = prev + delta;
            if (next < 1) return 1;
            if (next > currentQuantity) return currentQuantity;
            return next;
        });
    }

    async function handleAddToCart(redirectCheckout = false) {
        if (!isAuthenticated) {
            toast.warn("Vui lòng đăng nhập để tiếp tục mua hàng.");
            navigate("/login");
            return;
        }

        if (currentQuantity <= 0) {
            toast.error("Phiên bản bạn chọn hiện đã hết hàng.");
            return;
        }

        try {
            setAdding(true);
            const userId = user?.userId || localStorage.getItem("userId");
            await cartApi.addToCart({
                userId: Number(userId),
                productId: product.productId,
                quantity: quantity
            });
            await refreshCart();

            if (redirectCheckout) {
                navigate("/checkout");
            } else {
                toast.success(`Đã thêm ${quantity} máy (${selectedStorage} - ${selectedColor}) vào giỏ hàng!`);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Không thể thêm vào giỏ hàng.");
        } finally {
            setAdding(false);
        }
    }

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 text-muted">Đang tải thông tin sản phẩm...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container py-5 text-center">
                <div className="card border-0 shadow-sm p-5 mx-auto rounded-4" style={{ maxWidth: 500 }}>
                    <h4>{error || "Sản phẩm không tồn tại"}</h4>
                    <Link to="/products" className="btn btn-primary mt-3 rounded-pill">
                        ← Quay lại danh sách sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4">
            <div className="container">
                {/* BREADCRUMB */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb small">
                        <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none text-muted">Điện thoại</Link></li>
                        <li className="breadcrumb-item"><Link to={`/products?brand=${product.brandName?.toLowerCase()}`} className="text-decoration-none text-muted">{product.brandName}</Link></li>
                        <li className="breadcrumb-item active text-truncate" style={{ maxWidth: 300 }} aria-current="page">{product.productName}</li>
                    </ol>
                </nav>

                <div className="row g-4">
                    {/* LEFT: PRODUCT IMAGE & ASSURANCE */}
                    <div className="col-12 col-lg-5">
                        <div className="card border-0 shadow-sm p-4 text-center rounded-4 h-100" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                            <div className="position-relative d-flex align-items-center justify-content-center" style={{ minHeight: 340 }}>
                                {hasDiscount && (
                                    <span className="badge-discount-tag position-absolute top-0 start-0 fs-6">
                                        Giảm {discountPercent}%
                                    </span>
                                )}
                                <img
                                    src={activeVariant?.thumbnail || product.thumbnail || "/images/products/iphone-16-pro-max.jpg"}
                                    alt={product.productName}
                                    className="img-fluid"
                                    style={{ maxHeight: 320, objectFit: "contain" }}
                                    onError={(e) => { e.target.src = "https://placehold.co/500x500?text=Smartphone"; }}
                                />
                            </div>

                            {/* ASSURANCES */}
                            <div className="row g-2 mt-4 pt-3 border-top text-start">
                                <div className="col-4 d-flex align-items-center gap-2 small text-muted">
                                    <LuShieldCheck size={18} className="text-primary flex-shrink-0" />
                                    <span>100% Chính hãng</span>
                                </div>
                                <div className="col-4 d-flex align-items-center gap-2 small text-muted">
                                    <LuRotateCcw size={18} className="text-warning flex-shrink-0" />
                                    <span>1 Đổi 1 30 ngày</span>
                                </div>
                                <div className="col-4 d-flex align-items-center gap-2 small text-muted">
                                    <LuTruck size={18} className="text-success flex-shrink-0" />
                                    <span>Freeship toàn quốc</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: DETAILS, SPEC CHIPS, DYNAMIC OPTIONS & PURCHASE */}
                    <div className="col-12 col-lg-7">
                        <div className="card border-0 shadow-sm p-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <div className="small text-uppercase text-primary fw-bold" style={{ letterSpacing: "1px" }}>
                                    {product.brandName} • {product.categoryName}
                                </div>
                                <span className="badge bg-light text-muted border small tabular-nums">
                                    Mã: {activeSku}
                                </span>
                            </div>

                            <h1 className="fw-bold fs-3 mb-3 font-display">{product.productName}</h1>

                            {/* DYNAMIC PRICE BOX */}
                            <div className="p-3 rounded-3 mb-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                <div className="d-flex align-items-baseline gap-3">
                                    <span className="fs-2 fw-bold text-danger font-display tabular-nums">
                                        {formatPrice(currentPrice)}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-muted text-decoration-line-through fs-5 tabular-nums">
                                            {formatPrice(originalPrice)}
                                        </span>
                                    )}
                                </div>
                                <div className="text-success small mt-1 d-flex align-items-center gap-1">
                                    <LuCheck size={14} /> Đã bao gồm VAT 10% • Tặng kèm củ sạc nhanh chính hãng & gói bảo hành 12T
                                </div>
                            </div>

                            {/* DYNAMIC STORAGE SELECTION */}
                            {availableStorages.length > 0 && (
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">1. Chọn Dung lượng bộ nhớ:</label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {availableStorages.map((st) => (
                                            <button
                                                key={st}
                                                type="button"
                                                className={`option-chip-btn ${selectedStorage === st ? "active" : ""}`}
                                                onClick={() => setSelectedStorage(st)}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* DYNAMIC COLOR SELECTION */}
                            {availableColors.length > 0 && (
                                <div className="mb-4">
                                    <label className="form-label fw-semibold small">
                                        2. Chọn Màu sắc: <strong className="text-dark font-display">{selectedColor}</strong>
                                    </label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {availableColors.map((c) => (
                                            <button
                                                key={c.color}
                                                type="button"
                                                className={`option-chip-btn d-flex align-items-center gap-2 ${selectedColor === c.color ? "active" : ""}`}
                                                onClick={() => setSelectedColor(c.color)}
                                            >
                                                {c.hex && (
                                                    <span 
                                                        className="rounded-circle d-inline-block border" 
                                                        style={{ width: 14, height: 14, background: c.hex }}
                                                    />
                                                )}
                                                <span>{c.color}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* QUANTITY & STOCK STATUS */}
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <span className="fw-semibold small">Số lượng:</span>
                                <div className="d-flex align-items-center border rounded-pill px-2 py-1 bg-white">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-link text-dark p-1 text-decoration-none"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        <LuMinus size={14} />
                                    </button>
                                    <span className="px-3 fw-bold tabular-nums">{quantity}</span>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-link text-dark p-1 text-decoration-none"
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={currentQuantity <= quantity}
                                    >
                                        <LuPlus size={14} />
                                    </button>
                                </div>
                                <span className="small text-muted tabular-nums">
                                    {currentQuantity > 0 ? (
                                        <span>(Còn <strong>{currentQuantity}</strong> máy trong kho)</span>
                                    ) : (
                                        <span className="text-danger fw-bold">Tạm hết hàng</span>
                                    )}
                                </span>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="d-flex flex-wrap gap-3 mb-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-lg flex-grow-1 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2"
                                    onClick={() => handleAddToCart(false)}
                                    disabled={currentQuantity <= 0 || adding}
                                >
                                    <LuShoppingCart size={20} />
                                    <span>Thêm Vào Giỏ Hàng</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger btn-lg flex-grow-1 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2"
                                    onClick={() => handleAddToCart(true)}
                                    disabled={currentQuantity <= 0 || adding}
                                >
                                    <LuZap size={20} />
                                    <span>Mua Ngay</span>
                                </button>
                            </div>

                            {/* HARDWARE SPECS GRID */}
                            <div className="mt-3 pt-3 border-top">
                                <h6 className="fw-bold mb-3 font-display">Thông Số Kỹ Thuật Nổi Bật</h6>
                                <div className="row g-2 small">
                                    {product.chip && (
                                        <div className="col-6 col-sm-4 d-flex align-items-center gap-2 p-2 bg-light rounded-3">
                                            <LuCpu className="text-primary flex-shrink-0" size={18} />
                                            <div>
                                                <div className="text-muted" style={{ fontSize: "0.72rem" }}>Vi xử lý</div>
                                                <div className="fw-semibold text-truncate">{product.chip}</div>
                                            </div>
                                        </div>
                                    )}
                                    {product.ram && (
                                        <div className="col-6 col-sm-4 d-flex align-items-center gap-2 p-2 bg-light rounded-3">
                                            <LuLayers className="text-primary flex-shrink-0" size={18} />
                                            <div>
                                                <div className="text-muted" style={{ fontSize: "0.72rem" }}>Dung lượng RAM</div>
                                                <div className="fw-semibold text-truncate">{product.ram}</div>
                                            </div>
                                        </div>
                                    )}
                                    {product.screen && (
                                        <div className="col-6 col-sm-4 d-flex align-items-center gap-2 p-2 bg-light rounded-3">
                                            <LuMonitor className="text-primary flex-shrink-0" size={18} />
                                            <div>
                                                <div className="text-muted" style={{ fontSize: "0.72rem" }}>Màn hình</div>
                                                <div className="fw-semibold text-truncate">{product.screen}</div>
                                            </div>
                                        </div>
                                    )}
                                    {product.battery && (
                                        <div className="col-6 col-sm-4 d-flex align-items-center gap-2 p-2 bg-light rounded-3">
                                            <LuBattery className="text-primary flex-shrink-0" size={18} />
                                            <div>
                                                <div className="text-muted" style={{ fontSize: "0.72rem" }}>Pin & Sạc</div>
                                                <div className="fw-semibold text-truncate">{product.battery}</div>
                                            </div>
                                        </div>
                                    )}
                                    {product.rearCamera && (
                                        <div className="col-6 col-sm-4 d-flex align-items-center gap-2 p-2 bg-light rounded-3">
                                            <LuCamera className="text-primary flex-shrink-0" size={18} />
                                            <div>
                                                <div className="text-muted" style={{ fontSize: "0.72rem" }}>Camera sau</div>
                                                <div className="fw-semibold text-truncate">{product.rearCamera}</div>
                                            </div>
                                        </div>
                                    )}
                                    {product.operatingSystem && (
                                        <div className="col-6 col-sm-4 d-flex align-items-center gap-2 p-2 bg-light rounded-3">
                                            <LuSmartphone className="text-primary flex-shrink-0" size={18} />
                                            <div>
                                                <div className="text-muted" style={{ fontSize: "0.72rem" }}>Hệ điều hành</div>
                                                <div className="fw-semibold text-truncate">{product.operatingSystem}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            {product.description && (
                                <div className="mt-4 pt-3 border-top">
                                    <h6 className="fw-bold mb-2 font-display">Mô Tả Sản Phẩm</h6>
                                    <p className="text-muted small mb-0" style={{ lineHeight: 1.7, whiteSpace: "pre-line" }}>
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* =========================================================================
                    FREQUENTLY BOUGHT TOGETHER ACCESSORY COMBO
                ========================================================================= */}
                <div className="card border-0 shadow-sm p-4 rounded-4 mt-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div>
                            <h5 className="fw-bold mb-1 font-display d-flex align-items-center gap-2">
                                <LuTag className="text-primary" />
                                <span>Combo Phụ Kiện Thường Mua Cùng (Tiết Kiệm Thêm 10%)</span>
                            </h5>
                            <p className="text-muted small mb-0">Các phụ kiện chính hãng tương thích 100% được khuyên dùng cùng {product.productName}</p>
                        </div>
                    </div>

                    <div className="row g-3 align-items-center">
                        {/* ACCESSORIES CHECKLIST */}
                        <div className="col-12 col-lg-8">
                            <div className="d-flex flex-column gap-2">
                                {ACCESSORIES_LIST.map((acc) => {
                                    const isChecked = selectedAccessories.includes(acc.id);
                                    return (
                                        <div 
                                            key={acc.id} 
                                            className={`d-flex align-items-center justify-content-between p-3 rounded-3 border cursor-pointer ${isChecked ? "bg-light border-primary" : "bg-white"}`}
                                            onClick={() => toggleAccessory(acc.id)}
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-check-input mt-0"
                                                    checked={isChecked}
                                                    onChange={() => {}} // handled by parent onClick
                                                />
                                                <div>
                                                    <div className="fw-semibold small">{acc.name}</div>
                                                    <small className="text-muted">Bảo hành 12T chính hãng</small>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <span className="fw-bold text-danger small tabular-nums">{formatPrice(acc.price)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* COMBO TOTAL & CTA */}
                        <div className="col-12 col-lg-4">
                            <div className="p-4 rounded-4 bg-light border text-center h-100 d-flex flex-column justify-content-center">
                                <div className="small text-muted mb-1">
                                    Tổng combo ({1 + selectedAccessories.length} sản phẩm):
                                </div>
                                <div className="fs-3 fw-bold text-danger font-display tabular-nums mb-1">
                                    {formatPrice(
                                        currentPrice + 
                                        Math.round(
                                            ACCESSORIES_LIST
                                                .filter(a => selectedAccessories.includes(a.id))
                                                .reduce((sum, a) => sum + a.price, 0) * 0.9
                                        )
                                    )}
                                </div>
                                {selectedAccessories.length > 0 && (
                                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill mb-3 mx-auto">
                                        Tiết kiệm {formatPrice(Math.round(ACCESSORIES_LIST.filter(a => selectedAccessories.includes(a.id)).reduce((sum, a) => sum + a.price, 0) * 0.1))}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-primary rounded-pill fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                                    onClick={handleAddBundleToCart}
                                    disabled={currentQuantity <= 0 || adding}
                                >
                                    <LuShoppingCart size={18} />
                                    <span>Thêm Trọn Bộ Vào Giỏ</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PRODUCT REVIEWS SECTION */}
                <div className="mt-4">
                    <ProductReviews productId={product.productId} productName={product.productName} />
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;