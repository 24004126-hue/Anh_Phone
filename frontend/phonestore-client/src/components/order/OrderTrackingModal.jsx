import { 
    LuX, 
    LuPackage, 
    LuTruck, 
    LuCircleCheck, 
    LuClock, 
    LuMapPin, 
    LuPhone, 
    LuCopy, 
    LuShieldCheck, 
    LuSmartphone 
} from "react-icons/lu";
import { formatPrice } from "../product/ProductCard";
import { toast } from "react-toastify";

function OrderTrackingModal({ order, onClose }) {
    if (!order) return null;

    const trackingCode = `VNX-${order.orderId}8892`;

    function copyTrackingCode() {
        navigator.clipboard.writeText(trackingCode);
        toast.success(`Đã sao chép mã vận đơn: ${trackingCode}`);
    }

    // Determine current stage
    let currentStep = 1;
    const st = order.status?.toLowerCase();
    if (st === "confirmed") currentStep = 2;
    else if (st === "shipping" || st === "processing") currentStep = 3;
    else if (st === "completed" || st === "delivered") currentStep = 4;
    else if (st === "cancelled") currentStep = -1;

    const steps = [
        {
            step: 1,
            title: "Đặt hàng thành công",
            desc: "Đơn hàng đã được ghi nhận trên hệ thống PhoneStore",
            time: new Date(order.createdAt || Date.now()).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " hôm nay",
            icon: LuClock
        },
        {
            step: 2,
            title: "Đã đóng gói & Xuất kho",
            desc: "Sản phẩm đã được kiểm tra chất lượng, dán tem niêm phong và đóng hộp",
            time: currentStep >= 2 ? "Kho TechTower, Cầu Giấy" : "Dự kiến 30 phút sau",
            icon: LuPackage
        },
        {
            step: 3,
            title: "Đang giao hàng hỏa tốc",
            desc: "Đơn vị vận chuyển GHTK Express đang trên đường giao đến bạn",
            time: currentStep >= 3 ? "Tài xế: Nguyễn Văn Hùng (0982.***.888)" : "Dự kiến 2 giờ",
            icon: LuTruck
        },
        {
            step: 4,
            title: "Giao hàng thành công",
            desc: "Đã nhận máy, kích hoạt bảo hành điện tử chính hãng 12 tháng",
            time: currentStep >= 4 ? "Hoàn tất đơn hàng" : "Khi nhận hàng",
            icon: LuCircleCheck
        }
    ];

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
                className="card border-0 shadow-lg rounded-4 overflow-hidden"
                style={{ maxWidth: 620, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", background: "#ffffff" }}
            >
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-light border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <LuTruck className="text-primary" size={20} />
                        <div>
                            <h6 className="fw-bold mb-0 font-display">Hành Trình Giao Hàng #{order.orderId}</h6>
                            <small className="text-muted">Đơn vị vận chuyển: <strong>GHTK Express Fast 2H</strong></small>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        className="btn btn-light btn-sm rounded-circle p-1" 
                        onClick={onClose}
                    >
                        <LuX size={18} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">
                    {/* TRACKING CODE & SUMMARY BOX */}
                    <div className="p-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 mb-4">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <div className="small text-muted">Mã vận đơn bưu cục:</div>
                                <div className="fw-bold font-display fs-6 text-primary">{trackingCode}</div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 small fw-semibold"
                                onClick={copyTrackingCode}
                            >
                                <LuCopy size={13} />
                                <span>Sao chép mã</span>
                            </button>
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top border-primary border-opacity-25 small text-muted">
                            <LuMapPin size={14} className="text-primary flex-shrink-0" />
                            <span className="text-truncate">
                                <strong>Giao tới:</strong> {order.shippingAddress || "Tại cửa hàng PhoneStore"}
                            </span>
                        </div>
                    </div>

                    {/* CANCELLED BANNER */}
                    {currentStep === -1 && (
                        <div className="alert alert-danger rounded-3 mb-4 small">
                            <strong>Đơn hàng này đã bị hủy.</strong> Quá trình giao vận đã được dừng lại.
                        </div>
                    )}

                    {/* TIMELINE STEPPER */}
                    {currentStep !== -1 && (
                        <div className="position-relative ps-4 ps-md-5 my-3">
                            {/* VERTICAL LINE */}
                            <div 
                                className="position-absolute"
                                style={{
                                    left: 17,
                                    top: 15,
                                    bottom: 25,
                                    width: 3,
                                    background: "#e2e8f0",
                                    zIndex: 1
                                }}
                            />

                            {steps.map((stObj) => {
                                const isPassed = currentStep >= stObj.step;
                                const isCurrent = currentStep === stObj.step;
                                const IconComponent = stObj.icon;

                                return (
                                    <div key={stObj.step} className="position-relative mb-4 pb-2">
                                        {/* STEP CIRCLE */}
                                        <div 
                                            className={`position-absolute d-flex align-items-center justify-content-center rounded-circle shadow-sm ${isCurrent ? "bg-primary text-white ring-4" : isPassed ? "bg-success text-white" : "bg-light text-muted border"}`}
                                            style={{
                                                left: -37,
                                                top: 0,
                                                width: 32,
                                                height: 32,
                                                zIndex: 2,
                                                boxShadow: isCurrent ? "0 0 0 4px rgba(2, 132, 199, 0.2)" : "none"
                                            }}
                                        >
                                            <IconComponent size={16} />
                                        </div>

                                        {/* STEP CONTENT */}
                                        <div className={`p-3 rounded-3 border ${isCurrent ? "bg-light border-primary" : "bg-white border-light"}`}>
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <h6 className={`fw-bold mb-0 font-display small ${isCurrent ? "text-primary" : isPassed ? "text-dark" : "text-muted"}`}>
                                                    {stObj.title}
                                                </h6>
                                                <span className={`badge ${isCurrent ? "bg-primary" : isPassed ? "bg-success" : "bg-secondary bg-opacity-25 text-muted"} rounded-pill small`} style={{ fontSize: "0.7rem" }}>
                                                    {stObj.time}
                                                </span>
                                            </div>
                                            <p className="small text-muted mb-0" style={{ fontSize: "0.82rem" }}>
                                                {stObj.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ASSURANCES FOOTER */}
                    <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between small text-muted">
                        <div className="d-flex align-items-center gap-1 text-success fw-semibold">
                            <LuShieldCheck size={16} />
                            <span>Được đồng kiểm trước khi nhận hàng</span>
                        </div>
                        <a href="tel:18006868" className="text-decoration-none text-primary fw-bold d-flex align-items-center gap-1">
                            <LuPhone size={14} />
                            <span>Hotline: 1800.6868</span>
                        </a>
                    </div>
                </div>

                <div className="modal-footer bg-light px-4 py-2 border-top">
                    <button type="button" className="btn btn-primary rounded-pill px-4 btn-sm fw-bold" onClick={onClose}>
                        Đã Hiểu
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderTrackingModal;
