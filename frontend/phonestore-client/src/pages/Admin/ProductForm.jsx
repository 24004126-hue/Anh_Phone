import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { 
    LuSave, 
    LuUpload, 
    LuArrowLeft, 
    LuSmartphone, 
    LuImage,
    LuLayers,
    LuPlus,
    LuTrash2
} from "react-icons/lu";

import productApi from "../../api/productApi";
import brandApi from "../../api/brandApi";
import categoryApi from "../../api/categoryApi";

function ProductForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        productName: "",
        sku: "",
        price: "",
        discountPrice: "",
        quantity: 0,
        description: "",
        thumbnail: "",
        screen: "",
        operatingSystem: "",
        frontCamera: "",
        rearCamera: "",
        chip: "",
        ram: "",
        storage: "",
        battery: "",
        color: "",
        weight: "",
        warranty: 12,
        status: "Active",
        brandId: "",
        categoryId: ""
    });

    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState("");

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        try {
            const brandRes = await brandApi.getAll();
            const categoryRes = await categoryApi.getAll();

            setBrands(brandRes.data || []);
            setCategories(categoryRes.data || []);

            if (isEdit) {
                const productRes = await productApi.getById(id);
                const product = productRes.data;

                setForm({
                    productName: product.productName ?? "",
                    sku: product.sku ?? "",
                    price: product.price ?? "",
                    discountPrice: product.discountPrice ?? "",
                    quantity: product.quantity ?? 0,
                    description: product.description ?? "",
                    thumbnail: product.thumbnail ?? "",
                    screen: product.screen ?? "",
                    operatingSystem: product.operatingSystem ?? "",
                    frontCamera: product.frontCamera ?? "",
                    rearCamera: product.rearCamera ?? "",
                    chip: product.chip ?? "",
                    ram: product.ram ?? "",
                    storage: product.storage ?? "",
                    battery: product.battery ?? "",
                    color: product.color ?? "",
                    weight: product.weight ?? "",
                    warranty: product.warranty ?? 12,
                    status: product.status ?? "Active",
                    brandId: product.brandId ?? "",
                    categoryId: product.categoryId ?? ""
                });
                setPreview(product.thumbnail ?? "");
                setVariants(product.variants ?? []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải dữ liệu sản phẩm.");
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    // Variant Handlers
    function handleAddVariant() {
        const defaultStorage = form.storage || "256GB";
        const defaultColor = form.color || "Titan Tự Nhiên";
        const defaultPrice = Number(form.price) || 0;
        const defaultDiscount = form.discountPrice ? Number(form.discountPrice) : null;
        const generatedSku = form.sku ? `${form.sku}-${variants.length + 1}` : `SKU-${Date.now()}`;

        setVariants(prev => [
            ...prev,
            {
                variantId: 0,
                sku: generatedSku,
                color: defaultColor,
                colorHex: "#9E9A95",
                storage: defaultStorage,
                price: defaultPrice,
                discountPrice: defaultDiscount,
                quantity: 10,
                thumbnail: form.thumbnail || "",
                isActive: true
            }
        ]);
    }

    function handleVariantChange(index, field, value) {
        setVariants(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }

    function handleRemoveVariant(index) {
        setVariants(prev => prev.filter((_, i) => i !== index));
    }

    async function handleUploadImage(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Chỉ hỗ trợ file JPG, PNG và WEBP.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ảnh không được vượt quá 5MB.");
            e.target.value = "";
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);
        setUploading(true);

        try {
            const res = await productApi.uploadImage(file);
            const imageUrl = res.data.url;

            setForm(prev => ({
                ...prev,
                thumbnail: imageUrl
            }));

            setPreview(imageUrl);
            toast.success("Upload ảnh sản phẩm thành công!");
        } catch (error) {
            console.error("UPLOAD ERROR:", error);
            setPreview(form.thumbnail);
            toast.error(error.response?.data?.message || "Upload ảnh thất bại.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!form.productName.trim()) {
            toast.warn("Vui lòng nhập tên sản phẩm.");
            return;
        }

        if (!form.price || Number(form.price) < 0) {
            toast.warn("Vui lòng nhập giá bán hợp lệ.");
            return;
        }

        if (!form.brandId) {
            toast.warn("Vui lòng chọn thương hiệu.");
            return;
        }

        if (!form.categoryId) {
            toast.warn("Vui lòng chọn danh mục.");
            return;
        }

        setLoading(true);

        try {
            const data = {
                productName: form.productName.trim(),
                sku: form.sku.trim() || null,
                price: Number(form.price),
                discountPrice: form.discountPrice === "" ? null : Number(form.discountPrice),
                quantity: Number(form.quantity),
                description: form.description.trim() || null,
                thumbnail: form.thumbnail || null,
                screen: form.screen.trim() || null,
                operatingSystem: form.operatingSystem.trim() || null,
                frontCamera: form.frontCamera.trim() || null,
                rearCamera: form.rearCamera.trim() || null,
                chip: form.chip.trim() || null,
                ram: form.ram.trim() || null,
                storage: form.storage.trim() || null,
                battery: form.battery.trim() || null,
                color: form.color.trim() || null,
                weight: form.weight.trim() || null,
                warranty: Number(form.warranty),
                status: form.status || "Active",
                brandId: Number(form.brandId),
                categoryId: Number(form.categoryId)
            };

            let targetProductId = id;

            if (isEdit) {
                await productApi.update({
                    productId: Number(id),
                    ...data
                });
            } else {
                const res = await productApi.create(data);
                targetProductId = res.data.productId;
            }

            // Save variants if any
            if (targetProductId && variants.length > 0) {
                await productApi.saveVariants(targetProductId, variants);
            }

            toast.success(isEdit ? "Cập nhật sản phẩm & biến thể thành công!" : "Thêm sản phẩm mới thành công!");
            navigate("/admin/products");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lưu sản phẩm thất bại.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-0 font-display fs-4">
                        {isEdit ? `Chỉnh Sửa Sản Phẩm #${id}` : "Thêm Điện Thoại Mới"}
                    </h2>
                    <p className="text-muted small mb-0">Nhập đầy đủ thông tin cấu hình, giá niêm yết, thông số kỹ thuật và các biến thể</p>
                </div>
                <Link to="/admin/products" className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1 small">
                    <LuArrowLeft size={16} />
                    <span>Quay lại danh sách</span>
                </Link>
            </div>

            <div className="card border-0 shadow-sm p-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                <Form onSubmit={handleSubmit}>
                    {/* 1. THÔNG TIN CƠ BẢN */}
                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                        <LuSmartphone className="text-primary" />
                        <h6 className="fw-bold mb-0 font-display text-primary">1. Thông Tin Nhận Diện & Định Danh</h6>
                    </div>

                    <Row className="g-3 mb-4">
                        <Col md={8}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Tên sản phẩm <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    name="productName"
                                    placeholder="Ví dụ: iPhone 16 Pro Max 256GB"
                                    value={form.productName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Mã SKU</Form.Label>
                                <Form.Control
                                    name="sku"
                                    placeholder="IP16PM-256-DESERT"
                                    value={form.sku}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Hãng sản xuất <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    name="brandId"
                                    value={form.brandId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Chọn thương hiệu --</option>
                                    {brands.map(b => (
                                        <option key={b.brandId} value={b.brandId}>{b.brandName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Danh mục phân khúc <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    name="categoryId"
                                    value={form.categoryId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(c => (
                                        <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* 2. GIÁ CẢ & TỒN KHO */}
                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                        <LuImage className="text-primary" />
                        <h6 className="fw-bold mb-0 font-display text-primary">2. Giá Bán, Tồn Kho & Hình Ảnh</h6>
                    </div>

                    <Row className="g-3 mb-4">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Giá niêm yết (VNĐ) <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    name="price"
                                    placeholder="34990000"
                                    value={form.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Giá khuyến mãi (VNĐ)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="discountPrice"
                                    placeholder="32990000"
                                    value={form.discountPrice}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Số lượng tồn kho (máy)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={8}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Đường dẫn ảnh Thumbnail</Form.Label>
                                <Form.Control
                                    name="thumbnail"
                                    placeholder="/images/products/iphone-16-pro-max.jpg hoặc URL online"
                                    value={form.thumbnail}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <div className="mt-2">
                                <label className="btn btn-outline-primary btn-sm rounded-pill d-inline-flex align-items-center gap-2">
                                    <LuUpload size={14} />
                                    <span>{uploading ? "Đang tải ảnh lên..." : "Tải ảnh từ máy tính..."}</span>
                                    <input type="file" hidden accept="image/*" onChange={handleUploadImage} disabled={uploading} />
                                </label>
                            </div>
                        </Col>

                        <Col md={4}>
                            <Form.Label className="small fw-semibold">Xem trước ảnh đại diện</Form.Label>
                            <div className="p-2 border rounded-3 text-center bg-light" style={{ height: 110 }}>
                                {preview ? (
                                    <img src={preview} alt="Preview" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                                ) : (
                                    <span className="text-muted small d-block pt-4">Chưa có ảnh</span>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {/* 3. DYNAMIC VARIANTS MANAGEMENT */}
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <LuLayers className="text-primary" />
                            <h6 className="fw-bold mb-0 font-display text-primary">3. Quản Lý Biến Thể Phiên Bản (Dung Lượng & Màu Sắc)</h6>
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-1"
                            onClick={handleAddVariant}
                        >
                            <LuPlus size={14} />
                            <span>Thêm Biến Thể Mới</span>
                        </button>
                    </div>

                    {variants.length > 0 ? (
                        <div className="table-responsive mb-4">
                            <table className="table table-bordered align-middle small mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: "15%" }}>Dung Lượng</th>
                                        <th style={{ width: "18%" }}>Tên Màu</th>
                                        <th style={{ width: "10%" }}>Mã Màu Hex</th>
                                        <th style={{ width: "18%" }}>Mã SKU Biến Thể</th>
                                        <th style={{ width: "15%" }}>Giá Bán (VNĐ)</th>
                                        <th style={{ width: "12%" }}>Tồn Kho</th>
                                        <th style={{ width: "12%" }} className="text-center">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variants.map((v, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="256GB"
                                                    value={v.storage || ""}
                                                    onChange={(e) => handleVariantChange(index, "storage", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Titan Sa Mạc"
                                                    value={v.color || ""}
                                                    onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-1">
                                                    <input
                                                        type="color"
                                                        className="form-control form-control-color form-control-sm p-0"
                                                        style={{ width: 28, height: 28 }}
                                                        value={v.colorHex || "#9E9A95"}
                                                        onChange={(e) => handleVariantChange(index, "colorHex", e.target.value)}
                                                    />
                                                    <span className="text-muted" style={{ fontSize: "0.72rem" }}>{v.colorHex}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="IP16PM-256-DESERT"
                                                    value={v.sku || ""}
                                                    onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    placeholder="34990000"
                                                    value={v.price || ""}
                                                    onChange={(e) => handleVariantChange(index, "price", Number(e.target.value))}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    placeholder="10"
                                                    value={v.quantity || 0}
                                                    onChange={(e) => handleVariantChange(index, "quantity", Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm rounded-circle p-1"
                                                    onClick={() => handleRemoveVariant(index)}
                                                    title="Xóa biến thể này"
                                                >
                                                    <LuTrash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="alert alert-light border text-center py-3 mb-4 rounded-3 small text-muted">
                            Chưa có biến thể phiên bản nào. Bấm <strong>"+ Thêm Biến Thể Mới"</strong> nếu sản phẩm có nhiều tùy chọn bộ nhớ và màu sắc.
                        </div>
                    )}

                    {/* 4. THÔNG SỐ KỸ THUẬT */}
                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                        <LuSmartphone className="text-primary" />
                        <h6 className="fw-bold mb-0 font-display text-primary">4. Cấu Hình Phần Cứng & Thông Số Chi Tiết</h6>
                    </div>

                    <Row className="g-3 mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Vi xử lý (Chip CPU)</Form.Label>
                                <Form.Control
                                    name="chip"
                                    placeholder="Apple A18 Pro / Snapdragon 8 Gen 3"
                                    value={form.chip}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Bộ nhớ RAM</Form.Label>
                                <Form.Control
                                    name="ram"
                                    placeholder="8GB / 12GB / 16GB"
                                    value={form.ram}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Màn hình</Form.Label>
                                <Form.Control
                                    name="screen"
                                    placeholder="6.9 inch Super Retina XDR OLED 120Hz"
                                    value={form.screen}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Hệ điều hành</Form.Label>
                                <Form.Control
                                    name="operatingSystem"
                                    placeholder="iOS 18 / Android 14"
                                    value={form.operatingSystem}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Bộ nhớ trong (Storage)</Form.Label>
                                <Form.Control
                                    name="storage"
                                    placeholder="256GB / 512GB / 1TB"
                                    value={form.storage}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Camera sau</Form.Label>
                                <Form.Control
                                    name="rearCamera"
                                    placeholder="Chính 48MP + 48MP Ultra Wide + 12MP Tele 5x"
                                    value={form.rearCamera}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Camera trước</Form.Label>
                                <Form.Control
                                    name="frontCamera"
                                    placeholder="12MP TrueDepth, Autofocus"
                                    value={form.frontCamera}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Pin & Công nghệ sạc</Form.Label>
                                <Form.Control
                                    name="battery"
                                    placeholder="4.685 mAh, Sạc nhanh 30W, MagSafe 25W"
                                    value={form.battery}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Màu sắc</Form.Label>
                                <Form.Control
                                    name="color"
                                    placeholder="Titan Sa Mạc / Titan Tự Nhiên"
                                    value={form.color}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Trọng lượng</Form.Label>
                                <Form.Control
                                    name="weight"
                                    placeholder="227g"
                                    value={form.weight}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Bảo hành (tháng)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="warranty"
                                    value={form.warranty}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Mô tả sản phẩm</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="description"
                                    placeholder="Giới thiệu các tính năng nổi bật của dòng điện thoại..."
                                    value={form.description}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex gap-3 pt-3 border-top">
                        <button
                            className="btn btn-primary px-4 py-2 fw-bold rounded-pill d-flex align-items-center gap-2"
                            type="submit"
                            disabled={loading}
                        >
                            <LuSave size={16} />
                            <span>{loading ? "Đang lưu..." : isEdit ? "Lưu Cập Nhật" : "Thêm Sản Phẩm"}</span>
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary rounded-pill px-4"
                            onClick={() => navigate("/admin/products")}
                        >
                            Hủy Bỏ
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default ProductForm;