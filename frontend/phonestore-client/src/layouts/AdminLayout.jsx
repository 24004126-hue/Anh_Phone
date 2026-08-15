import { Outlet, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
    LuLayoutDashboard, 
    LuSmartphone, 
    LuShoppingBag, 
    LuTags, 
    LuFolderTree, 
    LuUsers, 
    LuStore, 
    LuLogOut, 
    LuExternalLink 
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    function handleLogout() {
        logout();
        toast.info("Đã đăng xuất khỏi phiên làm việc quản trị.");
        navigate("/login", { replace: true });
    }

    const navItems = [
        { path: "/admin", name: "Dashboard Tổng Quan", icon: <LuLayoutDashboard size={18} />, end: true },
        { path: "/admin/products", name: "Quản Lý Sản Phẩm", icon: <LuSmartphone size={18} /> },
        { path: "/admin/orders", name: "Quản Lý Đơn Hàng", icon: <LuShoppingBag size={18} /> },
        { path: "/admin/brands", name: "Hãng Sản Xuất", icon: <LuTags size={18} /> },
        { path: "/admin/categories", name: "Danh Mục Sản Phẩm", icon: <LuFolderTree size={18} /> },
        { path: "/admin/users", name: "Tài Khoản & Người Dùng", icon: <LuUsers size={18} /> },
    ];

    return (
        <div className="admin-shell-layout">
            {/* SIDEBAR */}
            <aside className="admin-sidebar-clean">
                <div className="admin-brand-header">
                    <div className="p-2 rounded-3 bg-primary text-white d-flex align-items-center justify-content-center">
                        <LuSmartphone size={20} />
                    </div>
                    <div>
                        <div className="fw-bold fs-6 text-white font-display">
                            PHONE<span style={{ color: "#38bdf8" }}>ADMIN</span>
                        </div>
                        <small className="text-white-50" style={{ fontSize: "0.72rem" }}>Hệ thống quản trị bán lẻ</small>
                    </div>
                </div>

                {/* BACK TO STORE BUTTON */}
                <Link to="/" className="admin-store-link-btn">
                    <LuStore size={16} />
                    <span>Xem Cửa Hàng Live</span>
                </Link>

                {/* NAVIGATION ITEMS */}
                <nav className="d-flex flex-column gap-1 py-2 flex-grow-1">
                    <div className="small text-uppercase text-white-50 fw-bold px-4 py-2" style={{ fontSize: "0.68rem", letterSpacing: "1px" }}>
                        Bảng điều khiển & Nghiệp vụ
                    </div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `admin-nav-item-link ${isActive ? "active" : ""}`
                            }
                        >
                            <span className="d-flex align-items-center">{item.icon}</span>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* ADMIN USER FOOTER */}
                <div className="p-3 border-top border-secondary border-opacity-25 mt-auto">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                            <div className="user-avatar" style={{ width: 34, height: 34, fontSize: "0.85rem", background: "var(--color-primary)" }}>
                                {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                            <div className="small text-truncate" style={{ maxWidth: 120 }}>
                                <div className="fw-bold text-white text-truncate">{user?.fullName || "Admin"}</div>
                                <span className="badge bg-warning text-dark" style={{ fontSize: "0.65rem" }}>Quản Trị Viên</span>
                            </div>
                        </div>
                        <button
                            className="btn btn-outline-danger btn-sm p-1 px-2 d-flex align-items-center"
                            title="Đăng xuất"
                            onClick={handleLogout}
                        >
                            <LuLogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-grow-1 d-flex flex-column min-w-0">
                {/* TOPBAR */}
                <header className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2 small">
                        <span className="text-muted">Quản trị</span>
                        <span className="text-muted">/</span>
                        <span className="fw-bold text-primary font-display">
                            {location.pathname === "/admin" ? "DASHBOARD" : location.pathname.replace("/admin/", "").toUpperCase()}
                        </span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <Link
                            to="/"
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-1 small fw-bold"
                        >
                            <LuExternalLink size={14} />
                            <span>Về Trang Bán Hàng</span>
                        </Link>
                        <div className="vr d-none d-sm-block"></div>
                        <div className="small text-muted d-none d-sm-block">
                            📅 {new Date().toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* PAGE OUTLET */}
                <main className="p-4 flex-grow-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;