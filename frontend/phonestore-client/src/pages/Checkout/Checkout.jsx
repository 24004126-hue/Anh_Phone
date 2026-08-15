import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
    LuCreditCard, 
    LuTruck, 
    LuShieldCheck, 
    LuMapPin, 
    LuPhone, 
    LuUser, 
    LuFileText, 
    LuLock, 
    LuArrowRight, 
    LuCheck,
    LuBanknote,
    LuQrCode,
    LuCopy,
    LuClock,
    LuDownload,
    LuTag,
    LuTicket,
    LuX
} from "react-icons/lu";
import cartApi from "../../api/cartApi";
import orderApi from "../../api/orderApi";
import productApi from "../../api/productApi";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import { formatPrice } from "../../components/product/ProductCard";

const BANK_INFO = {
    bankId: "MB",
    bankName: "MB Bank (Ngân hàng TMCP Quân Đội)",
    accountNumber: "0358868686",
    accountName: "PHONESTORE VIETNAM"
};

function Checkout() {
    const navigate = useNavigate();
    const { refreshCart } = useCart();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkingStock, setCheckingStock] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [receiverName, setReceiverName] = useState(localStorage.getItem("fullName") || "");
    const [receiverPhone, setReceiverPhone] = useState(localStorage.getItem("phone") || "");
    const [shippingAddress, setShippingAddress] = useState(localStorage.getItem("address") || "");
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [orderNote, setOrderNote] = useState("");

    // Promo Code / Voucher State
    const [couponInput, setCouponInput] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null);

    const AVAILABLE_VOUCHERS = [
        { code: "TECH2026", label: "Giảm 10% (Tối đa 1.500.000đ)", discount: 1500000, minOrder: 0 },
        { code: "VIP500", label: "Giảm trực tiếp 500.000đ", discount: 500000, minOrder: 10000000 },
        { code: "CHAOBANMOI", label: "Quà tặng bạn mới -200.000đ", discount: 200000, minOrder: 3000000 },
        { code: "FREESHIP", label: "Freeship Extra -50.000đ", discount: 50000, minOrder: 0 }
    ];

    function applyVoucherCode(codeToApply) {
        const code = (codeToApply || couponInput).trim().toUpperCase();
        if (!code) {
            toast.warn("Vui lòng nhập mã giảm giá.");
            return;
        }

        const found = AVAILABLE_VOUCHERS.find(v => v.code === code);
        if (!found) {
            toast.error(`Mã giảm giá "${code}" không hợp lệ hoặc đã hết hạn.`);
            return;
        }

        const currentTotal = cart?.totalAmount || 0;
        if (found.minOrder > 0 && currentTotal < found.minOrder) {
            toast.warn(`Mã "${code}" chỉ áp dụng cho đơn hàng từ ${formatPrice(found.minOrder)}.`);
            return;
        }

        setAppliedVoucher(found);
        setCouponInput(found.code);
        toast.success(`Áp dụng thành công mã "${found.code}": ${found.label}! 🎉`);
    }

    function removeVoucher() {
        setAppliedVoucher(null);
        setCouponInput("");
        toast.info("Đã gỡ mã giảm giá.");
    }

    // VietQR Modal State
    const [createdOrder, setCreatedOrder] = useState(null);
    const [showVietQrModal, setShowVietQrModal] = useState(false);
    const [copiedField, setCopiedField] = useState("");
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

    useEffect(() => {
        loadCart();
    }, []);

    // Countdown Timer for VietQR
    useEffect(() => {
        if (!showVietQrModal || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [showVietQrModal, timeLeft]);

    async function loadCart() {
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                toast.warn("Vui lòng đăng nhập để tiếp tục thanh toán.");
                navigate("/login");
                return;
            }

            const res = await cartApi.getCart(userId);
            setCart(res.data);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Không thể tải giỏ hàng.");
        } finally {
            setLoading(false);
        }
    }

    async function checkStock() {
        if (!cart || !cart.items || cart.items.length === 0) return false;

        setCheckingStock(true);
        try {
            for (const item of cart.items) {
                const res = await productApi.getById(item.productId);
                const product = res.data;

                if (!product) {
                    toast.error(`Không tìm thấy sản phẩm "${item.productName}".`);
                    return false;
                }

                if (product.quantity <= 0) {
                    toast.error(`Sản phẩm "${item.productName}" đã hết hàng.`);
                    return false;
                }

                if (item.quantity > product.quantity) {
                    toast.warn(`Sản phẩm "${item.productName}" chỉ còn ${product.quantity} sản phẩm.`);
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Không thể kiểm tra tồn kho.");
            return false;
        } finally {
            setCheckingStock(false);
        }
    }

    async function handleCheckout(e) {
        e.preventDefault();

        if (!receiverName.trim()) {
            toast.warn("Vui lòng nhập họ tên người nhận hàng.");
            return;
        }

        if (!receiverPhone.trim()) {
            toast.warn("Vui lòng nhập số điện thoại nhận hàng.");
            return;
        }

        if (!shippingAddress.trim()) {
            toast.warn("Vui lòng nhập địa chỉ nhận hàng chi tiết.");
            return;
        }

        if (!cart || !cart.items || cart.items.length === 0) {
            toast.error("Giỏ hàng của bạn đang trống.");
            return;
        }

        if (placingOrder || checkingStock) return;

        const stockAvailable = await checkStock();
        if (!stockAvailable) {
            await loadCart();
            return;
        }

        setPlacingOrder(true);
        try {
            const userId = localStorage.getItem("userId");
            const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
            const voucherNote = appliedVoucher 
                ? ` [Mã ưu đãi: ${appliedVoucher.code} - ${appliedVoucher.label}]`
                : "";
            const combinedNotes = (orderNote.trim() + voucherNote).trim() || undefined;

            const res = await orderApi.checkout({
                userId: Number(userId),
                receiverName: receiverName.trim() || undefined,
                receiverPhone: receiverPhone.trim() || undefined,
                shippingAddress: shippingAddress.trim(),
                paymentMethod,
                notes: combinedNotes
            });

            await refreshCart();

            if (paymentMethod === "BANK" || paymentMethod === "MOMO") {
                setCreatedOrder(res.data);
                setShowVietQrModal(true);
                setTimeLeft(900);
            } else {
                toast.success("Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.");
                navigate("/orders", { replace: true });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại!");
            await loadCart();
        } finally {
            setPlacingOrder(false);
        }
    }

    function copyToClipboard(text, fieldName) {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        toast.info(`Đã sao chép: ${text}`);
        setTimeout(() => setCopiedField(""), 2500);
    }

    function formatTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 text-muted">Đang chuẩn bị trang thanh toán...</p>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="container py-5 text-center">
                <div className="card border-0 shadow-sm p-5 mx-auto rounded-4" style={{ maxWidth: 480, background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <h4>Giỏ hàng đang trống</h4>
                    <p className="text-muted">Không có sản phẩm nào để thanh toán</p>
                    <Link to="/products" className="btn btn-primary rounded-pill px-4 mt-2">
                        ← Tiếp tục chọn sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    // Generate Dynamic VietQR URL
    const transferMemo = createdOrder ? `PHONE ${createdOrder.orderId}` : "PHONE";
    const transferAmount = createdOrder ? createdOrder.totalAmount : (cart.totalAmount || 0);
    const vietQrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.png?amount=${transferAmount}&addInfo=${encodeURIComponent(transferMemo)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

    return (
        <div className="py-4">
            <div className="container">
                {/* PAGE TITLE */}
                <div className="mb-4">
                    <h1 className="fw-bold fs-3 mb-1 font-display">Xác Nhận Đơn Hàng & Thanh Toán</h1>
                    <p className="text-muted small mb-0">Vui lòng kiểm tra kỹ địa chỉ nhận hàng và phương thức thanh toán</p>
                </div>

                <form onSubmit={handleCheckout}>
                    <div className="row g-4">
                        {/* LEFT: SHIPPING & PAYMENT */}
                        <div className="col-12 col-lg-7">
                            <div className="card border-0 shadow-sm p-4 mb-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                                <h5 className="fw-bold mb-3 font-display d-flex align-items-center gap-2">
                                    <LuMapPin className="text-primary" />
                                    <span>Thông Tin Người Nhận & Địa Chỉ Giao</span>
                                </h5>

                                <div className="row g-3">
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label fw-semibold small">Họ tên người nhận <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0"><LuUser className="text-muted" /></span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="Nguyễn Văn A"
                                                value={receiverName}
                                                onChange={(e) => setReceiverName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label fw-semibold small">Số điện thoại <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0"><LuPhone className="text-muted" /></span>
                                            <input
                                                type="tel"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="0987xxxxxx"
                                                value={receiverPhone}
                                                onChange={(e) => setReceiverPhone(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small">Địa chỉ nhận hàng chi tiết <span className="text-danger">*</span></label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small">Ghi chú giao hàng (Tùy chọn)</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0"><LuFileText className="text-muted" /></span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="Giao giờ hành chính, gọi trước khi đến..."
                                                value={orderNote}
                                                onChange={(e) => setOrderNote(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PAYMENT METHOD SELECTION */}
                            <div className="card border-0 shadow-sm p-4 mb-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                                <h5 className="fw-bold mb-3 font-display d-flex align-items-center gap-2">
                                    <LuCreditCard className="text-primary" />
                                    <span>Phương Thức Thanh Toán</span>
                                </h5>

                                <div className="d-flex flex-column gap-3">
                                    {/* COD */}
                                    <label className={`payment-method-card ${paymentMethod === "COD" ? "active" : ""}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === "COD"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="form-check-input mt-0 me-3"
                                        />
                                        <div className="payment-icon bg-success bg-opacity-10 text-success">
                                            <LuBanknote size={24} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Thanh toán khi nhận hàng (COD)</div>
                                            <small className="text-muted">Kiểm tra máy trước khi thanh toán tiền mặt cho bưu tá</small>
                                        </div>
                                    </label>

                                    {/* VIETQR */}
                                    <label className={`payment-method-card ${paymentMethod === "BANK" ? "active" : ""}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="BANK"
                                            checked={paymentMethod === "BANK"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="form-check-input mt-0 me-3"
                                        />
                                        <div className="payment-icon bg-primary bg-opacity-10 text-primary">
                                            <LuQrCode size={24} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="fw-bold">Chuyển khoản VietQR 24/7 (Khuyên dùng)</span>
                                                <span className="badge bg-primary rounded-pill small">Tự động</span>
                                            </div>
                                            <small className="text-muted">Quét mã QR bằng mọi ứng dụng ngân hàng (MB, VCB, TCB, VPB...)</small>
                                        </div>
                                    </label>

                                    {/* MOMO */}
                                    <label className={`payment-method-card ${paymentMethod === "MOMO" ? "active" : ""}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="MOMO"
                                            checked={paymentMethod === "MOMO"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="form-check-input mt-0 me-3"
                                        />
                                        <div className="payment-icon bg-danger bg-opacity-10 text-danger">
                                            <LuCreditCard size={24} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Ví điện tử MoMo</div>
                                            <small className="text-muted">Thanh toán nhanh không phí qua ứng dụng Ví MoMo</small>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: ORDER SUMMARY */}
                        <div className="col-12 col-lg-5">
                            <div className="card border-0 shadow-sm p-4 sticky-top rounded-4" style={{ top: 90, background: "#ffffff", border: "1px solid #e2e8f0" }}>
                                <h5 className="fw-bold mb-3 font-display">Tóm Tắt Đơn Hàng ({cart.items?.length} máy)</h5>

                                {/* ITEMS LIST */}
                                <div className="d-flex flex-column gap-3 mb-3 max-h-300 overflow-y-auto pe-1">
                                    {cart.items?.map((item) => (
                                        <div key={item.cartItemId} className="d-flex align-items-center justify-content-between gap-2 p-2 bg-light rounded-3">
                                            <div className="d-flex align-items-center gap-2 min-w-0">
                                                <img
                                                    src={item.productThumbnail || "/images/products/iphone-16-pro-max.jpg"}
                                                    alt={item.productName}
                                                    style={{ width: 44, height: 44, objectFit: "contain" }}
                                                    className="bg-white rounded p-1 border flex-shrink-0"
                                                    onError={(e) => { e.target.src = "https://placehold.co/44x44?text=Phone"; }}
                                                />
                                                <div className="min-w-0">
                                                    <div className="fw-semibold text-truncate small" title={item.productName}>{item.productName}</div>
                                                    <div className="text-muted small tabular-nums">Số lượng: <strong>x{item.quantity}</strong></div>
                                                </div>
                                            </div>
                                            <div className="text-end text-nowrap">
                                                <span className="fw-bold text-danger small tabular-nums">{formatPrice(item.totalPrice)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <hr className="my-3" />

                                {/* PROMO CODE / VOUCHER INPUT BOX */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small d-flex align-items-center gap-1">
                                        <LuTag className="text-primary" />
                                        <span>Mã Giảm Giá / Voucher Ưu Đãi</span>
                                    </label>
                                    <div className="input-group mb-2">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm text-uppercase"
                                            placeholder="Nhập mã TECH2026, VIP500..."
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            disabled={Boolean(appliedVoucher)}
                                        />
                                        {appliedVoucher ? (
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={removeVoucher}
                                            >
                                                <LuX size={14} /> Gỡ bỏ
                                            </button>
                                        ) : (
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-primary btn-sm fw-bold px-3"
                                                onClick={() => applyVoucherCode(couponInput)}
                                            >
                                                Áp Dụng
                                            </button>
                                        )}
                                    </div>

                                    {/* APPLIED VOUCHER BADGE */}
                                    {appliedVoucher && (
                                        <div className="p-2 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 d-flex align-items-center justify-content-between small text-success mb-2">
                                            <div className="d-flex align-items-center gap-1">
                                                <LuTicket size={16} />
                                                <strong>{appliedVoucher.code}</strong>: {appliedVoucher.label}
                                            </div>
                                            <span className="fw-bold tabular-nums">-{formatPrice(appliedVoucher.discount)}</span>
                                        </div>
                                    )}

                                    {/* QUICK SELECT VOUCHER CHIPS */}
                                    {!appliedVoucher && (
                                        <div className="d-flex gap-1 flex-wrap mt-1">
                                            {AVAILABLE_VOUCHERS.map(v => (
                                                <button
                                                    key={v.code}
                                                    type="button"
                                                    className="btn btn-light btn-sm border py-0 px-2 text-primary small rounded-pill"
                                                    style={{ fontSize: "0.72rem" }}
                                                    onClick={() => applyVoucherCode(v.code)}
                                                    title={v.label}
                                                >
                                                    + {v.code}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <hr className="my-3" />

                                {/* PRICE CALCULATION */}
                                <div className="d-flex justify-content-between text-muted mb-2 small">
                                    <span>Tạm tính:</span>
                                    <span className="fw-semibold tabular-nums">{formatPrice(cart.totalAmount)}</span>
                                </div>
                                {appliedVoucher && (
                                    <div className="d-flex justify-content-between text-success mb-2 small fw-bold">
                                        <span>Giảm giá voucher ({appliedVoucher.code}):</span>
                                        <span className="tabular-nums">-{formatPrice(appliedVoucher.discount)}</span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between text-muted mb-2 small">
                                    <span>Phí giao hàng toàn quốc:</span>
                                    <span className="text-success fw-bold">MIỄN PHÍ</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center py-2 my-2 border-top border-bottom">
                                    <span className="fw-bold">Tổng thanh toán:</span>
                                    <span className="fs-4 fw-bold text-danger font-display tabular-nums">
                                        {formatPrice(Math.max(0, (cart.totalAmount || 0) - (appliedVoucher ? appliedVoucher.discount : 0)))}
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow-sm mt-3 d-flex align-items-center justify-content-center gap-2"
                                    disabled={placingOrder || checkingStock}
                                >
                                    {placingOrder ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                            <span>Đang tạo đơn hàng...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LuShieldCheck size={20} />
                                            <span>Hoàn Tất Đặt Hàng</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* =========================================================================
                INTERACTIVE VIETQR DYNAMIC PAYMENT MODAL
            ========================================================================= */}
            {showVietQrModal && createdOrder && (
                <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" style={{ position: "fixed", inset: 0, background: "rgba(9, 13, 22, 0.8)", backdropFilter: "blur(8px)", zIndex: 2000 }}>
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: 520, width: "100%", background: "#ffffff" }}>
                        <div className="card-header bg-primary text-white py-3 px-4 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <LuQrCode size={20} />
                                <h5 className="fw-bold mb-0 font-display fs-6">Thanh Toán Chuyển Khoản VietQR 24/7</h5>
                            </div>
                            <div className="badge bg-dark bg-opacity-50 text-white d-flex align-items-center gap-1 tabular-nums px-2 py-1">
                                <LuClock size={13} />
                                <span>{formatTimer(timeLeft)}</span>
                            </div>
                        </div>

                        <div className="card-body p-4 text-center">
                            {/* QR CODE IMAGE */}
                            <div className="p-3 bg-light rounded-4 border d-inline-block mb-3 shadow-sm">
                                <img
                                    src={vietQrUrl}
                                    alt="VietQR Payment"
                                    style={{ width: 220, height: 220, objectFit: "contain" }}
                                    className="rounded"
                                />
                                <div className="small text-muted mt-1 fw-bold">Mở app Ngân hàng để Quét QR</div>
                            </div>

                            {/* BANK DETAILS LIST WITH 1-CLICK COPY */}
                            <div className="d-flex flex-column gap-2 text-start p-3 bg-light rounded-3 border mb-3 small">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Ngân hàng:</span>
                                    <strong className="text-dark">{BANK_INFO.bankName}</strong>
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Chủ tài khoản:</span>
                                    <strong className="text-dark font-display">{BANK_INFO.accountName}</strong>
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Số tài khoản:</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <strong className="text-primary font-display fs-6 tabular-nums">{BANK_INFO.accountNumber}</strong>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm rounded-pill p-1 px-2 d-flex align-items-center gap-1"
                                            style={{ fontSize: "0.72rem" }}
                                            onClick={() => copyToClipboard(BANK_INFO.accountNumber, "stk")}
                                        >
                                            {copiedField === "stk" ? <LuCheck size={12} /> : <LuCopy size={12} />}
                                            <span>{copiedField === "stk" ? "Đã chép" : "Chép"}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Số tiền thanh toán:</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <strong className="text-danger font-display fs-6 tabular-nums">{formatPrice(createdOrder.totalAmount)}</strong>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm rounded-pill p-1 px-2 d-flex align-items-center gap-1"
                                            style={{ fontSize: "0.72rem" }}
                                            onClick={() => copyToClipboard(String(createdOrder.totalAmount), "amount")}
                                        >
                                            {copiedField === "amount" ? <LuCheck size={12} /> : <LuCopy size={12} />}
                                            <span>{copiedField === "amount" ? "Đã chép" : "Chép"}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Nội dung chuyển khoản:</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <strong className="text-warning text-dark font-display">{transferMemo}</strong>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm rounded-pill p-1 px-2 d-flex align-items-center gap-1"
                                            style={{ fontSize: "0.72rem" }}
                                            onClick={() => copyToClipboard(transferMemo, "memo")}
                                        >
                                            {copiedField === "memo" ? <LuCheck size={12} /> : <LuCopy size={12} />}
                                            <span>{copiedField === "memo" ? "Đã chép" : "Chép"}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <p className="text-muted small mb-4">
                                Sau khi chuyển khoản thành công, đơn hàng của bạn sẽ được hệ thống tự động xử lý và giao hàng hỏa tốc trong 2H.
                            </p>

                            <div className="d-flex flex-column gap-2">
                                <button
                                    type="button"
                                    className="btn btn-primary rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                                    onClick={() => {
                                        toast.success("Cảm ơn bạn! Đơn hàng đang được điều phối giao.");
                                        navigate("/orders", { replace: true });
                                    }}
                                >
                                    <LuCheck size={18} />
                                    <span>Tôi Đã Chuyển Khoản Xong</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-light rounded-pill py-2 text-muted small"
                                    onClick={() => navigate("/orders", { replace: true })}
                                >
                                    Xem Lịch Sử Đơn Hàng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Checkout;