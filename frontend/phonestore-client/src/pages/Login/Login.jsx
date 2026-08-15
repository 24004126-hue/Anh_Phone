import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
    LuSmartphone, 
    LuShieldCheck, 
    LuTruck, 
    LuEye, 
    LuEyeOff, 
    LuArrowRight,
    LuLock
} from "react-icons/lu";
import authApi from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { refreshCart } = useCart();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        if (!email.trim()) {
            toast.warn("Vui lòng nhập địa chỉ email.");
            return;
        }
        if (!password) {
            toast.warn("Vui lòng nhập mật khẩu.");
            return;
        }

        try {
            setLoading(true);
            const res = await authApi.login({
                email: email.trim(),
                password
            });

            login(res.data);
            await refreshCart();
            toast.success(`Chào mừng ${res.data.fullName || "bạn"} quay trở lại!`);

            if (res.data.role === "Admin") {
                navigate("/admin");
            } else {
                navigate("/home");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(
                error.response?.data?.message ||
                "Email hoặc mật khẩu không chính xác."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page-container">
            <div className="auth-card-split">
                {/* LEFT VISUAL PANEL */}
                <div className="auth-graphic-panel">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <div className="p-2 rounded-3 bg-primary text-white d-flex align-items-center justify-content-center">
                                <LuSmartphone size={22} />
                            </div>
                            <span className="fw-bold fs-4 text-white font-display">
                                PHONE<span style={{ color: "#38bdf8" }}>STORE</span>
                            </span>
                        </div>
                        <h2 className="text-white fw-bold display-6 mb-3 font-display">
                            Trải Nghiệm Công Nghệ Đỉnh Cao Thế Hệ Mới.
                        </h2>
                        <p className="text-white-50 small" style={{ lineHeight: 1.6 }}>
                            Đăng nhập để nhận ngay ưu đãi giảm giá độc quyền dành cho thành viên, tích điểm đổi quà và hưởng trọn vẹn chính sách bảo hành VIP.
                        </p>
                    </div>

                    <div className="d-flex flex-column gap-3 mt-4">
                        <div className="d-flex align-items-center gap-3 p-3 bg-white bg-opacity-10 rounded-3 border border-white border-opacity-10">
                            <LuTruck size={24} className="text-primary flex-shrink-0" />
                            <div>
                                <div className="fw-bold text-white small">Giao Hàng Hỏa Tốc 2H</div>
                                <small className="text-white-50">Miễn phí ship toàn quốc cho đơn hàng từ 500k</small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3 p-3 bg-white bg-opacity-10 rounded-3 border border-white border-opacity-10">
                            <LuShieldCheck size={24} className="text-success flex-shrink-0" />
                            <div>
                                <div className="fw-bold text-white small">Bảo Hành 1 Đổi 1 Trong 30 Ngày</div>
                                <small className="text-white-50">Cam kết 100% sản phẩm phân phối chính hãng</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT FORM PANEL */}
                <div className="auth-form-panel">
                    <div className="mb-4">
                        <h3 className="fw-bold mb-1 font-display">Đăng Nhập Tài Khoản</h3>
                        <p className="text-muted small">Chào mừng bạn quay trở lại với PhoneStore</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Địa chỉ Email</label>
                            <input
                                type="email"
                                className="form-control form-control-lg fs-6"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <label className="form-label fw-semibold small">Mật khẩu</label>
                                <a
                                    href="#forgot"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toast.info("Vui lòng liên hệ Hotline 1800.6868 để khôi phục mật khẩu.");
                                    }}
                                    className="small text-primary text-decoration-none"
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control form-control-lg fs-6 border-end-0"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary border-start-0 bg-white text-muted"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100 fw-bold mt-2 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                            disabled={loading}
                        >
                            <span>{loading ? "Đang xác thực..." : "Đăng Nhập Ngay"}</span>
                            <LuArrowRight size={18} />
                        </button>

                        <div className="text-center mt-4 pt-2">
                            <span className="text-muted small">Chưa có tài khoản PhoneStore? </span>
                            <Link to="/register" className="text-primary fw-bold text-decoration-none small">
                                Đăng ký ngay
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;