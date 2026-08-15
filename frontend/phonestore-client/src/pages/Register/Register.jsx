import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
    LuSmartphone, 
    LuGift, 
    LuCrown, 
    LuEye, 
    LuEyeOff, 
    LuArrowRight 
} from "react-icons/lu";
import authApi from "../../api/authApi";

function Register() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleRegister(e) {
        e.preventDefault();

        if (!fullName.trim()) {
            toast.warn("Vui lòng nhập họ và tên.");
            return;
        }

        if (!email.trim()) {
            toast.warn("Vui lòng nhập email.");
            return;
        }

        if (!password || password.length < 6) {
            toast.warn("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        if (password !== confirmPassword) {
            toast.warn("Mật khẩu xác nhận không trùng khớp.");
            return;
        }

        try {
            setLoading(true);
            await authApi.register({
                fullName: fullName.trim(),
                email: email.trim(),
                password
            });

            toast.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Register error:", error);
            toast.error(
                error.response?.data?.message ||
                "Đăng ký thất bại. Vui lòng thử lại!"
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
                            Gia Nhập Cộng Đồng Công Nghệ VIP.
                        </h2>
                        <p className="text-white-50 small" style={{ lineHeight: 1.6 }}>
                            Tạo tài khoản chỉ trong 30 giây để nhận ngay voucher giảm 500k cho đơn hàng đầu tiên cùng gói bảo hành VIP mở rộng.
                        </p>
                    </div>

                    <div className="d-flex flex-column gap-3 mt-4">
                        <div className="d-flex align-items-center gap-3 p-3 bg-white bg-opacity-10 rounded-3 border border-white border-opacity-10">
                            <LuGift size={24} className="text-warning flex-shrink-0" />
                            <div>
                                <div className="fw-bold text-white small">Voucher Chào Mừng 500.000 ₫</div>
                                <small className="text-white-50">Áp dụng trực tiếp cho đơn mua smartphone</small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3 p-3 bg-white bg-opacity-10 rounded-3 border border-white border-opacity-10">
                            <LuCrown size={24} className="text-primary flex-shrink-0" />
                            <div>
                                <div className="fw-bold text-white small">Đặc Quyền Hội Viên Thân Thiết</div>
                                <small className="text-white-50">Ưu tiên trải nghiệm các dòng máy mới sớm nhất</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT FORM PANEL */}
                <div className="auth-form-panel">
                    <div className="mb-4">
                        <h3 className="fw-bold mb-1 font-display">Tạo Tài Khoản Mới</h3>
                        <p className="text-muted small">Điền thông tin bên dưới để đăng ký tài khoản PhoneStore</p>
                    </div>

                    <form onSubmit={handleRegister}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Họ và Tên</label>
                            <input
                                type="text"
                                className="form-control form-control-lg fs-6"
                                placeholder="Nguyễn Văn A"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

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
                            <label className="form-label fw-semibold small">Mật khẩu</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control form-control-lg fs-6 border-end-0"
                                    placeholder="Tối thiểu 6 ký tự"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary border-start-0 bg-white text-muted"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold small">Xác nhận Mật khẩu</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control form-control-lg fs-6"
                                placeholder="Nhập lại mật khẩu"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                            disabled={loading}
                        >
                            <span>{loading ? "Đang tạo tài khoản..." : "Đăng Ký Tài Khoản"}</span>
                            <LuArrowRight size={18} />
                        </button>

                        <div className="text-center mt-4 pt-2">
                            <span className="text-muted small">Đã có tài khoản PhoneStore? </span>
                            <Link to="/login" className="text-primary fw-bold text-decoration-none small">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;