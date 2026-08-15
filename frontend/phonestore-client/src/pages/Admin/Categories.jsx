import { useEffect, useState } from "react";
import { Button, Form, Table, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { 
    LuPlus, 
    LuPencil, 
    LuTrash2, 
    LuFolderTree, 
    LuRotateCcw,
    LuSave
} from "react-icons/lu";
import categoryApi from "../../api/categoryApi";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            setLoading(true);
            const res = await categoryApi.getAll();
            setCategories(res.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách danh mục.");
        } finally {
            setLoading(false);
        }
    }

    function handleEdit(cat) {
        setEditingId(cat.categoryId);
        setCategoryName(cat.categoryName);
        setDescription(cat.description || "");
    }

    function handleCancel() {
        setEditingId(null);
        setCategoryName("");
        setDescription("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!categoryName.trim()) {
            toast.warn("Vui lòng nhập tên danh mục.");
            return;
        }

        try {
            if (editingId) {
                await categoryApi.update({
                    categoryId: editingId,
                    categoryName: categoryName.trim(),
                    description: description.trim() || undefined
                });
                toast.success("Cập nhật danh mục thành công!");
            } else {
                await categoryApi.create({
                    categoryName: categoryName.trim(),
                    description: description.trim() || undefined
                });
                toast.success("Thêm danh mục mới thành công!");
            }
            handleCancel();
            loadCategories();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Không thể lưu danh mục.");
        }
    }

    async function handleDelete(id, name) {
        const confirmDelete = window.confirm(`Bạn có chắc muốn xóa danh mục "${name || id}"?`);
        if (!confirmDelete) return;

        try {
            await categoryApi.delete(id);
            toast.success(`Đã xóa danh mục "${name || id}" thành công!`);
            loadCategories();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Không thể xóa danh mục (có thể đang có sản phẩm liên kết).");
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-0 font-display fs-4">Danh Mục & Phân Khúc Sản Phẩm</h2>
                    <p className="text-muted small mb-0">Quản lý phân loại sản phẩm (Flagship, Gaming Phone, Tầm trung...)</p>
                </div>
            </div>

            <div className="row g-4">
                {/* FORM */}
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm p-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <h5 className="fw-bold mb-3 font-display fs-6 d-flex align-items-center gap-2">
                            <LuFolderTree className="text-primary" />
                            <span>{editingId ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}</span>
                        </h5>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold">Tên Danh Mục</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Flagship, Gaming Phone..."
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold">Mô Tả</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows="3"
                                    placeholder="Mô tả tóm tắt phân khúc..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Form.Group>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary flex-grow-1 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1">
                                    <LuSave size={15} />
                                    <span>{editingId ? "Lưu Thay Đổi" : "Thêm Danh Mục"}</span>
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
                                            <th>Tên Danh Mục</th>
                                            <th>Mô Tả</th>
                                            <th width="140" className="text-center pe-4">Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-3 text-muted">
                                                    Chưa có danh mục nào
                                                </td>
                                            </tr>
                                        ) : (
                                            categories.map((c) => (
                                                <tr key={c.categoryId}>
                                                    <td className="ps-4 fw-bold text-muted tabular-nums">#{c.categoryId}</td>
                                                    <td className="fw-semibold small">{c.categoryName}</td>
                                                    <td className="small text-muted text-truncate" style={{ maxWidth: 260 }}>
                                                        {c.description || "-"}
                                                    </td>
                                                    <td className="text-center pe-4">
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button
                                                                className="btn btn-outline-warning btn-sm rounded-pill px-2 d-flex align-items-center gap-1 small"
                                                                onClick={() => handleEdit(c)}
                                                            >
                                                                <LuPencil size={12} />
                                                                <span>Sửa</span>
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm rounded-pill px-2 d-flex align-items-center"
                                                                onClick={() => handleDelete(c.categoryId, c.categoryName)}
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

export default Categories;