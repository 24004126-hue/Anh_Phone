import { LuPrinter, LuX, LuSmartphone, LuCircleCheck, LuShieldCheck } from "react-icons/lu";
import { formatPrice } from "../product/ProductCard";

function OrderInvoiceModal({ order, onClose }) {
    if (!order) return null;

    function handlePrint() {
        window.print();
    }

    const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    return (
        <div 
            className="modal-backdrop-custom d-flex align-items-center justify-content-center p-2 p-md-3"
            style={{ 
                position: "fixed", 
                inset: 0, 
                background: "rgba(15, 23, 42, 0.75)", 
                backdropFilter: "blur(6px)", 
                zIndex: 3000 
            }}
        >
            <div 
                className="card border-0 shadow-lg rounded-4 overflow-hidden print-container"
                style={{ maxWidth: 680, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", background: "#ffffff" }}
            >
                {/* MODAL HEADER (NO PRINT) */}
                <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-light border-bottom no-print">
                    <div className="d-flex align-items-center gap-2">
                        <LuPrinter className="text-primary" size={18} />
                        <h6 className="fw-bold mb-0 font-display">Hóa Đơn Bán Hàng & Phiếu Xuất Kho #{order.orderId}</h6>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <button 
                            type="button" 
                            className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 fw-bold"
                            onClick={handlePrint}
                        >
                            <LuPrinter size={14} />
                            <span>In Hóa Đơn</span>
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-light btn-sm rounded-circle p-1" 
                            onClick={onClose}
                        >
                            <LuX size={16} />
                        </button>
                    </div>
                </div>

                {/* PRINTABLE INVOICE BODY */}
                <div className="p-4 p-md-5 overflow-y-auto" style={{ flexGrow: 1 }}>
                    {/* INVOICE HEADER */}
                    <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-3 bg-primary text-white d-flex align-items-center justify-content-center">
                                    <LuSmartphone size={18} />
                                </div>
                                <span className="fw-bold fs-5 font-display text-dark">
                                    PHONE<span className="text-primary">STORE</span>
                                </span>
                            </div>
                            <div className="text-muted small" style={{ lineHeight: 1.5 }}>
                                <div><strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ PHONESTORE VIỆT NAM</strong></div>
                                <div>Địa chỉ: Tòa nhà TechTower, Cầu Giấy, Hà Nội</div>
                                <div>Hotline CSKH: 1800.6868 • MST: 0108868688</div>
                                <div>Email: support@phonestore.com</div>
                            </div>
                        </div>

                        <div className="text-end">
                            <h4 className="fw-bold text-primary font-display mb-1">HÓA ĐƠN BÁN HÀNG</h4>
                            <div className="text-muted small">Mã HĐ: <strong className="text-dark">HD-{order.orderId}</strong></div>
                            <div className="text-muted small">Ngày lập: {orderDate}</div>
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 mt-1">
                                Đã Xác Nhận
                            </span>
                        </div>
                    </div>

                    {/* CUSTOMER & SHIPPING INFO */}
                    <div className="row g-3 mb-4 p-3 bg-light rounded-3 border small">
                        <div className="col-12 col-sm-6">
                            <div className="text-muted">Người nhận hàng:</div>
                            <strong className="text-dark font-display fs-6">{order.receiverName || order.customerName || "Khách Hàng"}</strong>
                            <div className="text-muted tabular-nums">Số điện thoại: <strong>{order.receiverPhone || "Chưa cập nhật"}</strong></div>
                            <div className="text-muted">Địa chỉ: <strong>{order.shippingAddress || "Tại cửa hàng PhoneStore"}</strong></div>
                        </div>
                        <div className="col-12 col-sm-6 text-sm-end">
                            <div className="text-muted">Phương thức thanh toán:</div>
                            <strong className="text-primary font-display">{order.paymentMethod === "BANK" ? "Chuyển khoản VietQR 24/7" : order.paymentMethod === "MOMO" ? "Ví MoMo" : "Thanh toán khi nhận hàng (COD)"}</strong>
                            <div className="text-muted mt-1">Trạng thái đơn: <strong className="text-success">{order.status}</strong></div>
                            {order.notes && <div className="text-muted">Ghi chú: <em>"{order.notes}"</em></div>}
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div className="table-responsive mb-4">
                        <table className="table table-bordered align-middle small mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: "8%" }} className="text-center">STT</th>
                                    <th>Tên Điện Thoại & Cấu Hình</th>
                                    <th style={{ width: "12%" }} className="text-center">SL</th>
                                    <th style={{ width: "22%" }} className="text-end">Đơn Giá</th>
                                    <th style={{ width: "22%" }} className="text-end">Thành Tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item, idx) => (
                                    <tr key={item.orderDetailId || item.productId || idx}>
                                        <td className="text-center">{idx + 1}</td>
                                        <td>
                                            <strong className="text-dark">{item.productName}</strong>
                                            <div className="text-muted" style={{ fontSize: "0.72rem" }}>Bảo hành chính hãng 12T (1 đổi 1 30 ngày)</div>
                                        </td>
                                        <td className="text-center fw-bold tabular-nums">{item.quantity}</td>
                                        <td className="text-end tabular-nums">{formatPrice(item.unitPrice)}</td>
                                        <td className="text-end fw-bold tabular-nums text-dark">{formatPrice(item.totalPrice || item.unitPrice * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* TOTAL CALCULATION */}
                    <div className="d-flex justify-content-end mb-4">
                        <div style={{ minWidth: 260 }} className="small">
                            <div className="d-flex justify-content-between py-1 text-muted">
                                <span>Tạm tính:</span>
                                <span className="tabular-nums">{formatPrice(order.totalAmount)}</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 text-muted">
                                <span>Thuế VAT (10%):</span>
                                <span>Đã bao gồm</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 text-muted">
                                <span>Phí vận chuyển:</span>
                                <span className="text-success fw-bold">MIỄN PHÍ</span>
                            </div>
                            <div className="d-flex justify-content-between py-2 border-top border-bottom my-1">
                                <strong className="fs-6 text-dark">Tổng thanh toán:</strong>
                                <strong className="fs-5 text-danger font-display tabular-nums">{formatPrice(order.totalAmount)}</strong>
                            </div>
                        </div>
                    </div>

                    {/* SIGNATURE & LEGAL NOTICE */}
                    <div className="d-flex justify-content-between text-center pt-3 border-top small text-muted">
                        <div>
                            <div className="fw-bold text-dark">NGƯỜI NHẬN HÀNG</div>
                            <small>(Ký và ghi rõ họ tên)</small>
                            <div style={{ height: 45 }}></div>
                        </div>
                        <div>
                            <div className="fw-bold text-dark d-flex align-items-center justify-content-center gap-1">
                                <LuShieldCheck className="text-primary" />
                                <span>ĐẠI DIỆN PHONESTORE</span>
                            </div>
                            <small className="text-success fw-semibold">(Đã ký điện tử)</small>
                            <div style={{ height: 45 }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderInvoiceModal;
