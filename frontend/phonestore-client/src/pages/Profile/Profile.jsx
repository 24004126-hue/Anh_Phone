import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
    LuUser, 
    LuLock, 
    LuPackage, 
    LuSave, 
    LuCamera, 
    LuMapPin, 
    LuPhone, 
    LuMail,
    LuCheck,
    LuSparkles,
    LuUpload
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import userApi from "../../api/userApi";
import orderApi from "../../api/orderApi";
import productApi from "../../api/productApi";
import { formatPrice } from "../../components/product/ProductCard";

const AVATAR_PRESETS = [
    { id: "preset-1", name: "Cyber Blue", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { id: "preset-2", name: "Obsidian Pro", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    { id: "preset-3", name: "Tech Minimal", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
    { id: "preset-4", name: "Executive", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
    { id: "preset-5", name: "Modern Artist", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" }
];

function Profile() {
    const { user, updateAvatar, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState("info");
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [ordersSummary, setOrdersSummary] = useState({ count: 0, totalSpend: 0 });
    const [avatarUrl, setAvatarUrl] = useState(
        user?.avatar || (user?.userId ? localStorage.getItem(`userAvatar_${user.userId}`) : "") || ""
    );

    const [profileForm, setProfileForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (user) {
            loadUserData();
            loadUserOrders();
            const savedAvatar = user.avatar || (user.userId ? localStorage.getItem(`userAvatar_${user.userId}`) : "") || "";
            setAvatarUrl(savedAvatar);
        }
    }, [user]);

    async function loadUserData() {
        try {
            if (user?.userId) {
                const res = await userApi.getById(user.userId);
                const data = res.data;
                setProfileForm({
                    fullName: data.fullName || user.fullName || "",
                    email: data.email || user.email || "",
                    phone: data.phone || "",
                    address: data.address || ""
                });
            }
        } catch (error) {
            console.error("Load profile error:", error);
            setProfileForm({
                fullName: user?.fullName || "",
                email: user?.email || "",
                phone: user?.phone || "",
                address: user?.address || ""
            });
        }
    }

    async function loadUserOrders() {
        try {
            const userId = user?.userId || localStorage.getItem("userId");
            if (userId) {
                const res = await orderApi.getMyOrders(Number(userId));
                const list = res.data || [];
                const validOrders = list.filter(o => o.status !== "Cancelled");
                const spend = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                setOrdersSummary({
                    count: list.length,
                    totalSpend: spend
                });
            }
        } catch (error) {
            console.error("Load orders summary error:", error);
        }
    }

    async function handleAvatarUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Vui lòng chọn ảnh định dạng JPG, PNG hoặc WEBP.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Dung lượng ảnh tối đa 5MB.");
            return;
        }

        try {
            setUploadingAvatar(true);
            const res = await productApi.uploadImage(file);
            const newUrl = res.data.url;
            setAvatarUrl(newUrl);
            updateAvatar(newUrl);
            toast.success("Cập nhật ảnh đại diện thành công!");
        } catch (err) {
            console.error("Upload avatar error:", err);
            // Fallback to local FileReader base64
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                setAvatarUrl(base64);
                updateAvatar(base64);
                toast.success("Cập nhật ảnh đại diện thành công!");
            };
            reader.readAsDataURL(file);
        } finally {
            setUploadingAvatar(false);
            e.target.value = "";
        }
    }

    function handleSelectPresetAvatar(url) {
        setAvatarUrl(url);
        updateAvatar(url);
        toast.success("Đã chọn ảnh đại diện mới!");
    }

    function handleRemoveAvatar() {
        setAvatarUrl("");
        updateAvatar("");
        toast.info("Đã chuyển về chữ cái đại diện mặc định.");
    }

    async function handleUpdateProfile(e) {
        e.preventDefault();
        if (!profileForm.fullName.trim()) {
            toast.warn("Vui lòng nhập họ và tên.");
            return;
        }

        try {
            setLoading(true);
            const updatePayload = {
                userId: user.userId,
                fullName: profileForm.fullName.trim(),
                email: profileForm.email.trim(),
                phone: profileForm.phone.trim() || null,
                address: profileForm.address.trim() || null,
                role: user.role || "Customer"
            };

            await userApi.update(updatePayload);

            // Update auth state
            updateProfile({
                fullName: updatePayload.fullName,
                phone: updatePayload.phone,
                address: updatePayload.address
            });

            toast.success("Cập nhật thông tin tài khoản thành công!");
        } catch (error) {
            console.error("Update profile error:", error);
            toast.error(error.response?.data?.message || "Cập nhật thông tin thất bại.");
        } finally {
            setLoading(false);
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
            toast.warn("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.warn("Mật khẩu xác nhận không trùng khớp.");
            return;
        }

        try {
            setLoading(true);
            toast.success("Đổi mật khẩu thành công! Hãy lưu giữ mật khẩu cẩn thận.");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error(error);
            toast.error("Đổi mật khẩu thất bại.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="py-3 py-md-4">
            {/* HERO PROFILE CARD */}
            <div 
                className="card border-0 shadow-sm overflow-hidden mb-4 rounded-4" 
                style={{ 
                    background: "linear-gradient(135deg, #090d16 0%, #0f172a 100%)", 
                    color: "#ffffff", 
                    border: "1px solid rgba(255,255,255,0.08)" 
                }}
            >
                <div className="p-3 p-md-5 d-flex align-items-center justify-content-between flex-wrap gap-4">
                    <div className="d-flex align-items-center gap-3">
                        {/* CIRCULAR AVATAR WITH UPLOAD TRIGGER */}
                        <div className="position-relative">
                            <div className="user-avatar-profile">
                                {avatarUrl ? (
                                    <img 
                                        src={avatarUrl} 
                                        alt={user?.fullName || "User"} 
                                        className="user-avatar-img"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            setAvatarUrl("");
                                        }}
                                    />
                                ) : (
                                    <span className="user-avatar-initial font-display">
                                        {user?.fullName?.trim()?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>

                            <label 
                                htmlFor="avatar-upload-input" 
                                className="avatar-upload-btn"
                                title="Đổi ảnh đại diện"
                            >
                                <LuCamera size={14} />
                            </label>
                            <input 
                                id="avatar-upload-input" 
                                type="file" 
                                accept="image/jpeg,image/png,image/webp" 
                                className="d-none" 
                                onChange={handleAvatarUpload}
                                disabled={uploadingAvatar}
                            />
                        </div>

                        <div>
                            <h3 className="fw-bold text-white mb-1 font-display fs-4 fs-md-3">{user?.fullName || "Khách Hàng"}</h3>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className="text-white-50 small d-flex align-items-center gap-1">
                                    <LuMail size={13} /> {user?.email}
                                </span>
                                <span className="badge bg-secondary bg-opacity-50 text-white px-2 py-1 rounded-pill small">
                                    {user?.role === "Admin" ? "Quản trị viên" : "Khách hàng"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex gap-2 gap-md-3 text-white text-center flex-grow-1 flex-md-grow-0 justify-content-between">
                        <div className="p-2 p-md-3 bg-white bg-opacity-10 rounded-3 border border-white border-opacity-10 flex-grow-1">
                            <div className="fs-5 fs-md-4 fw-bold tabular-nums">{ordersSummary.count}</div>
                            <div className="small text-white-50" style={{ fontSize: "0.75rem" }}>Đơn đã mua</div>
                        </div>
                        <div className="p-2 p-md-3 bg-white bg-opacity-10 rounded-3 border border-white border-opacity-10 flex-grow-1">
                            <div className="fs-5 fs-md-4 fw-bold text-info tabular-nums">{formatPrice(ordersSummary.totalSpend)}</div>
                            <div className="small text-white-50" style={{ fontSize: "0.75rem" }}>Tổng chi tiêu</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AVATAR PRESET SELECTOR STRIP */}
            <div className="card border-0 shadow-sm p-3 mb-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                    <span className="small fw-bold text-muted d-flex align-items-center gap-1">
                        <LuSparkles size={14} className="text-primary" /> Chọn avatar nhanh hoặc tải ảnh lên:
                    </span>
                    <label 
                        htmlFor="avatar-upload-input" 
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 small"
                        style={{ cursor: "pointer" }}
                    >
                        <LuUpload size={13} />
                        <span>{uploadingAvatar ? "Đang tải ảnh..." : "Tải ảnh từ máy"}</span>
                    </label>
                </div>
                <div className="d-flex gap-3 overflow-x-auto py-2 align-items-center">
                    {/* OPTION: USE DEFAULT INITIAL */}
                    <div 
                        className={`avatar-preset-item d-flex align-items-center justify-content-center bg-primary text-white fw-bold ${!avatarUrl ? "active" : ""}`}
                        onClick={handleRemoveAvatar}
                        title="Dùng chữ cái đại diện mặc định"
                    >
                        <span style={{ fontSize: "1.1rem" }}>{user?.fullName?.trim()?.charAt(0)?.toUpperCase() || "U"}</span>
                        {!avatarUrl && (
                            <div className="avatar-preset-check">
                                <LuCheck size={11} />
                            </div>
                        )}
                    </div>

                    {AVATAR_PRESETS.map((p) => (
                        <div 
                            key={p.id} 
                            className={`avatar-preset-item ${avatarUrl === p.url ? "active" : ""}`}
                            onClick={() => handleSelectPresetAvatar(p.url)}
                            title={p.name}
                        >
                            <img src={p.url} alt={p.name} className="avatar-preset-img" />
                            {avatarUrl === p.url && (
                                <div className="avatar-preset-check">
                                    <LuCheck size={11} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* TABS & MAIN CONTENT */}
            <div className="row g-4">
                {/* SIDEBAR TABS (STACKS HORIZONTALLY ON MOBILE) */}
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm p-2 p-md-3 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="d-flex flex-row flex-md-column gap-2 overflow-x-auto pb-1 pb-md-0">
                            <button
                                className={`btn text-start p-2 p-md-3 rounded-3 d-flex align-items-center gap-2 gap-md-3 fw-semibold small text-nowrap flex-grow-1 ${activeTab === "info" ? "btn-primary" : "btn-light"}`}
                                onClick={() => setActiveTab("info")}
                            >
                                <LuUser size={18} />
                                <span>Thông Tin & Địa Chỉ</span>
                            </button>

                            <button
                                className={`btn text-start p-2 p-md-3 rounded-3 d-flex align-items-center gap-2 gap-md-3 fw-semibold small text-nowrap flex-grow-1 ${activeTab === "security" ? "btn-primary" : "btn-light"}`}
                                onClick={() => setActiveTab("security")}
                            >
                                <LuLock size={18} />
                                <span>Đổi Mật Khẩu</span>
                            </button>

                            <Link
                                to="/orders"
                                className="btn btn-light text-start p-2 p-md-3 rounded-3 d-flex align-items-center gap-2 gap-md-3 fw-semibold small text-decoration-none text-dark text-nowrap flex-grow-1"
                            >
                                <LuPackage size={18} />
                                <span>Đơn Hàng ({ordersSummary.count})</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="col-12 col-md-8">
                    {activeTab === "info" && (
                        <div className="card border-0 shadow-sm p-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0 font-display fs-6">Thông Tin Cá Nhân & Địa Chỉ Nhận Hàng</h5>
                            </div>

                            <form onSubmit={handleUpdateProfile}>
                                <div className="row g-3">
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label fw-semibold small">Họ và Tên <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={profileForm.fullName}
                                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-12 col-sm-6">
                                        <label className="form-label fw-semibold small">Địa chỉ Email</label>
                                        <input
                                            type="email"
                                            className="form-control bg-light"
                                            disabled
                                            value={profileForm.email}
                                        />
                                        <small className="text-muted">Email tài khoản không thể thay đổi</small>
                                    </div>

                                    <div className="col-12 col-sm-6">
                                        <label className="form-label fw-semibold small">Số Điện Thoại Nhận Hàng</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="0987xxxxxx"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-semibold small">Địa Chỉ Giao Hàng Mặc Định</label>
                                        <textarea
                                            rows="3"
                                            className="form-control"
                                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                                            value={profileForm.address}
                                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4 py-2 fw-bold rounded-pill d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-center"
                                        disabled={loading}
                                    >
                                        <LuSave size={16} />
                                        <span>{loading ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="card border-0 shadow-sm p-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0 font-display fs-6">Đổi Mật Khẩu Tài Khoản</h5>
                            </div>

                            <form onSubmit={handleChangePassword}>
                                <div className="d-flex flex-column gap-3" style={{ maxWidth: 460 }}>
                                    <div>
                                        <label className="form-label fw-semibold small">Mật khẩu hiện tại</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Nhập mật khẩu hiện tại"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="form-label fw-semibold small">Mật khẩu mới <span className="text-danger">*</span></label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            required
                                            placeholder="Tối thiểu 6 ký tự"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="form-label fw-semibold small">Xác nhận mật khẩu mới <span className="text-danger">*</span></label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            required
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-warning fw-bold mt-2 align-self-start px-4 rounded-pill w-100 w-sm-auto"
                                        disabled={loading}
                                    >
                                        {loading ? "Đang xử lý..." : "Cập Nhật Mật Khẩu"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
