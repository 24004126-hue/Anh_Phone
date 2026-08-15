import { Link, useLocation } from "react-router-dom";
import { useCompare } from "../../context/CompareContext";
import { LuArrowRight, LuX, LuGitCompare } from "react-icons/lu";

function CompareBar() {
    const { compareList, compareCount, removeFromCompare, clearCompare } = useCompare();
    const location = useLocation();

    // Hide if on /compare page or if no items selected
    if (compareCount === 0 || location.pathname === "/compare") {
        return null;
    }

    return (
        <div 
            className="fixed-bottom p-2 p-md-3 bg-white border-top shadow-lg z-3"
            style={{ 
                borderTop: "2px solid #0284c7",
                boxShadow: "0 -10px 25px -5px rgba(0, 0, 0, 0.1), 0 -8px 10px -6px rgba(0, 0, 0, 0.1)"
            }}
        >
            <div className="container d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3">
                    <div className="d-none d-md-flex align-items-center gap-2 text-primary fw-bold">
                        <LuGitCompare size={20} />
                        <span className="font-display">So Sánh Sản Phẩm:</span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        {compareList.map((product) => (
                            <div 
                                key={product.productId}
                                className="d-flex align-items-center gap-2 p-1 pe-2 bg-light rounded-pill border position-relative"
                                style={{ maxWidth: 180 }}
                            >
                                <img
                                    src={product.thumbnail || "/images/products/iphone-16-pro-max.jpg"}
                                    alt={product.productName}
                                    style={{ width: 28, height: 28, objectFit: "contain" }}
                                    className="rounded-circle bg-white p-0.5 border"
                                    onError={(e) => { e.target.src = "https://placehold.co/28x28?text=Phone"; }}
                                />
                                <span className="small text-truncate fw-semibold" style={{ fontSize: "0.78rem" }}>
                                    {product.productName}
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-link p-0 text-muted hover-danger"
                                    onClick={() => removeFromCompare(product.productId)}
                                    title="Xóa khỏi so sánh"
                                >
                                    <LuX size={13} />
                                </button>
                            </div>
                        ))}

                        {Array.from({ length: 3 - compareCount }).map((_, i) => (
                            <div 
                                key={i}
                                className="d-none d-sm-flex align-items-center justify-content-center border border-dashed rounded-pill px-3 py-1 text-muted small"
                                style={{ fontSize: "0.75rem", borderStyle: "dashed" }}
                            >
                                + Thêm máy
                            </div>
                        ))}
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2 ms-auto">
                    <button
                        type="button"
                        className="btn btn-link btn-sm text-muted text-decoration-none p-0 me-2"
                        onClick={clearCompare}
                    >
                        Xóa tất cả
                    </button>
                    <Link
                        to="/compare"
                        className="btn btn-primary btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-2 shadow-sm"
                    >
                        <span>So Sánh Ngay ({compareCount})</span>
                        <LuArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CompareBar;
