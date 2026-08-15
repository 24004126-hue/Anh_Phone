import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
    LuDollarSign, 
    LuShoppingBag, 
    LuSmartphone, 
    LuUsers, 
    LuRotateCcw, 
    LuTriangleAlert, 
    LuCircleCheck, 
    LuArrowRight,
    LuTrendingUp,
    LuLayers,
    LuTrophy,
    LuSparkles
} from "react-icons/lu";
import dashboardApi from "../../api/dashboardApi";
import orderApi from "../../api/orderApi";
import productApi from "../../api/productApi";
import { formatPrice } from "../../components/product/ProductCard";

function Dashboard() {
    const [data, setData] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        monthlyRevenue: [],
        brandShares: [],
        statusDistribution: { pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 },
        topSellingProducts: []
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            setLoading(true);
            const [dashRes, ordersRes, productsRes] = await Promise.allSettled([
                dashboardApi.getDashboard(),
                orderApi.getAllAdmin(),
                productApi.getAll()
            ]);

            if (dashRes.status === "fulfilled") {
                setData(dashRes.value.data);
            }
            if (ordersRes.status === "fulfilled") {
                const orders = ordersRes.value.data || [];
                setRecentOrders(orders.slice(0, 6));
            }
            if (productsRes.status === "fulfilled") {
                const products = productsRes.value.data || [];
                const low = products.filter(p => p.quantity <= 10).slice(0, 5);
                setLowStockProducts(low);
            }
        } catch (error) {
            console.error("Dashboard load error:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Đang tổng hợp số liệu kinh doanh...</p>
            </div>
        );
    }

    // Chart calculations
    const maxMonthlyRev = Math.max(...(data.monthlyRevenue?.map(m => m.revenue) || [1]), 1000000);
    const totalSoldAllBrands = data.brandShares?.reduce((sum, b) => sum + b.soldCount, 0) || 1;

    return (
        <div>
            {/* PAGE HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-0 font-display fs-4">Trung Tâm Thống Kê & Phân Tích Kinh Doanh</h2>
                    <p className="text-muted small mb-0">Biểu đồ doanh thu thực tế, phân tích thị phần và chỉ số tăng trưởng</p>
                </div>
                <button 
                    className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 fw-bold" 
                    onClick={loadDashboardData}
                >
                    <LuRotateCcw size={14} />
                    <span>Làm Mới Số Liệu</span>
                </button>
            </div>

            {/* 1. TOP KEY METRICS CARDS */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm p-4 rounded-4 h-100" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-bold text-uppercase">Doanh Thu Thuần</span>
                            <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
                                <LuDollarSign size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-success mb-1 font-display tabular-nums">
                            {formatPrice(data.totalRevenue)}
                        </h3>
                        <small className="text-muted d-flex align-items-center gap-1 text-success fw-semibold">
                            <LuTrendingUp size={13} /> Tăng trưởng ổn định
                        </small>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm p-4 rounded-4 h-100" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-bold text-uppercase">Tổng Đơn Hàng</span>
                            <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                                <LuShoppingBag size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-primary mb-1 font-display tabular-nums">
                            {data.totalOrders}
                        </h3>
                        <small className="text-muted">Đơn hàng trong hệ thống</small>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm p-4 rounded-4 h-100" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-bold text-uppercase">Mẫu Smartphone</span>
                            <div className="p-2 rounded-3 bg-info bg-opacity-10 text-info">
                                <LuSmartphone size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-dark mb-1 font-display tabular-nums">
                            {data.totalProducts}
                        </h3>
                        <small className="text-muted">Sản phẩm đang kinh doanh</small>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm p-4 rounded-4 h-100" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-bold text-uppercase">Thành Viên</span>
                            <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning">
                                <LuUsers size={20} />
                            </div>
                        </div>
                        <h3 className="fw-bold text-dark mb-1 font-display tabular-nums">
                            {data.totalUsers}
                        </h3>
                        <small className="text-muted">Tài khoản khách hàng</small>
                    </div>
                </div>
            </div>

            {/* 2. VISUAL CHARTS ROW: REVENUE TREND & BRAND SHARES */}
            <div className="row g-4 mb-4">
                {/* MONTHLY REVENUE CHART */}
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm p-4 rounded-4 h-100" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 className="fw-bold mb-1 font-display fs-6 d-flex align-items-center gap-2">
                                    <LuTrendingUp className="text-primary" />
                                    <span>Xu Hướng Doanh Thu (6 Tháng Gần Nhất)</span>
                                </h5>
                                <small className="text-muted">Doanh số bán hàng thực tế được phân bổ theo từng tháng</small>
                            </div>
                        </div>

                        {/* VISUAL SVG / CSS BAR CHART */}
                        <div className="d-flex align-items-end justify-content-between gap-2 pt-3 pb-2 border-bottom" style={{ height: 220 }}>
                            {data.monthlyRevenue?.map((m, index) => {
                                const heightPercent = Math.max(Math.round((m.revenue / maxMonthlyRev) * 100), 12);
                                return (
                                    <div key={index} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end group position-relative">
                                        <div className="small fw-bold text-primary tabular-nums mb-1" style={{ fontSize: "0.72rem" }}>
                                            {formatPrice(m.revenue)}
                                        </div>
                                        <div 
                                            className="w-100 rounded-3 transition-all cursor-pointer shadow-sm"
                                            style={{ 
                                                height: `${heightPercent}%`, 
                                                background: index === data.monthlyRevenue.length - 1 ? "linear-gradient(180deg, #0284c7 0%, #0369a1 100%)" : "linear-gradient(180deg, #93c5fd 0%, #60a5fa 100%)",
                                                maxWidth: 54
                                            }}
                                            title={`${m.Month}: ${formatPrice(m.revenue)} (${m.OrderCount} đơn)`}
                                        />
                                        <span className="small text-muted fw-bold mt-2 font-display">{m.Month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* BRAND MARKET SHARES */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm p-4 rounded-4 h-100" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <h5 className="fw-bold mb-1 font-display fs-6 d-flex align-items-center gap-2">
                            <LuLayers className="text-info" />
                            <span>Thị Phần Doanh Số Thương Hiệu</span>
                        </h5>
                        <small className="text-muted mb-3 d-block">Tỷ lệ số lượng máy bán ra theo từng hãng</small>

                        <div className="d-flex flex-column gap-3">
                            {data.brandShares?.map((brand) => {
                                const percent = Math.min(Math.round((brand.soldCount / totalSoldAllBrands) * 100), 100);
                                return (
                                    <div key={brand.BrandName}>
                                        <div className="d-flex justify-content-between align-items-center small mb-1">
                                            <strong className="text-dark font-display">{brand.BrandName}</strong>
                                            <span className="text-muted tabular-nums">{brand.soldCount} máy ({percent}%)</span>
                                        </div>
                                        <div className="progress rounded-pill" style={{ height: 7, background: "#f1f5f9" }}>
                                            <div 
                                                className="progress-bar rounded-pill bg-primary" 
                                                style={{ width: `${percent || 10}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. TOP PRODUCTS LEADERBOARD & RECENT ORDERS */}
            <div className="row g-4 mb-4">
                {/* TOP SELLING LEADERBOARD */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
                            <h5 className="fw-bold mb-0 font-display fs-6 text-warning text-dark d-flex align-items-center gap-2">
                                <LuTrophy className="text-warning" size={18} />
                                <span>Top 5 Smartphone Bán Chạy Nhất</span>
                            </h5>
                            <span className="badge bg-warning bg-opacity-10 text-dark border small">Toàn thời gian</span>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0 small">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4" style={{ width: "8%" }}>Top</th>
                                            <th>Sản Phẩm</th>
                                            <th className="text-center">Đã Bán</th>
                                            <th className="text-end pe-4">Doanh Thu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.topSellingProducts?.map((prod, idx) => (
                                            <tr key={prod.ProductId}>
                                                <td className="ps-4">
                                                    <span className={`badge rounded-circle p-1 fw-bold ${idx === 0 ? "bg-warning text-dark" : idx === 1 ? "bg-secondary text-white" : idx === 2 ? "bg-danger text-white" : "bg-light text-muted border"}`} style={{ width: 22, height: 22 }}>
                                                        {idx + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <img
                                                            src={prod.Thumbnail || "/images/products/iphone-16-pro-max.jpg"}
                                                            alt={prod.ProductName}
                                                            style={{ width: 32, height: 32, objectFit: "contain" }}
                                                            className="rounded bg-white p-0.5 border"
                                                            onError={(e) => { e.target.src = "https://placehold.co/32x32?text=Phone"; }}
                                                        />
                                                        <span className="fw-semibold text-truncate" style={{ maxWidth: 160 }} title={prod.ProductName}>
                                                            {prod.ProductName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="text-center fw-bold tabular-nums text-primary">
                                                    {prod.SoldQuantity}
                                                </td>
                                                <td className="text-end pe-4 fw-bold text-danger tabular-nums">
                                                    {formatPrice(prod.Revenue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LOW STOCK ALERTS & ORDER STATUS METRICS */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
                            <h5 className="fw-bold mb-0 font-display fs-6 text-danger d-flex align-items-center gap-2">
                                <LuTriangleAlert size={18} />
                                <span>Cảnh Báo Tồn Kho Dưới 10 Máy</span>
                            </h5>
                            <Link to="/admin/products" className="small text-decoration-none fw-bold">
                                Quản lý kho →
                            </Link>
                        </div>
                        <div className="card-body p-3">
                            {lowStockProducts.length === 0 ? (
                                <div className="p-4 text-center text-success d-flex align-items-center justify-content-center gap-2">
                                    <LuCircleCheck size={18} />
                                    <span>Tồn kho dồi dào, không có máy nào dưới 10 chiếc!</span>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {lowStockProducts.map((prod) => (
                                        <div key={prod.productId} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light border">
                                            <div className="d-flex align-items-center gap-2">
                                                <img
                                                    src={prod.thumbnail || "https://placehold.co/50x50?text=Phone"}
                                                    alt={prod.productName}
                                                    style={{ width: 36, height: 36, objectFit: "contain" }}
                                                    className="rounded bg-white p-1 border"
                                                    onError={(e) => { e.target.src = "https://placehold.co/50x50?text=Phone"; }}
                                                />
                                                <div>
                                                    <div className="fw-semibold small text-truncate" style={{ maxWidth: 200 }} title={prod.productName}>
                                                        {prod.productName}
                                                    </div>
                                                    <small className="text-muted">{prod.brandName}</small>
                                                </div>
                                            </div>
                                            <span className={`badge px-2 py-1 rounded-pill ${prod.quantity === 0 ? "bg-danger" : "bg-warning text-dark"}`}>
                                                {prod.quantity === 0 ? "Hết hàng" : `Còn ${prod.quantity}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;