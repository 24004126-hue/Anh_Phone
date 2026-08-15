import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    LuPackage, 
    LuClock, 
    LuTruck, 
    LuCircleCheck, 
    LuMapPin, 
    LuCreditCard, 
    LuFileText, 
    LuSmartphone, 
    LuShoppingBag, 
    LuCircleX,
    LuSearch,
    LuRotateCcw,
    LuCircleAlert,
    LuBan,
    LuArrowRight,
    LuPrinter
} from "react-icons/lu";
import orderApi from "../../api/orderApi";
import { formatPrice } from "../../components/product/ProductCard";
import { toast } from "react-toastify";
import OrderInvoiceModal from "../../components/order/OrderInvoiceModal";
import OrderTrackingModal from "../../components/order/OrderTrackingModal";

function getStatusBadge(status) {
    switch (status?.toLowerCase()) {
        case "completed":
            return (
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                    <LuCircleCheck size={14} /> Hoàn thành
                </span>
            );
        case "shipping":
            return (
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                    <LuTruck size={14} /> Đang giao hàng
                </span>
            );
        case "confirmed":
            return (
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                    <LuPackage size={14} /> Đã xác nhận
                </span>
            );
        case "cancelled":
            return (
                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                    <LuCircleX size={14} /> Đã hủy
                </span>
            );
        default:
            return (
                <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                    <LuClock size={14} /> Chờ xử lý
                </span>
            );
    }
}

function getOrderStep(status) {
    switch (status?.toLowerCase()) {
        case "pending": return 1;
        case "confirmed": return 2;
        case "shipping": return 3;
        case "completed": return 4;
        case "cancelled": return -1;
        default: return 1;
    }
}

