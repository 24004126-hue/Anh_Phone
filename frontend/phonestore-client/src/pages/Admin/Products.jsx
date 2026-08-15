import { useEffect, useState } from "react";
import { Button, Table, Badge, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
    LuPlus, 
    LuSearch, 
    LuPencil, 
    LuTrash2, 
    LuSmartphone 
} from "react-icons/lu";
import productApi from "../../api/productApi";
import { formatPrice } from "../../components/product/ProductCard";

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            setLoading(true);
            const res = await productApi.getAll();
            setProducts(res.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải danh sách sản phẩm.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id, name) {
        const confirm = window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name || id}"?`);
        if (!confirm) return;

        try {
            await productApi.delete(id);
            toast.success(`Đã xóa sản phẩm "${name || id}" thành công!`);
            loadProducts();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Không thể xóa sản phẩm.");
        }
    }

    const filtered = products.filter(p => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            p.productName?.toLowerCase().includes(term) ||
            p.brandName?.toLowerCase().includes(term) ||
            p.categoryName?.toLowerCase().includes(term) ||
            p.sku?.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Đang tải danh sách sản phẩm...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-0 font-display fs-4">Quản Lý Sản Phẩm</h2>
                    <p className="text-muted small mb-0">Quản lý danh mục smartphone, giá niêm yết và tồn kho</p>
                </div>
                <Link to="/admin/products/create" className="btn btn-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                    <LuPlus size={16} />
                    <span>Thêm Sản Phẩm Mới</span>
                </Link>
            </div>

            {/* SEARCH */}
            <div className="card border-0 shadow-sm p-3 mb-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><LuSearch className="text-muted" /></span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Tìm theo tên máy, hãng, danh mục, SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-12 col-md-6 text-md-end">
                        <span className="badge bg-primary fs-6 rounded-pill px-3 py-2">
                            Hiển thị: {filtered.length} / {products.length} sản phẩm
                        </span>
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center my-4 rounded-4">
                    <div className="text-muted">Không tìm thấy sản phẩm nào phù hợp.</div>
                </div>
            ) : (
                <div className="card border-0 shadow-sm overflow-hidden rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light small">
                                <tr>
                                    <th className="ps-4">ID</th>
                                    <th>Ảnh</th>
                                    <th>Tên Sản Phẩm</th>
                                    <th>Giá Bán</th>
                                    <th>Tồn Kho</th>
                                    <th>Đã Bán</th>
                                    <th>Hãng / Phân Khúc</th>
                                    <th className="text-center pe-4" width="160">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((product) => (
                                    <tr key={product.productId}>
                                        <td className="ps-4 fw-bold text-muted tabular-nums">#{product.productId}</td>
                                        <td>
                                            <img
                                                src={product.thumbnail || "https://placehold.co/80x80?text=Phone"}
                                                alt={product.productName}
                                                style={{ width: 44, height: 44, objectFit: "contain" }}
                                                className="rounded bg-light p-1 border"
                                                onError={(e) => { e.target.src = "https://placehold.co/80x80?text=Phone"; }}
                                            />
                                        </td>
                                        <td>
                                            <div className="fw-semibold small">{product.productName}</div>
                                            {product.sku && <small className="text-muted">SKU: {product.sku}</small>}
                                        </td>
                                        <td>
                                            <div className="fw-bold text-danger font-display tabular-nums small">
                                                {formatPrice(product.discountPrice || product.price)}
                                            </div>
                                            {product.discountPrice && product.discountPrice < product.price && (
                                                <small className="text-muted text-decoration-line-through tabular-nums">
                                                    {formatPrice(product.price)}
                                                </small>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge px-2 py-1 rounded-pill small ${product.quantity > 10 ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25" : (product.quantity > 0 ? "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25" : "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25")}`}>
                                                {product.quantity > 0 ? `${product.quantity} máy` : "Hết hàng"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="fw-semibold text-primary tabular-nums small">{product.soldQuantity || 0}</span>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border px-2 py-1 small">{product.brandName || "N/A"}</span>
                                            <div className="small text-muted">{product.categoryName || "N/A"}</div>
                                        </td>
                                        <td className="text-center pe-4">
                                            <div className="d-flex justify-content-center gap-2">
                                                <Link
                                                    to={`/admin/products/edit/${product.productId}`}
                                                    className="btn btn-outline-warning btn-sm rounded-pill px-2 d-flex align-items-center gap-1 small"
                                                    title="Chỉnh sửa"
                                                >
                                                    <LuPencil size={13} />
                                                    <span>Sửa</span>
                                                </Link>
                                                <button
                                                    className="btn btn-outline-danger btn-sm rounded-pill px-2 d-flex align-items-center"
                                                    title="Xóa"
                                                    onClick={() => handleDelete(product.productId, product.productName)}
                                                >
                                                    <LuTrash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProducts;