import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
    LuSearch, 
    LuShoppingBag, 
    LuUser, 
    LuPackage, 
    LuPhoneCall, 
    LuShieldCheck, 
    LuTruck, 
    LuLogOut, 
    LuStore,
    LuSmartphone,
    LuSlidersHorizontal,
    LuX,
    LuHeart,
    LuGitCompare
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCompare } from "../../context/CompareContext";
import productApi from "../../api/productApi";
import { formatPrice } from "../product/ProductCard";

const BRANDS = [
    { name: "Tất cả", slug: "" },
    { name: "iPhone", slug: "apple" },
    { name: "Samsung", slug: "samsung" },
    { name: "Xiaomi", slug: "xiaomi" },
    { name: "ASUS ROG", slug: "asus" },
    { name: "OPPO", slug: "oppo" },
    { name: "Vivo", slug: "vivo" },
    { name: "Realme", slug: "realme" },
    { name: "Nubia Red Magic", slug: "nubia" }
];

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { compareCount } = useCompare();
    const navigate = useNavigate();
    const location = useLocation();

    const [keyword, setKeyword] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const mobileSearchRef = useRef(null);

    const userAvatar = user?.avatar || (user?.userId ? localStorage.getItem(`userAvatar_${user.userId}`) : "") || "";

    // Dynamic Scroll State for Fluid Animation
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHeaderHidden, setIsHeaderHidden] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        function handleScroll() {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 25) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            // Smart scroll detection
            if (currentScrollY > 220) {
                if (currentScrollY > lastScrollY.current + 8) {
                    setIsHeaderHidden(true);
                } else if (currentScrollY < lastScrollY.current - 8) {
                    setIsHeaderHidden(false);
                }
            } else {
                setIsHeaderHidden(false);
            }

            lastScrollY.current = currentScrollY;
        }

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Fetch products once for fast local autocomplete
    useEffect(() => {
        productApi.getAll()
            .then(res => setAllProducts(res.data || []))
            .catch(err => console.error("Load products for search error:", err));
    }, []);

    // Live search filter
    useEffect(() => {
        if (!keyword.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        const query = keyword.toLowerCase().trim();
        const matches = allProducts.filter(p => 
            p.productName?.toLowerCase().includes(query) ||
            p.brandName?.toLowerCase().includes(query) ||
            p.categoryName?.toLowerCase().includes(query)
        ).slice(0, 6);

        setSearchResults(matches);
        setShowDropdown(true);
    }, [keyword, allProducts]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target) &&
                mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSearchSubmit(e) {
        e.preventDefault();
        setShowDropdown(false);
        setMobileSearchOpen(false);
        if (keyword.trim()) {
            navigate(`/products?search=${encodeURIComponent(keyword.trim())}`);
        } else {
            navigate("/products");
        }
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className={`site-header ${isScrolled ? "is-scrolled shadow-lg" : ""} ${isHeaderHidden ? "header-hidden" : ""}`}>
            {/* TOP ANNOUNCEMENT BAR (HIDDEN ON MOBILE TO SAVE VERTICAL SPACE) */}
            <div className="top-announcement-bar d-none d-md-block">
                <div className="container d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-4">
                        <span className="d-flex align-items-center gap-1">
                            <LuShieldCheck size={14} className="text-primary" />
                            Cam kết 100% Chính Hãng VN/A
                        </span>
                        <span className="d-flex align-items-center gap-1">
                            <LuTruck size={14} className="text-success" />
                            Giao hàng hỏa tốc 2H
                        </span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <a href="tel:18006868" className="text-decoration-none text-white-50 d-flex align-items-center gap-1">
                            <LuPhoneCall size={13} />
                            Hotline: <strong className="text-white">1800.6868</strong>
                        </a>
                    </div>
                </div>
            </div>

            {/* MAIN HEADER ROW */}
            <div className="main-header-row">
                <div className="container d-flex align-items-center justify-content-between gap-2 gap-md-3">
                    {/* BRAND LOGO */}
                    <Link to="/" className="brand-logo">
                        <div className="brand-symbol">
                            <LuSmartphone size={18} />
                        </div>
                        <div>
                            <span className="brand-name">PHONE<span className="brand-highlight">STORE</span></span>
                        </div>
                    </Link>

                    {/* DESKTOP SEARCH AUTOCOMPLETE */}
                    <div className="header-search-wrap d-none d-md-block" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit}>
                            <LuSearch className="search-field-icon" />
                            <input
                                type="text"
                                className="search-input-field"
                                placeholder="Tìm iPhone 16 Pro Max, Galaxy S24 Ultra, Xiaomi..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                            />
                        </form>

                        {/* AUTOCOMPLETE DROPDOWN */}
                        {showDropdown && searchResults.length > 0 && (
                            <div className="search-autocomplete-dropdown">
                                <div className="px-3 py-2 text-muted small fw-bold border-bottom">
                                    Gợi ý sản phẩm phù hợp ({searchResults.length})
                                </div>
                                {searchResults.map((product) => (
                                    <Link
                                        key={product.productId}
                                        to={`/product/${product.productId}`}
                                        className="search-result-item"
                                        onClick={() => { setShowDropdown(false); setKeyword(""); }}
                                    >
                                        <img
                                            src={product.thumbnail || "/images/products/iphone-16-pro-max.jpg"}
                                            alt={product.productName}
                                            style={{ width: 36, height: 36, objectFit: "contain" }}
                                            onError={(e) => { e.target.src = "https://placehold.co/40x40?text=Phone"; }}
                                        />
                                        <div className="flex-grow-1 min-w-0">
                                            <div className="fw-semibold text-truncate small">{product.productName}</div>
                                            <div className="small text-muted">{product.brandName} • {product.storage || "Chính hãng"}</div>
                                        </div>
                                        <div className="text-end">
                                            <span className="fw-bold text-danger small tabular-nums">
                                                {formatPrice(product.discountPrice || product.price)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="d-flex align-items-center gap-2">
                        {/* MOBILE SEARCH TOGGLE BUTTON */}
                        <button 
                            type="button" 
                            className="nav-action-button d-md-none p-2"
                            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                            title="Tìm kiếm"
                        >
                            {mobileSearchOpen ? <LuX size={18} /> : <LuSearch size={18} />}
                        </button>

                        {/* WISHLIST BUTTON (DESKTOP) */}
                        <Link to="/wishlist" className="nav-action-button position-relative d-none d-md-flex" title="Danh sách yêu thích">
                            <LuHeart size={18} fill={wishlistCount > 0 ? "#ef4444" : "none"} className={wishlistCount > 0 ? "text-danger" : ""} />
                            <span className="d-none d-xl-inline">Yêu thích</span>
                            {wishlistCount > 0 && (
                                <span className="cart-count-badge bg-danger">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* COMPARE BUTTON (DESKTOP) */}
                        <Link to="/compare" className="nav-action-button position-relative d-none d-md-flex" title="So sánh điện thoại">
                            <LuGitCompare size={18} />
                            <span className="d-none d-xl-inline">So sánh</span>
                            {compareCount > 0 && (
                                <span className="cart-count-badge bg-info">
                                    {compareCount}
                                </span>
                            )}
                        </Link>

                        {/* CART BUTTON */}
                        <Link to="/cart" className="nav-action-button position-relative">
                            <LuShoppingBag size={18} />
                            <span className="d-none d-lg-inline">Giỏ hàng</span>
                            {cartCount > 0 && (
                                <span className="cart-count-badge">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* ORDERS BUTTON (DESKTOP) */}
                        <Link to="/orders" className="nav-action-button d-none d-lg-flex">
                            <LuPackage size={18} />
                            <span>Đơn hàng</span>
                        </Link>

                        {/* USER ACCOUNT DROPDOWN */}
                        {isAuthenticated ? (
                            <div className="dropdown">
                                <button
                                    className="nav-action-button border-0 dropdown-toggle d-flex align-items-center gap-2"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {userAvatar ? (
                                        <img 
                                            src={userAvatar} 
                                            alt={user?.fullName} 
                                            style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} 
                                        />
                                    ) : (
                                        <LuUser size={18} />
                                    )}
                                    <span className="text-truncate d-none d-lg-inline" style={{ maxWidth: 110 }}>
                                        {user?.fullName || "Tài khoản"}
                                    </span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" style={{ borderRadius: 12, minWidth: 220 }}>
                                    <li className="px-3 py-2 border-bottom">
                                        <div className="fw-bold text-truncate">{user?.fullName}</div>
                                        <small className="text-muted text-truncate d-block">{user?.email}</small>
                                    </li>
                                    {user?.role === "Admin" && (
                                        <li>
                                            <Link to="/admin" className="dropdown-item py-2 text-warning fw-bold d-flex align-items-center gap-2">
                                                <LuStore size={16} />
                                                Quản trị hệ thống (Admin)
                                            </Link>
                                        </li>
                                    )}
                                    <li>
                                        <Link to="/profile" className="dropdown-item py-2 d-flex align-items-center gap-2">
                                            <LuUser size={16} />
                                            Hồ sơ & Địa chỉ nhận hàng
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/wishlist" className="dropdown-item py-2 d-flex align-items-center gap-2">
                                            <LuHeart size={16} className="text-danger" />
                                            Sản phẩm yêu thích ({wishlistCount})
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/compare" className="dropdown-item py-2 d-flex align-items-center gap-2">
                                            <LuGitCompare size={16} className="text-primary" />
                                            So sánh điện thoại ({compareCount})
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/orders" className="dropdown-item py-2 d-flex align-items-center gap-2">
                                            <LuPackage size={16} />
                                            Đơn hàng của tôi
                                        </Link>
                                    </li>
                                    <li className="border-top">
                                        <button className="dropdown-item py-2 text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                                            <LuLogOut size={16} />
                                            Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link to="/login" className="nav-action-button">
                                <LuUser size={18} />
                                <span className="d-none d-sm-inline">Đăng nhập</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* EXPANDABLE MOBILE SEARCH ROW */}
            {mobileSearchOpen && (
                <div className="px-3 pb-3 d-md-none" ref={mobileSearchRef}>
                    <form onSubmit={handleSearchSubmit} className="position-relative">
                        <LuSearch className="search-field-icon" />
                        <input
                            type="text"
                            className="search-input-field"
                            placeholder="Tìm iPhone, Samsung, Xiaomi..."
                            autoFocus
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </form>

                    {/* MOBILE AUTOCOMPLETE DROPDOWN */}
                    {showDropdown && searchResults.length > 0 && (
                        <div className="search-autocomplete-dropdown mt-1">
                            {searchResults.map((product) => (
                                <Link
                                    key={product.productId}
                                    to={`/product/${product.productId}`}
                                    className="search-result-item"
                                    onClick={() => { setShowDropdown(false); setMobileSearchOpen(false); setKeyword(""); }}
                                >
                                    <img
                                        src={product.thumbnail || "/images/products/iphone-16-pro-max.jpg"}
                                        alt={product.productName}
                                        style={{ width: 36, height: 36, objectFit: "contain" }}
                                    />
                                    <div className="flex-grow-1 min-w-0">
                                        <div className="fw-semibold text-truncate small">{product.productName}</div>
                                        <div className="small text-danger fw-bold tabular-nums">
                                            {formatPrice(product.discountPrice || product.price)}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* BRAND QUICK BAR */}
            <div className="brand-nav-bar">
                <div className="container d-flex align-items-center gap-1 gap-md-2 overflow-x-auto py-1">
                    <span className="text-white-50 small fw-bold me-1 text-nowrap d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
                        <LuSlidersHorizontal size={13} /> Hãng:
                    </span>
                    {BRANDS.map((b) => (
                        <Link
                            key={b.slug}
                            to={b.slug ? `/products?brand=${b.slug}` : "/products"}
                            className="brand-pill-link text-nowrap"
                            style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                        >
                            {b.name}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
}

export default Navbar;