function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
    const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            setError("");
            const userId = localStorage.getItem("userId");
            if (!userId) {
                navigate("/login");
                return;
            }

            const res = await orderApi.getMyOrders(Number(userId));
            setOrders(res.data || []);
        } catch (err) {
            console.error("Load orders error:", err);
            setError(err.response?.data?.message || "Không thể tải danh sách đơn hàng. Vui lòng kiểm tra lại kết nối.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCancelOrder(orderId) {
        const confirm = window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId}?`);
        if (!confirm) return;

        try {
            setCancellingId(orderId);
            await orderApi.cancelOrder(orderId);
            toast.success(`Đã hủy đơn hàng #${orderId} thành công.`);
            await loadOrders();
        } catch (err) {
            console.error("Cancel order error:", err);
            toast.error(err.response?.data?.message || "Không thể hủy đơn hàng này.");
        } finally {
            setCancellingId(null);
        }
    }

    // Filter & Search Logic
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            // Status filter
            if (statusFilter !== "all") {
                if (order.status?.toLowerCase() !== statusFilter.toLowerCase()) {
                    return false;
                }
            }

            // Search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchId = String(order.orderId).includes(query);
                const matchItem = order.items?.some(i => i.productName?.toLowerCase().includes(query));
                const matchReceiver = order.receiverName?.toLowerCase().includes(query) || order.shippingAddress?.toLowerCase().includes(query);
                if (!matchId && !matchItem && !matchReceiver) return false;
            }

            return true;
        });
    }, [orders, statusFilter, searchQuery]);

    const statusCounts = useMemo(() => {
        return {
            all: orders.length,
            pending: orders.filter(o => o.status?.toLowerCase() === "pending").length,
            confirmed: orders.filter(o => o.status?.toLowerCase() === "confirmed").length,
            shipping: orders.filter(o => o.status?.toLowerCase() === "shipping").length,
            completed: orders.filter(o => o.status?.toLowerCase() === "completed").length,
            cancelled: orders.filter(o => o.status?.toLowerCase() === "cancelled").length
        };
    }, [orders]);

    return (
        <div className="py-4">
            <div className="container">
                {/* PAGE HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h1 className="fw-bold fs-3 mb-1 font-display">Lịch Sử Đơn Hàng Của Bạn</h1>
                        <p className="text-muted small mb-0">Theo dõi hành trình giao nhận và trạng thái chi tiết của từng đơn máy</p>
                    </div>
                    <button 
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-2 fw-bold"
                        onClick={loadOrders}
                        disabled={loading}
                    >
                        <LuRotateCcw size={14} className={loading ? "spin" : ""} />
                        <span>Làm Mới</span>
                    </button>
                </div>

                {/* FILTER TABS & SEARCH BAR */}
                <div className="card border-0 shadow-sm p-3 mb-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        {/* STATUS TABS */}
                        <div className="d-flex gap-2 overflow-x-auto pb-2 pb-md-0">
                            {[
                                { key: "all", label: "Tất cả", count: statusCounts.all },
                                { key: "pending", label: "Chờ xử lý", count: statusCounts.pending },
                                { key: "confirmed", label: "Đã xác nhận", count: statusCounts.confirmed },
                                { key: "shipping", label: "Đang giao", count: statusCounts.shipping },
                                { key: "completed", label: "Hoàn thành", count: statusCounts.completed },
                                { key: "cancelled", label: "Đã hủy", count: statusCounts.cancelled }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 text-nowrap fw-semibold d-flex align-items-center gap-1 ${statusFilter === tab.key ? "btn-primary" : "btn-light border"}`}
                                    onClick={() => setStatusFilter(tab.key)}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`badge rounded-pill ${statusFilter === tab.key ? "bg-white text-primary" : "bg-secondary bg-opacity-25 text-dark"}`} style={{ fontSize: "0.7rem" }}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* SEARCH INPUT */}
                        <div className="position-relative" style={{ minWidth: 260 }}>
                            <LuSearch className="position-absolute text-muted" style={{ left: 14, top: 11 }} />
                            <input
                                type="text"
                                className="form-control form-control-sm rounded-pill ps-5"
                                placeholder="Tìm theo mã đơn, tên máy..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* LOADING STATE */}
                {loading && (
                    <div className="container py-5 text-center">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3 text-muted">Đang tải lịch sử đơn hàng...</p>
                    </div>
                )}

                {/* ERROR STATE */}
                {!loading && error && (
                    <div className="card border-0 shadow-sm p-5 text-center my-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #fee2e2" }}>
                        <LuCircleAlert size={48} className="text-danger mx-auto mb-3" />
                        <h4 className="fw-bold text-danger">Không thể tải danh sách đơn hàng</h4>
                        <p className="text-muted small mb-4">{error}</p>
                        <div>
                            <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={loadOrders}>
                                Thử Lại Ngay
                            </button>
                        </div>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && !error && filteredOrders.length === 0 && (
                    <div className="card border-0 shadow-sm p-5 mx-auto text-center rounded-4 my-4" style={{ maxWidth: 480, background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="p-3 bg-light rounded-circle d-inline-flex mx-auto mb-3 text-muted">
                            <LuPackage size={48} />
                        </div>
                        <h4 className="fw-bold font-display">
                            {orders.length === 0 ? "Bạn Chưa Có Đơn Hàng Nào" : "Không Tìm Thấy Đơn Hàng Phù Hợp"}
                        </h4>
                        <p className="text-muted small mb-4">
                            {orders.length === 0 
                                ? "Hãy khám phá ngay các dòng điện thoại thông minh chính hãng với ưu đãi tốt nhất tại PhoneStore!"
                                : "Hãy thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm."}
                        </p>
                        <div>
                            <Link to="/products" className="btn btn-primary rounded-pill px-4 py-2 fw-bold">
                                Mua Sắm Ngay
                            </Link>
                        </div>
                    </div>
                )}

                {/* ORDERS LIST */}
                {!loading && !error && filteredOrders.length > 0 && (
                    <div className="d-flex flex-column gap-4">
                        {filteredOrders.map((order) => {
                            const step = getOrderStep(order.status);
                            const isCancelled = step === -1;

                            return (
                                <div 
                                    className="card border-0 shadow-sm overflow-hidden rounded-4" 
                                    key={order.orderId} 
                                    style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
                                >
                                    {/* ORDER HEADER */}
                                    <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-4 border-bottom">
                                        <div className="d-flex align-items-center gap-3 flex-wrap">
                                            <span className="fw-bold fs-6 text-primary font-display">
                                                Mã đơn #{order.orderId}
                                            </span>
                                            <span className="text-muted small tabular-nums">
                                                Đặt lúc: {new Date(order.createdAt).toLocaleString("vi-VN")}
                                            </span>
                                        </div>
                                        <div>{getStatusBadge(order.status)}</div>
                                    </div>

                                    {/* ORDER PROGRESS TIMELINE (For non-cancelled orders) */}
                                    {!isCancelled && (
                                        <div className="px-4 py-3 bg-white border-bottom">
                                            <div className="row g-2 text-center small">
                                                {[
                                                    { num: 1, label: "Đã đặt hàng" },
                                                    { num: 2, label: "Đã xác nhận" },
                                                    { num: 3, label: "Đang giao hàng" },
                                                    { num: 4, label: "Giao thành công" }
                                                ].map((s) => {
                                                    const isDone = step >= s.num;
                                                    const isCurrent = step === s.num;
                                                    return (
                                                        <div key={s.num} className="col-3">
                                                            <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                                                                <div 
                                                                    className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${isDone ? "bg-primary text-white" : "bg-light text-muted border"}`}
                                                                    style={{ width: 22, height: 22, fontSize: "0.72rem" }}
                                                                >
                                                                    {s.num}
                                                                </div>
                                                            </div>
                                                            <span className={`fw-semibold ${isCurrent ? "text-primary" : (isDone ? "text-dark" : "text-muted")}`} style={{ fontSize: "0.75rem" }}>
                                                                {s.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ORDER BODY */}
                                    <div className="card-body p-4">
                                        {/* PRODUCTS TABLE */}
                                        <div className="table-responsive mb-3">
                                            <table className="table align-middle mb-0">
                                                <thead className="table-light small">
                                                    <tr>
                                                        <th>Sản phẩm</th>
                                                        <th className="text-center">Số lượng</th>
                                                        <th className="text-end">Đơn giá</th>
                                                        <th className="text-end">Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items?.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <Link
                                                                    to={`/product/${item.productId}`}
                                                                    className="fw-semibold text-dark text-decoration-none small d-flex align-items-center gap-2"
                                                                >
                                                                    <LuSmartphone size={16} className="text-primary flex-shrink-0" />
                                                                    <span>{item.productName}</span>
                                                                </Link>
                                                            </td>
                                                            <td className="text-center fw-bold tabular-nums small">{item.quantity}</td>
                                                            <td className="text-end tabular-nums small">{formatPrice(item.unitPrice)}</td>
                                                            <td className="text-end text-danger fw-bold tabular-nums small">
                                                                {formatPrice(item.totalPrice)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* ORDER SUMMARY & DELIVERY DETAILS */}
                                        <div className="d-flex justify-content-between align-items-center pt-3 border-top flex-wrap gap-3">
                                            <div className="small text-muted" style={{ maxWidth: 520 }}>
                                                {order.shippingAddress && (
                                                    <div className="d-flex align-items-start gap-1 mb-1">
                                                        <LuMapPin size={15} className="text-primary flex-shrink-0 mt-1" />
                                                        <span>
                                                            <strong>Giao đến:</strong> {order.receiverName ? `${order.receiverName} ` : ""}{order.receiverPhone ? `(${order.receiverPhone}) - ` : ""}{order.shippingAddress}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="d-flex align-items-center gap-1">
                                                    <LuCreditCard size={14} className="text-muted flex-shrink-0" />
                                                    <span>
                                                        <strong>Thanh toán:</strong> {order.paymentMethod === "BANK" ? "Chuyển khoản VietQR 24/7" : (order.paymentMethod === "MOMO" ? "Ví điện tử MoMo" : "Thanh toán khi nhận hàng (COD)")}
                                                    </span>
                                                </div>
                                                {order.notes && (
                                                    <div className="d-flex align-items-center gap-1 mt-1">
                                                        <LuFileText size={14} className="text-warning flex-shrink-0" />
                                                        <span><strong>Ghi chú:</strong> {order.notes}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-end">
                                                <div className="mb-2">
                                                    <span className="text-muted small me-2">Tổng thanh toán:</span>
                                                    <span className="fs-4 text-danger fw-bold font-display tabular-nums">
                                                        {formatPrice(order.totalAmount)}
                                                    </span>
                                                </div>

                                                {/* ACTION BUTTONS */}
                                                <div className="d-flex justify-content-end gap-2 flex-wrap">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-info btn-sm rounded-pill px-3 d-flex align-items-center gap-1 small text-dark"
                                                        onClick={() => setSelectedTrackingOrder(order)}
                                                        title="Xem hành trình giao hàng realtime"
                                                    >
                                                        <LuTruck size={13} className="text-info" />
                                                        <span>Theo dõi đơn</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 small"
                                                        onClick={() => setSelectedInvoiceOrder(order)}
                                                        title="Xem và in hóa đơn bán lẻ"
                                                    >
                                                        <LuPrinter size={13} />
                                                        <span>In hóa đơn</span>
                                                    </button>
                                                    {order.status?.toLowerCase() === "pending" && (
                                                        <button
                                                            className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-1 small"
                                                            disabled={cancellingId === order.orderId}
                                                            onClick={() => handleCancelOrder(order.orderId)}
                                                        >
                                                            <LuBan size={13} />
                                                            <span>{cancellingId === order.orderId ? "Đang hủy..." : "Hủy đơn hàng"}</span>
                                                        </button>
                                                    )}
                                                    <Link
                                                        to="/products"
                                                        className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 small"
                                                    >
                                                        <span>Mua thêm máy</span>
                                                        <LuArrowRight size={13} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* INVOICE PRINT MODAL */}
                {selectedInvoiceOrder && (
                    <OrderInvoiceModal 
                        order={selectedInvoiceOrder} 
                        onClose={() => setSelectedInvoiceOrder(null)} 
                    />
                )}

                {/* TRACKING TIMELINE MODAL */}
                {selectedTrackingOrder && (
                    <OrderTrackingModal 
                        order={selectedTrackingOrder} 
                        onClose={() => setSelectedTrackingOrder(null)} 
                    />
                )}
            </div>
        </div>
    );
}

export default Orders;