import { Link } from "react-router-dom";
import { useCompare } from "../../context/CompareContext";
import { formatPrice } from "../../components/product/ProductCard";
import { 
    LuGitCompare, 
    LuX, 
    LuPlus, 
    LuCpu, 
    LuLayers, 
    LuBattery, 
    LuCamera, 
    LuMonitor, 
    LuSmartphone,
    LuShieldCheck,
    LuArrowRight,
    LuShoppingCart
} from "react-icons/lu";

function Compare() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    if (!compareList || compareList.length === 0) {
        return (
            <div className="container py-5 text-center">
                <div className="card border-0 shadow-sm p-5 mx-auto rounded-4" style={{ maxWidth: 520, background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle d-inline-block mx-auto mb-3">
                        <LuGitCompare size={36} />
                    </div>
                    <h3 className="fw-bold font-display">Chưa có sản phẩm để so sánh</h3>
                    <p className="text-muted small">
                        Hãy chọn 2 hoặc 3 chiếc điện thoại bạn đang phân vân để so sánh thông số kỹ thuật chi tiết.
                    </p>
                    <div>
                        <Link to="/products" className="btn btn-primary rounded-pill px-4 mt-2">
                            ← Khám phá danh sách điện thoại
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4">
            <div className="container">
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h1 className="fw-bold fs-3 mb-1 font-display">So Sánh Chi Tiết Điện Thoại</h1>
                        <p className="text-muted small mb-0">
                            Đối đầu thông số kỹ thuật, hiệu năng vi xử lý, camera và thời lượng pin
                        </p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                            onClick={clearCompare}
                        >
                            Xóa tất cả ({compareList.length})
                        </button>
                        <Link to="/products" className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
                            <LuPlus size={14} />
                            <span>Thêm máy khác</span>
                        </Link>
                    </div>
                </div>

                {/* COMPARISON MATRIX TABLE */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="table-responsive">
                        <table className="table table-bordered align-middle mb-0" style={{ minWidth: 680 }}>
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: "22%" }} className="ps-4 text-muted fw-semibold small">
                                        Thông Số / Sản Phẩm
                                    </th>
                                    {compareList.map((product) => (
                                        <th key={product.productId} style={{ width: `${78 / compareList.length}%` }} className="text-center p-3 position-relative">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-2 text-muted hover-danger"
                                                onClick={() => removeFromCompare(product.productId)}
                                                title="Xóa máy này"
                                            >
                                                <LuX size={14} />
                                            </button>

                                            <div className="p-2 mb-2 bg-white rounded-3 border d-inline-block">
                                                <img
                                                    src={product.thumbnail || "/images/products/iphone-16-pro-max.jpg"}
                                                    alt={product.productName}
                                                    style={{ width: 110, height: 110, objectFit: "contain" }}
                                                    onError={(e) => { e.target.src = "https://placehold.co/110x110?text=Phone"; }}
                                                />
                                            </div>

                                            <h6 className="fw-bold font-display mb-1 text-truncate" title={product.productName}>
                                                {product.productName}
                                            </h6>
                                            <div className="fs-5 fw-bold text-danger font-display tabular-nums mb-2">
                                                {formatPrice(product.discountPrice || product.price)}
                                            </div>

                                            <Link
                                                to={`/product/${product.productId}`}
                                                className="btn btn-primary btn-sm rounded-pill px-3 w-100 fw-bold"
                                            >
                                                Xem Chi Tiết
                                            </Link>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* BRAND & CATEGORY */}
                                <tr>
                                    <td className="ps-4 fw-semibold small text-muted">Hãng & Phân khúc</td>
                                    {compareList.map((p) => (
                                        <td key={p.productId} className="text-center small">
                                            <span className="badge bg-light text-dark border me-1">{p.brandName}</span>
                                            <span className="badge bg-light text-muted border">{p.categoryName}</span>
                                        </td>
                                    ))}
                                </tr>

                                {/* CHIP */}
                                <tr>
                                    <td className="ps-4 fw-semibold small text-muted">
                                        <div className="d-flex align-items-center gap-2">
                                            <LuCpu className="text-primary" />
                                            <span>Vi xử lý (CPU / GPU)</span>
                                        </div>
                                    </td>
                                    {compareList.map((p) => (
                                        <td key={p.productId} className="text-center fw-bold small text-primary">
                                            {p.chip || "Đang cập nhật"}
                                        </td>
                                    ))}
                                </tr>

                                {/* RAM */}
                                <tr>
                                    <td className="ps-4 fw-semibold small text-muted">
                                        <div className="d-flex align-items-center gap-2">
                                            <LuLayers className="text-primary" />
                                            <span>Bộ nhớ RAM</span>
                                        </div>
                                    </td>
                                    {compareList.map((p) => (
                                        <td key={p.productId} className="text-center small tabular-nums">
                                            {p.ram || "Đang cập nhật"}
                                        </td>
                                    ))}
                                </tr>

                                {/* STORAGE */}
                                <tr>
                                    <td className="ps-4 fw-semibold small text-muted">Dung lượng lưu trữ</td>
                                    {compareList.map((p) => (
                                        <td key={p.productId} className="text-center small tabular-nums fw-semibold">
                                            {p.storage || "256GB"}
                                        </td>
                                    ))}
                                </tr>

                                {/* SCREEN */}
                                <tr>
                                    <td className="ps-4 fw-semibold small text-muted">
                                        <div className="d-flex align-items-center gap-2">
                                            <LuMonitor className="text-primary" />
                                            <span>Màn hình hiển thị</span>
                                        </div>
                                    </td>
                                    {compareList.map((p) => (
                                        <td key={p.productId} className="text-center small">
                                            {p.screen || "Đang cập nhật"}
                                        </td>
                                    ))}
                                </tr>

                                {/* REAR CAMERA */}
                                <tr>
                                    <td className="ps-4 fw-semibold small text-muted">
                                        <div className="d-flex align-items-center gap-2">
                                            <LuCamera className="text-primary" />
                                            <span>Camera sau</span>
                                        </div>
                                    </td>
                                    {compareList.map((p) => (
                                        <td key={p.productId} className="text-center small">
                                            {p.rearCamera || "Đang cập nhật"}
                                        </td>
                                    ))}
                                </tr>

                                {/* FRONT CAMERA */}
                                <tr>
                                    <td className="ps-4 fw-semibold small text-muted">Camera selfie (Trước)</td>
                                    {compareList.map((p) => (
                                        <td key={p.productId} className="text-center small">
                                            {p.frontCamera || "Đang cập nhật"}
                                        </td>
                                    ))}
                                </tr>

                                {/* BATTERY & CHARGING */}
                                <tr>
                                    <td className="ps-4 fw-semibold small text-muted">
                                        <div className="d-flex align-items-center gap-2">
                                            <LuBattery className="text-primary" />
                                            <span>Pin & Công nghệ sạc</span>
                                        </div>
                                    </td>
                                    {compareList.map((p) => (
                                        <td key={p.productId} className="text-center small">
                                            {p.battery || "Đang cập nhật"}
                                        </td>
                                    ))}
                                </tr>

                                {/* OPERATING SYSTEM */}
                                <tr>
                                    <td className="ps-4 fw-semibold small text-muted">
                                        <div className="d-flex align-items-center gap-2">
                                            <LuSmartphone className="text-primary" />
                                            <span>Hệ điều hành</span>
                                        </div>
                                    </td>
                                    {compareList.map((p) => (
                                        <td key={p.productId} className="text-center small">
                                            {p.operatingSystem || "Đang cập nhật"}
                                        </td>
                                    ))}
                                </tr>

                                {/* WEIGHT & COLOR */}
                                <tr>
                                    <td className="ps-4 fw-semibold small text-muted">Trọng lượng & Màu sắc</td>
                                    {compareList.map((p) => (
                                        <td key={p.productId} className="text-center small text-muted">
                                            {p.weight ? `${p.weight} • ` : ""}{p.color || "Titan"}
                                        </td>
                                    ))}
                                </tr>

                                {/* WARRANTY */}
                                <tr>
                                    <td className="ps-4 fw-semibold small text-muted">
                                        <div className="d-flex align-items-center gap-2">
                                            <LuShieldCheck className="text-success" />
                                            <span>Chính sách bảo hành</span>
                                        </div>
                                    </td>
                                    {compareList.map((p) => (
                                        <td key={p.productId} className="text-center small text-success fw-semibold">
                                            {p.warranty || 12} tháng chính hãng (1 đổi 1 30 ngày)
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Compare;
