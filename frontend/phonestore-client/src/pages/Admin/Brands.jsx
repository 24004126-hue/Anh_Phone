import { useEffect, useState } from "react";
import { Button, Form, Table, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { 
    LuPlus, 
    LuPencil, 
    LuTrash2, 
    LuTags, 
    LuRotateCcw,
    LuSave
} from "react-icons/lu";
import brandApi from "../../api/brandApi";

function Brands() {
    const [brands, setBrands] = useState([]);
    const [brandName, setBrandName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBrands();
    }, []);

    async function loadBrands() {
        try {
            setLoading(true);
            const res = await brandApi.getAll();
            setBrands(res.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách thương hiệu.");
        } finally {
            setLoading(false);
        }
    }

    function handleEdit(brand) {
        setEditingId(brand.brandId);
        setBrandName(brand.brandName);
    }

    function handleCancel() {
        setEditingId(null);
        setBrandName("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!brandName.trim()) {
            toast.warn("Vui lòng nhập tên thương hiệu.");
            return;
        }

        try {
            if (editingId) {
                await brandApi.update({
                    brandId: editingId,
                    brandName: brandName.trim()
                });
                toast.success("Cập nhật thương hiệu thành công!");
            } else {
                await brandApi.create({
                    brandName: brandName.trim()
                });
                toast.success("Thêm thương hiệu mới thành công!");
            }
            handleCancel();
            loadBrands();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Không thể lưu thông tin thương hiệu.");
        }
    }

    async function handleDelete(id, name) {
        const confirmDelete = window.confirm(`Bạn có chắc muốn xóa thương hiệu "${name || id}"?`);
        if (!confirmDelete) return;

        try {
            await brandApi.delete(id);
            toast.success(`Đã xóa thương hiệu "${name || id}" thành công!`);
            loadBrands();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Không thể xóa thương hiệu (có thể đang có sản phẩm liên kết).");
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-0 font-display fs-4">Quản Lý Thương Hiệu</h2>
                    <p className="text-muted small mb-0">Quản lý danh sách các nhà sản xuất smartphone</p>
                </div>
            </div>

            <div className="row g-4">
                {/* FORM */}
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm p-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <h5 className="fw-bold mb-3 font-display fs-6 d-flex align-items-center gap-2">
                            <LuTags className="text-primary" />
                            <span>{editingId ? "Chỉnh Sửa Thương Hiệu" : "Thêm Thương Hiệu Mới"}</span>
                        </h5>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold">Tên Thương Hiệu / Hãng</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Apple, Samsung, Xiaomi..."
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary flex-grow-1 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1">
                                    <LuSave size={15} />
                                    <span>{editingId ? "Lưu Thay Đổi" : "Thêm Hãng"}</span>
                                </button>
                                {editingId && (
                                    <button type="button" className="btn btn-secondary rounded-pill" onClick={handleCancel}>
                                        Hủy
                                    </button>
                                )}
                            </div>
                        </Form>
                    </div>
                </div>

                {/* TABLE */}
                <div className="col-12 col-md-8">
                    <div className="card border-0 shadow-sm overflow-hidden rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light small">
                                        <tr>
                                            <th className="ps-4" width="90">ID</th>
                                            <th>Tên Thương Hiệu</th>
                                            <th width="140" className="text-center pe-4">Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {brands.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center py-3 text-muted">
                                                    Chưa có thương hiệu nào
                                                </td>
                                            </tr>
                                        ) : (
                                            brands.map((b) => (
                                                <tr key={b.brandId}>
                                                    <td className="ps-4 fw-bold text-muted tabular-nums">#{b.brandId}</td>
                                                    <td className="fw-semibold small">{b.brandName}</td>
                                                    <td className="text-center pe-4">
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button
                                                                className="btn btn-outline-warning btn-sm rounded-pill px-2 d-flex align-items-center gap-1 small"
                                                                onClick={() => handleEdit(b)}
                                                            >
                                                                <LuPencil size={12} />
                                                                <span>Sửa</span>
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm rounded-pill px-2 d-flex align-items-center"
                                                                onClick={() => handleDelete(b.brandId, b.brandName)}
                                                            >
                                                                <LuTrash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Brands;