import { Link } from "react-router-dom";
import { 
    LuSmartphone, 
    LuShieldCheck, 
    LuPhone, 
    LuMail, 
    LuMapPin, 
    LuClock,
    LuCreditCard,
    LuTruck,
    LuRotateCcw
} from "react-icons/lu";

function Footer() {
    return (
        <footer className="mt-5" style={{ background: "#090d16", color: "#94a3b8", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {/* TRUST COMMITEMENT STRIP */}
            <div className="py-4 border-bottom border-secondary border-opacity-25">
                <div className="container">
                    <div className="row g-4 text-white">
                        <div className="col-12 col-sm-6 col-lg-3 d-flex align-items-center gap-3">
                            <div className="p-3 rounded-3" style={{ background: "rgba(37,99,235,0.15)", color: "#60a5fa" }}>
                                <LuShieldCheck size={24} />
                            </div>
                            <div>
                                <div className="fw-bold fs-6">100% Chính Hãng</div>
                                <small className="text-white-50">Phân phối ủy quyền tại Việt Nam</small>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3 d-flex align-items-center gap-3">
                            <div className="p-3 rounded-3" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                                <LuTruck size={24} />
                            </div>
                            <div>
                                <div className="fw-bold fs-6">Giao Hỏa Tốc 2H</div>
                                <small className="text-white-50">Miễn phí ship toàn quốc từ 500k</small>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3 d-flex align-items-center gap-3">
                            <div className="p-3 rounded-3" style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24" }}>
                                <LuRotateCcw size={24} />
                            </div>
                            <div>
                                <div className="fw-bold fs-6">1 Đổi 1 Trong 30 Ngày</div>
                                <small className="text-white-50">Lỗi nhà sản xuất đổi mới ngay</small>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3 d-flex align-items-center gap-3">
                            <div className="p-3 rounded-3" style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc" }}>
                                <LuCreditCard size={24} />
                            </div>
                            <div>
                                <div className="fw-bold fs-6">Trả Góp 0% Lãi Suất</div>
                                <small className="text-white-50">Thủ tục nhanh qua thẻ tín dụng</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN FOOTER CONTENT */}
            <div className="container py-5">
                <div className="row g-4 pb-4 border-bottom border-secondary border-opacity-25">
                    {/* BRAND INFO */}
                    <div className="col-12 col-lg-4">
                        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none text-white mb-3">
                            <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <LuSmartphone size={18} color="#fff" />
                            </div>
                            <span className="fs-5 fw-bold" style={{ fontFamily: "var(--font-display)" }}>
                                PHONE<span style={{ color: "#38bdf8" }}>STORE</span>
                            </span>
                        </Link>
                        <p className="small pe-lg-4 text-white-50" style={{ lineHeight: 1.6 }}>
                            Hệ thống bán lẻ điện thoại di động thông minh hàng đầu, mang lại trải nghiệm mua sắm công nghệ vượt trội, giá bán cạnh tranh và bảo hành VIP dài lâu.
                        </p>
                        <div className="d-flex gap-3 mt-3 text-white-50">
                            <span className="badge bg-secondary bg-opacity-25 text-white p-2">Đã chứng nhận Bộ Công Thương</span>
                        </div>
                    </div>

                    {/* PRODUCTS */}
                    <div className="col-6 col-md-3 col-lg-2">
                        <h6 className="fw-bold text-white mb-3 text-uppercase small" style={{ letterSpacing: "1px" }}>Danh Mục</h6>
                        <ul className="list-unstyled d-flex flex-column gap-2 small">
                            <li><Link to="/products?brand=apple" className="text-decoration-none text-white-50">iPhone (Apple)</Link></li>
                            <li><Link to="/products?brand=samsung" className="text-decoration-none text-white-50">Samsung Galaxy</Link></li>
                            <li><Link to="/products?brand=xiaomi" className="text-decoration-none text-white-50">Xiaomi & POCO</Link></li>
                            <li><Link to="/products?brand=asus" className="text-decoration-none text-white-50">ASUS ROG Phone</Link></li>
                            <li><Link to="/products?brand=oppo" className="text-decoration-none text-white-50">OPPO & Realme</Link></li>
                        </ul>
                    </div>

                    {/* CUSTOMER SUPPORT */}
                    <div className="col-6 col-md-3 col-lg-3">
                        <h6 className="fw-bold text-white mb-3 text-uppercase small" style={{ letterSpacing: "1px" }}>Chính Sách & Dịch Vụ</h6>
                        <ul className="list-unstyled d-flex flex-column gap-2 small">
                            <li><Link to="/orders" className="text-decoration-none text-white-50">Tra cứu đơn hàng trực tuyến</Link></li>
                            <li><span className="text-white-50">Chính sách bảo hành 12 tháng</span></li>
                            <li><span className="text-white-50">Chính sách đổi trả 30 ngày</span></li>
                            <li><span className="text-white-50">Bảo mật thông tin khách hàng</span></li>
                            <li><span className="text-white-50">Hướng dẫn thanh toán VietQR</span></li>
                        </ul>
                    </div>

                    {/* CONTACT */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="fw-bold text-white mb-3 text-uppercase small" style={{ letterSpacing: "1px" }}>Tổng Đài Hỗ Trợ</h6>
                        <div className="d-flex flex-column gap-2 small text-white-50">
                            <div className="d-flex align-items-center gap-2">
                                <LuPhone size={15} className="text-primary" />
                                <span>Mua hàng: <strong className="text-white">1800.6868</strong> (Miễn phí)</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <LuClock size={15} className="text-success" />
                                <span>Thời gian: 08:00 - 21:30 (Cả CN & Lễ)</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <LuMail size={15} className="text-info" />
                                <span>Email: support@phonestore.vn</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <LuMapPin size={15} className="text-warning" />
                                <span>Hà Nội & TP. Hồ Chí Minh</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-4 small text-white-50">
                    <div>© 2026 PhoneStore. Tất cả quyền được bảo lưu.</div>
                    <div className="d-flex gap-3">
                        <span>Điều khoản sử dụng</span>
                        <span>•</span>
                        <span>Chính sách quyền riêng tư</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;