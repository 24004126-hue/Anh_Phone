import { useEffect, useState, useMemo } from "react";
import { Table, Badge, Form, Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { 
    LuSearch, 
    LuRotateCcw, 
    LuEye, 
    LuMapPin, 
    LuPhone, 
    LuMail, 
    LuSmartphone, 
    LuCreditCard,
    LuClock,
    LuTruck,
    LuCircleCheck,
    LuCircleX,
    LuPackage,
    LuPrinter
} from "react-icons/lu";
import orderApi from "../../api/orderApi";
import { formatPrice } from "../../components/product/ProductCard";
import OrderInvoiceModal from "../../components/order/OrderInvoiceModal";

function getStatusBadge(status) {
    switch (status?.toLowerCase()) {
        case "completed":
            return (
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                    <LuCircleCheck size={13} /> Hoàn thành
                </span>
            );
        case "shipping":
            return (
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                    <LuTruck size={13} /> Đang giao
                </span>
            );
        case "confirmed":
            return (
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                    <LuPackage size={13} /> Đã xác nhận
                </span>
            );
        case "cancelled":
            return (
                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                    <LuCircleX size={13} /> Đã hủy
                </span>
            );
        default:
            return (
                <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                    <LuClock size={13} /> Chờ xử lý
                </span>
            );
    }
}

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [invoiceOrder, setInvoiceOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            const res = await orderApi.getAllAdmin();
            setOrders(res.data || []);
        } catch (error) {
            console.error("Load orders error:", error);
            toast.error("Không thể tải danh sách đơn hàng.");
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(orderId, newStatus) {
        try {
            setUpdatingId(orderId);
            await orderApi.updateStatus(orderId, newStatus);
            toast.success(`Đã cập nhật trạng thái đơn hàng #${orderId} sang "${newStatus}"!`);
            await loadOrders();
            if (selectedOrder && selectedOrder.orderId === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error("Update status error:", error);
            toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại.");
        } finally {
            setUpdatingId(null);
        }
    }

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (statusFilter !== "all" && order.status?.toLowerCase() !== statusFilter.toLowerCase()) {
                return false;
            }
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchId = String(order.orderId).includes(term);
                const matchUser = order.customerName?.toLowerCase().includes(term) || order.customerEmail?.toLowerCase().includes(term);
                const matchReceiver = order.receiverName?.toLowerCase().includes(term) || order.receiverPhone?.includes(term);
                const matchAddress = order.shippingAddress?.toLowerCase().includes(term);
                if (!matchId && !matchUser && !matchReceiver && !matchAddress) {
                    return false;
                }
            }
            return true;
        });
    }, [orders, statusFilter, searchTerm]);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Đang tải danh sách đơn hàng...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-0 font-display fs-4">Quản Lý Đơn Hàng</h2>
                    <p className="text-muted small mb-0">Theo dõi, cập nhật tiến độ và xử lý đơn đặt mua điện thoại</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                        Tổng: {orders.length} đơn
                    </span>
                </div>
            </div>

            {/* FILTER & SEARCH */}
            <div className="card border-0 shadow-sm p-3 mb-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><LuSearch className="text-muted" /></span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Tìm theo mã đơn, khách hàng, số điện thoại, địa chỉ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-12 col-md-6 d-flex gap-2 justify-content-md-end">
                        <Form.Select
                            style={{ maxWidth: 220 }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="Pending">Chờ xử lý (Pending)</option>
                            <option value="Confirmed">Đã xác nhận (Confirmed)</option>
                            <option value="Shipping">Đang giao (Shipping)</option>
                            <option value="Completed">Hoàn thành (Completed)</option>
                            <option value="Cancelled">Đã hủy (Cancelled)</option>
                        </Form.Select>
                        <button className="btn btn-outline-secondary d-flex align-items-center gap-1" onClick={loadOrders} title="Làm mới">
                            <LuRotateCcw size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center my-4 rounded-4">
                    <div className="text-muted">Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</div>
                </div>
            ) : (
                <div className="card border-0 shadow-sm overflow-hidden rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light small">
                                <tr>
                                    <th className="ps-4">Mã Đơn</th>
                                    <th>Khách Hàng & Liên Hệ</th>
                                    <th>Địa Chỉ Giao Hàng</th>
                                    <th>Thanh Toán</th>
                                    <th>Tổng Tiền</th>
                                    <th>Trạng Thái</th>
                                    <th className="text-center pe-4">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.orderId}>
                                        <td className="ps-4">
                                            <span className="fw-bold text-primary font-display">#{order.orderId}</span>
                                            <div className="text-muted small tabular-nums">
                                                {new Date(order.createdAt).toLocaleString("vi-VN")}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-semibold small">{order.receiverName || order.customerName || `User #${order.userId}`}</div>
                                            {order.receiverPhone && <div className="small text-muted tabular-nums">{order.receiverPhone}</div>}
                                            {order.customerEmail && <div className="small text-muted">{order.customerEmail}</div>}
                                        </td>
                                        <td>
                                            <div className="small text-truncate" style={{ maxWidth: 200 }} title={order.shippingAddress}>
                                                {order.shippingAddress || <span className="text-muted fst-italic">Chưa có địa chỉ</span>}
                                            </div>
                                            {order.notes && <div className="small text-warning text-truncate" style={{ maxWidth: 200 }}>Ghi chú: {order.notes}</div>}
                                        </td>
                                        <td>
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill small">
                                                {order.paymentMethod || "COD"}
                                            </span>
                                        </td>
                                        <td>
                                            <strong className="text-danger small font-display tabular-nums">
                                                {formatPrice(order.totalAmount)}
                                            </strong>
                                            <div className="small text-muted">
                                                {order.items?.length || 0} sản phẩm
                                            </div>
                                        </td>
                                        <td style={{ minWidth: 160 }}>
                                            <Form.Select
                                                size="sm"
                                                value={order.status}
                                                disabled={updatingId === order.orderId}
                                                onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                            >
                                                <option value="Pending">Pending (Chờ xử lý)</option>
                                                <option value="Confirmed">Confirmed (Xác nhận)</option>
                                                <option value="Shipping">Shipping (Đang giao)</option>
                                                <option value="Completed">Completed (Hoàn thành)</option>
                                                <option value="Cancelled">Cancelled (Đã hủy)</option>
                                            </Form.Select>
                                        </td>
                                        <td className="text-center pe-4">
                                            <div className="d-flex align-items-center justify-content-center gap-1">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm rounded-circle p-1"
                                                    onClick={() => setInvoiceOrder(order)}
                                                    title="In hóa đơn / Phiếu xuất kho"
                                                >
                                                    <LuPrinter size={13} />
                                                </button>
                                                <button
                                                    className="btn btn-outline-primary btn-sm rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 small"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <LuEye size={13} />
                                                    <span>Chi tiết</span>
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

            {/* ORDER DETAIL MODAL */}
            <Modal
                show={Boolean(selectedOrder)}
                onHide={() => setSelectedOrder(null)}
                size="lg"
                centered
            >
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="h5 fw-bold font-display">
                        Chi Tiết Đơn Hàng #{selectedOrder?.orderId}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <div>
                            <div className="row g-3 mb-4">
                                <div className="col-12 col-md-6">
                                    <div className="p-3 bg-light rounded-3 border">
                                        <h6 className="fw-bold mb-2 small text-uppercase">Thông tin người nhận</h6>
                                        <div className="small"><strong>Họ tên:</strong> {selectedOrder.receiverName || selectedOrder.customerName || `User #${selectedOrder.userId}`}</div>
                                        <div className="small"><strong>Điện thoại:</strong> {selectedOrder.receiverPhone || "Không có"}</div>
                                        <div className="small"><strong>Email:</strong> {selectedOrder.customerEmail || "Không có"}</div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-3 bg-light rounded-3 border">
                                        <h6 className="fw-bold mb-2 small text-uppercase">Thông tin giao vận</h6>
                                        <div className="small"><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress || "Không có"}</div>
                                        <div className="small"><strong>Thanh toán:</strong> {selectedOrder.paymentMethod || "COD"}</div>
                                        <div className="small d-flex align-items-center gap-2 mt-1">
                                            <strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}
                                        </div>
                                        {selectedOrder.notes && <div className="small mt-1"><strong>Ghi chú:</strong> {selectedOrder.notes}</div>}
                                    </div>
                                </div>
                            </div>

                            <h6 className="fw-bold mb-3 small text-uppercase">Danh sách sản phẩm trong đơn</h6>
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm align-middle small mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th className="text-center">Số lượng</th>
                                            <th className="text-end">Đơn giá</th>
                                            <th className="text-end">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="fw-semibold">
                                                    <LuSmartphone size={14} className="me-1 text-primary" />
                                                    {item.productName}
                                                </td>
                                                <td className="text-center tabular-nums">{item.quantity}</td>
                                                <td className="text-end tabular-nums">{formatPrice(item.unitPrice)}</td>
                                                <td className="text-end text-danger fw-bold tabular-nums">{formatPrice(item.totalPrice)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="text-end fw-bold">Tổng cộng đơn hàng:</td>
                                            <td className="text-end text-danger fs-6 fw-bold tabular-nums">
                                                {formatPrice(selectedOrder.totalAmount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <button 
                        className="btn btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-1 small" 
                        onClick={() => {
                            const ord = selectedOrder;
                            setSelectedOrder(null);
                            setInvoiceOrder(ord);
                        }}
                    >
                        <LuPrinter size={14} />
                        <span>In Hóa Đơn / Phiếu Giao</span>
                    </button>
                    <button className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedOrder(null)}>
                        Đóng
                    </button>
                </Modal.Footer>
            </Modal>

            {/* INVOICE PRINT MODAL */}
            {invoiceOrder && (
                <OrderInvoiceModal 
                    order={invoiceOrder} 
                    onClose={() => setInvoiceOrder(null)} 
                />
            )}
        </div>
    );
}

export default AdminOrders;