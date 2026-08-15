import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    LuShoppingBag, 
    LuTrash2, 
    LuMinus, 
    LuPlus, 
    LuShieldCheck, 
    LuTruck, 
    LuArrowRight, 
    LuArrowLeft,
    LuLock
} from "react-icons/lu";
import cartApi from "../../api/cartApi";
import productApi from "../../api/productApi";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import { formatPrice } from "../../components/product/ProductCard";

function Cart() {
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        loadCart();
    }, []);

    async function loadCart() {
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                navigate("/login");
                return;
            }

            const res = await cartApi.getCart(userId);
            setCart(res.data);
            await refreshCart();
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải thông tin giỏ hàng.");
        } finally {
            setLoading(false);
        }
    }

    async function increase(item) {
        try {
            setUpdatingId(item.cartItemId);
            const res = await productApi.getById(item.productId);
            const product = res.data;

            if (product.quantity <= 0) {
                toast.error("Sản phẩm đã hết hàng.");
                return;
            }

            if (item.quantity >= product.quantity) {
                toast.warn(`Sản phẩm này chỉ còn ${product.quantity} sản phẩm trong kho.`);
                return;
            }

            await cartApi.updateQuantity({
                cartItemId: item.cartItemId,
                quantity: item.quantity + 1
            });

            await loadCart();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Không thể tăng số lượng.");
        } finally {
            setUpdatingId(null);
        }
    }

    async function decrease(item) {
        if (item.quantity <= 1) return;

        try {
            setUpdatingId(item.cartItemId);
            await cartApi.updateQuantity({
                cartItemId: item.cartItemId,
                quantity: item.quantity - 1
            });

            await loadCart();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Không thể giảm số lượng.");
        } finally {
            setUpdatingId(null);
        }
    }

    async function removeItem(cartItemId, name) {
        try {
            setUpdatingId(cartItemId);
            await cartApi.removeItem(cartItemId);
            await loadCart();
            toast.info(`Đã xóa "${name || "sản phẩm"}" khỏi giỏ hàng.`);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Không thể xóa sản phẩm.");
        } finally {
            setUpdatingId(null);
        }
    }

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 text-muted">Đang tải giỏ hàng của bạn...</p>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="container py-5 text-center">
                <div className="card border-0 shadow-sm p-5 mx-auto rounded-4" style={{ maxWidth: 480, background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="p-3 bg-light rounded-circle d-inline-flex mx-auto mb-3 text-muted">
                        <LuShoppingBag size={48} />
                    </div>
                    <h3 className="fw-bold font-display">Giỏ Hàng Đang Trống</h3>
                    <p className="text-muted small">Hãy chọn ngay những mẫu smartphone cao cấp yêu thích để bắt đầu trải nghiệm mua sắm!</p>
                    <div>
                        <Link to="/products" className="btn btn-primary px-4 py-2 fw-bold rounded-pill mt-2">
                            Khám Phá Sản Phẩm Ngay
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4">
            <div className="container">
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                    <div>
                        <h1 className="fw-bold fs-3 mb-0 font-display">Giỏ Hàng Của Bạn</h1>
                        <p className="text-muted small mb-0">Kiểm tra danh sách máy và số lượng trước khi đặt hàng</p>
                    </div>
                    <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                        {cart.totalQuantity} sản phẩm
                    </span>
                </div>

                <div className="row g-4">
                    {/* CART ITEMS LIST */}
                    <div className="col-12 col-lg-8">
                        <div className="card border-0 shadow-sm overflow-hidden rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                            <div className="table-responsive">
                                <table className="table align-middle table-hover mb-0">
                                    <thead className="table-light small">
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Đơn giá</th>
                                            <th className="text-center">Số lượng</th>
                                            <th className="text-end">Tạm tính</th>
                                            <th className="text-center">Xóa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.items.map((item) => (
                                            <tr key={item.cartItemId}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img
                                                            src={item.thumbnail || "/images/products/iphone-16-pro-max.jpg"}
                                                            alt={item.productName}
                                                            className="rounded border p-1"
                                                            style={{
                                                                width: "60px",
                                                                height: "60px",
                                                                objectFit: "contain",
                                                                background: "#f8fafc"
                                                            }}
                                                            onError={(e) => {
                                                                e.target.src = "https://placehold.co/100x100?text=Phone";
                                                            }}
                                                        />
                                                        <div>
                                                            <Link
                                                                to={`/product/${item.productId}`}
                                                                className="fw-bold text-dark text-decoration-none small"
                                                            >
                                                                {item.productName}
                                                            </Link>
                                                            <div className="small text-muted">Mã: #{item.productId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="fw-semibold small tabular-nums">
                                                    {formatPrice(item.price)}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center border rounded-pill px-2 py-0 bg-white" style={{ maxWidth: 100, margin: "0 auto" }}>
                                                        <button
                                                            className="btn btn-sm btn-link text-dark p-1 text-decoration-none"
                                                            onClick={() => decrease(item)}
                                                            disabled={item.quantity <= 1 || updatingId === item.cartItemId}
                                                        >
                                                            <LuMinus size={12} />
                                                        </button>
                                                        <span className="mx-2 fw-bold small tabular-nums">{item.quantity}</span>
                                                        <button
                                                            className="btn btn-sm btn-link text-dark p-1 text-decoration-none"
                                                            onClick={() => increase(item)}
                                                            disabled={updatingId === item.cartItemId}
                                                        >
                                                            <LuPlus size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="text-end text-danger fw-bold tabular-nums small">
                                                    {formatPrice(item.totalPrice)}
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-outline-danger btn-sm border-0"
                                                        title="Xóa sản phẩm"
                                                        onClick={() => removeItem(item.cartItemId, item.productName)}
                                                        disabled={updatingId === item.cartItemId}
                                                    >
                                                        <LuTrash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between mt-3">
                            <Link to="/products" className="btn btn-outline-secondary rounded-pill small d-flex align-items-center gap-2">
                                <LuArrowLeft size={16} />
                                <span>Tiếp tục chọn thêm máy</span>
                            </Link>
                        </div>
                    </div>

                    {/* ORDER SUMMARY */}
                    <div className="col-12 col-lg-4">
                        <div className="card border-0 shadow-sm p-4 rounded-4 sticky-top" style={{ top: "90px", background: "#ffffff", border: "1px solid #e2e8f0" }}>
                            <h5 className="fw-bold mb-3 font-display border-bottom pb-2">Tóm Tắt Đơn Hàng</h5>
                            
                            <div className="d-flex justify-content-between mb-2 small">
                                <span className="text-muted">Tổng số lượng:</span>
                                <span className="fw-bold tabular-nums">{cart.totalQuantity} sản phẩm</span>
                            </div>

                            <div className="d-flex justify-content-between mb-2 small">
                                <span className="text-muted">Phí vận chuyển:</span>
                                <span className="text-success fw-bold">Miễn phí (0 ₫)</span>
                            </div>

                            <div className="d-flex justify-content-between mb-2 small">
                                <span className="text-muted">Gói bảo hành VIP:</span>
                                <span className="text-success fw-bold">Tặng kèm 12T</span>
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between align-items-baseline mb-4">
                                <span className="fw-bold">Tổng thanh toán:</span>
                                <span className="fs-3 text-danger fw-bold font-display tabular-nums">
                                    {formatPrice(cart.totalPrice)}
                                </span>
                            </div>

                            <button
                                className="btn btn-primary btn-lg w-100 fw-bold py-3 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                                onClick={() => navigate("/checkout")}
                            >
                                <span>Tiến Hành Đặt Hàng</span>
                                <LuArrowRight size={18} />
                            </button>

                            <div className="text-center mt-3 small text-muted d-flex align-items-center justify-content-center gap-1">
                                <LuLock size={13} className="text-success" />
                                <span>Giao dịch bảo mật 100% qua chuẩn mã hóa SSL</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;