import { useEffect, useState } from "react";
import { Table, Badge, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { 
    LuUsers, 
    LuSearch, 
    LuShieldCheck, 
    LuUser, 
    LuPhone, 
    LuMapPin,
    LuRotateCcw
} from "react-icons/lu";
import userApi from "../../api/userApi";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setLoading(true);
            const res = await userApi.getAll();
            setUsers(res.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách tài khoản.");
        } finally {
            setLoading(false);
        }
    }

    const filtered = users.filter((u) => {
        if (roleFilter !== "all" && u.role?.toLowerCase() !== roleFilter.toLowerCase()) {
            return false;
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            return (
                u.fullName?.toLowerCase().includes(term) ||
                u.email?.toLowerCase().includes(term) ||
                u.phone?.includes(term) ||
                u.address?.toLowerCase().includes(term)
            );
        }
        return true;
    });

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Đang tải danh sách người dùng...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-0 font-display fs-4">Quản Lý Người Dùng & Phân Quyền</h2>
                    <p className="text-muted small mb-0">Danh sách tài khoản khách hàng và quản trị viên hệ thống</p>
                </div>
                <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                    Tổng: {users.length} tài khoản
                </span>
            </div>

            {/* SEARCH & FILTER */}
            <div className="card border-0 shadow-sm p-3 mb-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><LuSearch className="text-muted" /></span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Tìm theo họ tên, email, điện thoại, địa chỉ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-12 col-md-6 d-flex gap-2 justify-content-md-end">
                        <Form.Select
                            style={{ maxWidth: 180 }}
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="Admin">Quản trị viên (Admin)</option>
                            <option value="Customer">Khách hàng (Customer)</option>
                        </Form.Select>
                        <button className="btn btn-outline-secondary d-flex align-items-center" onClick={loadUsers} title="Làm mới">
                            <LuRotateCcw size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center my-4 rounded-4">
                    <div className="text-muted">Không tìm thấy tài khoản nào phù hợp.</div>
                </div>
            ) : (
                <div className="card border-0 shadow-sm overflow-hidden rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light small">
                                <tr>
                                    <th className="ps-4" width="80">ID</th>
                                    <th>Họ và Tên</th>
                                    <th>Email</th>
                                    <th>Số Điện Thoại</th>
                                    <th>Địa Chỉ</th>
                                    <th className="text-center pe-4" width="140">Vai Trò</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u) => {
                                    const userSavedAvatar = u.avatar || localStorage.getItem(`userAvatar_${u.userId}`) || "";
                                    const bgColors = ["#2563eb", "#059669", "#7c3aed", "#d97706", "#db2777", "#0891b2"];
                                    const bgColor = bgColors[(u.userId || 0) % bgColors.length];

                                    return (
                                        <tr key={u.userId}>
                                            <td className="ps-4 fw-bold text-muted tabular-nums">#{u.userId}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {userSavedAvatar ? (
                                                        <img
                                                            src={userSavedAvatar}
                                                            alt={u.fullName}
                                                            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
                                                            onError={(e) => { e.target.style.display = "none"; }}
                                                        />
                                                    ) : (
                                                        <div 
                                                            className="user-avatar shadow-sm" 
                                                            style={{ 
                                                                width: 34, 
                                                                height: 34, 
                                                                fontSize: "0.85rem", 
                                                                background: bgColor,
                                                                borderRadius: "50%",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                color: "#ffffff",
                                                                fontWeight: "bold",
                                                                flexShrink: 0
                                                            }}
                                                        >
                                                            {u.fullName?.trim()?.charAt(0)?.toUpperCase() || "U"}
                                                        </div>
                                                    )}
                                                    <span className="fw-semibold small">{u.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="small text-muted">{u.email}</td>
                                            <td className="small tabular-nums">{u.phone || <span className="text-muted fst-italic">Chưa cập nhật</span>}</td>
                                            <td className="small text-truncate" style={{ maxWidth: 220 }}>
                                                {u.address || <span className="text-muted fst-italic">Chưa có địa chỉ</span>}
                                            </td>
                                        <td className="text-center pe-4">
                                            {u.role === "Admin" ? (
                                                <span className="badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-1 rounded-pill small fw-bold">
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="badge bg-light text-dark border px-3 py-1 rounded-pill small">
                                                    Customer
                                                </span>
                                            )}
                                        </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;