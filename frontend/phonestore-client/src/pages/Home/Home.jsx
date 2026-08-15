import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
    LuSparkles, 
    LuFlame, 
    LuShieldCheck, 
    LuTruck, 
    LuArrowRight, 
    LuCreditCard, 
    LuClock, 
    LuRotateCcw,
    LuCpu,
    LuZap
} from "react-icons/lu";
import productApi from "../../api/productApi";
import ProductCard from "../../components/product/ProductCard";
import Hero3DPhoneShowcase from "../../components/home/Hero3DPhoneShowcase";

function Home() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    // Countdown Timer for Flash Sale (simulated 24h cycle)
    const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return { hours: 23, minutes: 59, seconds: 59 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);
                setError("");
                const response = await productApi.getAll();
                const data = Array.isArray(response.data) ? response.data : [];
                setProducts(data);
            } catch (err) {
                console.error(err);
                setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    // HOT SALES: Sorted by discount amount
    const hotProducts = useMemo(() => {
        return [...products]
            .sort((a, b) => {
                const aDiscount = a.discountPrice && a.discountPrice < a.price ? a.price - a.discountPrice : 0;
                const bDiscount = b.discountPrice && b.discountPrice < b.price ? b.price - b.discountPrice : 0;
                return bDiscount - aDiscount;
            })
            .slice(0, 4);
    }, [products]);

    // NEW ARRIVALS
    const newProducts = useMemo(() => {
        return [...products].reverse().slice(0, 8);
    }, [products]);

    // FILTERED PRODUCTS BY CATEGORY
    const filteredProducts = useMemo(() => {
        if (activeCategory === "all") return products.slice(0, 8);
        return products.filter(p => 
            p.categoryName?.toLowerCase().includes(activeCategory.toLowerCase()) ||
            p.brandName?.toLowerCase().includes(activeCategory.toLowerCase())
        );
    }, [products, activeCategory]);

    return (
        <div className="home-container pb-5">
            {/* =================================================
                HERO FLAGSHIP SHOWCASE
            ================================================= */}
            <section className="mb-5">
                <div className="hero-showcase-container">
                    <div className="row align-items-center g-4">
                        <div className="col-12 col-lg-6 hero-content-col">
                            <div className="hero-lead-badge">
                                <span className="hero-badge-pulse"></span>
                                <LuSparkles size={13} className="text-warning" />
                                <span>Thế Hệ Smartphone Flagship 2026</span>
                            </div>

                            <h1 className="hero-main-title">
                                <span className="d-block text-white">Đỉnh Cao Công Nghệ.</span>
                                <span className="hero-gradient-text">Kiến Tạo Tương Lai.</span>
                            </h1>

                            <p className="hero-description-text">
                                Sở hữu ngay các siêu phẩm iPhone 16 Pro Max Titan, Galaxy S24 Ultra và ROG Phone 8 Pro với ưu đãi trợ giá chính hãng đến 25% cùng chính sách bảo hành 1 đổi 1 trong 30 ngày.
                            </p>

                            <div className="d-flex flex-wrap gap-3 mb-4">
                                <button
                                    type="button"
                                    className="btn btn-primary px-4 py-3 fw-bold rounded-pill d-flex align-items-center gap-2"
                                    onClick={() => navigate("/products")}
                                >
                                    <span>Khám Phá Bộ Sưu Tập</span>
                                    <LuArrowRight size={18} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-light px-4 py-3 fw-bold rounded-pill"
                                    onClick={() => navigate("/products?brand=apple")}
                                >
                                    Xem iPhone 16 Series
                                </button>
                            </div>

                            {/* STATS METRICS */}
                            <div className="d-flex gap-4 pt-3 border-top border-secondary border-opacity-25 flex-wrap">
                                <div>
                                    <div className="fs-5 fw-bold text-white">100%</div>
                                    <small className="text-white-50">Chính Hãng VN/A</small>
                                </div>
                                <div className="vr bg-secondary opacity-50"></div>
                                <div>
                                    <div className="fs-5 fw-bold text-white">30 Ngày</div>
                                    <small className="text-white-50">1 Đổi 1 Tức Thì</small>
                                </div>
                                <div className="vr bg-secondary opacity-50"></div>
                                <div>
                                    <div className="fs-5 fw-bold text-white">0% Lãi Suất</div>
                                    <small className="text-white-50">Hỗ Trợ Trả Góp</small>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-6 text-center p-2 p-md-4">
                            <Hero3DPhoneShowcase />
                        </div>
                    </div>
                </div>

                {/* TRUST PILLARS BAR */}
                <div className="trust-pillars-bar">
                    <div className="row g-3">
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="trust-pillar-item">
                                <div className="trust-icon-box">
                                    <LuShieldCheck size={22} />
                                </div>
                                <div>
                                    <div className="trust-title">100% Hàng Chính Hãng</div>
                                    <div className="trust-subtitle">Bảo hành 12 tháng tại hãng</div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="trust-pillar-item">
                                <div className="trust-icon-box">
                                    <LuTruck size={22} />
                                </div>
                                <div>
                                    <div className="trust-title">Giao Hỏa Tốc 2 Giờ</div>
                                    <div className="trust-subtitle">Miễn phí ship toàn quốc từ 500k</div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="trust-pillar-item">
                                <div className="trust-icon-box">
                                    <LuRotateCcw size={22} />
                                </div>
                                <div>
                                    <div className="trust-title">1 Đổi 1 Trong 30 Ngày</div>
                                    <div className="trust-subtitle">Yên tâm tuyệt đối khi sử dụng</div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="trust-pillar-item">
                                <div className="trust-icon-box">
                                    <LuCreditCard size={22} />
                                </div>
                                <div>
                                    <div className="trust-title">Trả Góp 0% Lãi Suất</div>
                                    <div className="trust-subtitle">Xét duyệt nhanh qua thẻ tín dụng</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================
                FLASH SALE WITH REALTIME COUNTDOWN
            ================================================= */}
            <section className="mb-5 pt-3">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded-3 bg-danger text-white d-flex align-items-center gap-1">
                            <LuFlame size={20} />
                            <span className="fw-bold fs-6 text-uppercase">Flash Sale</span>
                        </div>
                        <div className="d-flex align-items-center gap-1 text-muted small fw-semibold">
                            <LuClock size={16} />
                            <span>Kết thúc sau:</span>
                            <span className="badge bg-dark text-white p-2 tabular-nums">
                                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                    <Link to="/products" className="text-primary fw-bold text-decoration-none small d-flex align-items-center gap-1">
                        <span>Xem tất cả ưu đãi</span>
                        <LuArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : (
                    <div className="row g-2 g-md-4">
                        {hotProducts.map((product) => (
                            <div className="col-6 col-md-4 col-lg-3" key={product.productId}>
                                <ProductCard product={product} badge="⚡ Giảm Sốc" />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* =================================================
                CATEGORY TABS & FEATURED PRODUCTS
            ================================================= */}
            <section className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <div>
                        <h3 className="fw-bold mb-1 font-display">Bộ Sưu Tập Nổi Bật</h3>
                        <p className="text-muted small mb-0">Lựa chọn mẫu smartphone theo nhu cầu của bạn</p>
                    </div>

                    {/* CATEGORY SWITCHER PILLS */}
                    <div className="d-flex gap-2 flex-wrap">
                        {[
                            { key: "all", label: "Tất cả" },
                            { key: "flagship", label: "Flagship Đỉnh Cao" },
                            { key: "gaming", label: "Gaming Phone" },
                            { key: "apple", label: "Apple iPhone" },
                            { key: "samsung", label: "Samsung Galaxy" },
                            { key: "xiaomi", label: "Xiaomi" }
                        ].map((cat) => (
                            <button
                                key={cat.key}
                                type="button"
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeCategory === cat.key ? "btn-primary" : "btn-outline-secondary"}`}
                                onClick={() => setActiveCategory(cat.key)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="row g-2 g-md-4">
                    {filteredProducts.map((product) => (
                        <div className="col-6 col-md-4 col-lg-3" key={product.productId}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </section>

            {/* =================================================
                EDITORIAL FEATURE SPOTLIGHTS
            ================================================= */}
            <section className="mb-5">
                <div className="row g-4">
                    <div className="col-12 col-md-6">
                        <div className="p-4 rounded-4 text-white position-relative overflow-hidden h-100 d-flex flex-column justify-content-between" style={{ background: "linear-gradient(135deg, #182234 0%, #0f172a 100%)", border: "1px solid #334155" }}>
                            <div>
                                <span className="badge bg-primary px-3 py-1 mb-3">AI CAMERA PRO</span>
                                <h4 className="fw-bold mb-2 font-display">Xiaomi 14 Ultra 5G</h4>
                                <p className="text-white-50 small mb-4">4 camera 50MP cảm biến 1 inch cùng ống kính quang học Leica Summilux huyền thoại.</p>
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline-light rounded-pill px-4 align-self-start fw-bold"
                                onClick={() => navigate("/products?brand=xiaomi")}
                            >
                                Khám phá ngay →
                            </button>
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="p-4 rounded-4 text-white position-relative overflow-hidden h-100 d-flex flex-column justify-content-between" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", border: "1px solid #4338ca" }}>
                            <div>
                                <span className="badge bg-danger px-3 py-1 mb-3">GAMING BEAST</span>
                                <h4 className="fw-bold mb-2 font-display">ASUS ROG Phone 8 Pro</h4>
                                <p className="text-white-50 small mb-4">Tần số quét 165Hz, Snapdragon 8 Gen 3 và hệ thống tản nhiệt GameCool 8 vô địch.</p>
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline-light rounded-pill px-4 align-self-start fw-bold"
                                onClick={() => navigate("/products?brand=asus")}
                            >
                                Xem chi tiết →
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;