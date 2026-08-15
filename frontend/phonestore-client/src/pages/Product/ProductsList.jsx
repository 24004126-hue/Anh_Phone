import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { 
    LuSearch, 
    LuRotateCcw, 
    LuSmartphone,
    LuX,
    LuChevronLeft,
    LuChevronRight,
    LuSlidersHorizontal
} from "react-icons/lu";
import productApi from "../../api/productApi";
import brandApi from "../../api/brandApi";
import categoryApi from "../../api/categoryApi";
import ProductCard from "../../components/product/ProductCard";

function ProductsList() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Data states
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Pagination states
    const [page, setPage] = useState(1);
    const [pageSize] = useState(8);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Filter states
    const querySearch = searchParams.get("search") || "";
    const queryBrand = searchParams.get("brand") || "all";
    const queryCategory = searchParams.get("category") || "all";

    const [searchTerm, setSearchTerm] = useState(querySearch);
    const [selectedBrandSlug, setSelectedBrandSlug] = useState(queryBrand.toLowerCase());
    const [selectedCategorySlug, setSelectedCategorySlug] = useState(queryCategory.toLowerCase());
    const [priceRange, setPriceRange] = useState("all");
    const [sortBy, setSortBy] = useState("default");

    // Load initial metadata (brands & categories)
    useEffect(() => {
        Promise.all([
            brandApi.getAll().catch(() => ({ data: [] })),
            categoryApi.getAll().catch(() => ({ data: [] }))
        ]).then(([brandRes, catRes]) => {
            setBrands(brandRes.data || []);
            setCategories(catRes.data || []);
        });
    }, []);

    // Sync state with URL params
    useEffect(() => {
        if (queryBrand) setSelectedBrandSlug(queryBrand.toLowerCase());
        if (queryCategory) setSelectedCategorySlug(queryCategory.toLowerCase());
        if (querySearch) setSearchTerm(querySearch);
    }, [queryBrand, queryCategory, querySearch]);

    // Main fetch function with server-side pagination & filtering
    const fetchProducts = useCallback(async (currentPage = page) => {
        try {
            setLoading(true);
            setError("");

            // Map brand slug to BrandId if available
            let brandId = null;
            if (selectedBrandSlug !== "all" && brands.length > 0) {
                const foundBrand = brands.find(b => 
                    b.brandName?.toLowerCase().includes(selectedBrandSlug) ||
                    (selectedBrandSlug === "apple" && b.brandName?.toLowerCase().includes("iphone"))
                );
                if (foundBrand) brandId = foundBrand.brandId;
            }

            // Map category slug to CategoryId if available
            let categoryId = null;
            if (selectedCategorySlug !== "all" && categories.length > 0) {
                const foundCat = categories.find(c => 
                    c.categoryName?.toLowerCase().includes(selectedCategorySlug)
                );
                if (foundCat) categoryId = foundCat.categoryId;
            }

            // Map price range
            let minPrice = null;
            let maxPrice = null;
            if (priceRange === "under-10") {
                maxPrice = 10000000;
            } else if (priceRange === "10-20") {
                minPrice = 10000000;
                maxPrice = 20000000;
            } else if (priceRange === "20-30") {
                minPrice = 20000000;
                maxPrice = 30000000;
            } else if (priceRange === "above-30") {
                minPrice = 30000000;
            }

            // Map sort
            let serverSort = "newest";
            if (sortBy === "price-asc") serverSort = "price_asc";
            else if (sortBy === "price-desc") serverSort = "price_desc";
            else if (sortBy === "name-asc") serverSort = "name";
            else if (sortBy === "best-seller") serverSort = "best_seller";

            const queryParams = {
                page: currentPage,
                pageSize,
                keyword: searchTerm.trim() || undefined,
                brandId: brandId || undefined,
                categoryId: categoryId || undefined,
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined,
                sortBy: serverSort
            };

            const response = await productApi.query(queryParams);
            const data = response.data;

            setProducts(data.items || []);
            setTotalItems(data.totalItems || 0);
            setTotalPages(data.totalPages || 1);
            setPage(data.page || 1);
        } catch (err) {
            console.error("Fetch products error:", err);
            setError("Không thể tải danh sách sản phẩm. Vui lòng kiểm tra lại kết nối.");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchTerm, selectedBrandSlug, selectedCategorySlug, priceRange, sortBy, brands, categories]);

    // Refetch when filters change (reset to page 1)
    useEffect(() => {
        setPage(1);
        fetchProducts(1);
    }, [searchTerm, selectedBrandSlug, selectedCategorySlug, priceRange, sortBy]);

    function handlePageChange(newPage) {
        if (newPage < 1 || newPage > totalPages || newPage === page) return;
        setPage(newPage);
        fetchProducts(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleResetFilters() {
        setSelectedBrandSlug("all");
        setSelectedCategorySlug("all");
        setSearchTerm("");
        setPriceRange("all");
        setSortBy("default");
        setSearchParams({});
        setPage(1);
    }

    return (
        <div className="py-3 py-md-4">
            <div className="container">
                {/* PAGE HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h1 className="fw-bold mb-1 font-display fs-3">Điện Thoại Di Động Chính Hãng</h1>
                        <p className="text-muted small mb-0">
                            Khám phá các dòng smartphone cao cấp, bảo hành chính hãng 12 tháng tại PhoneStore
                        </p>
                    </div>
                    <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill tabular-nums">
                        {totalItems} sản phẩm
                    </span>
                </div>

                {/* FILTER TOOLBAR */}
                <div className="card border-0 shadow-sm p-3 mb-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="row g-2 g-md-3 align-items-center">
                        {/* SEARCH INPUT */}
                        <div className="col-12 col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <LuSearch className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Tìm theo tên máy, chip, mã SKU..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                    >
                                        <LuX size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* BRAND SELECT */}
                        <div className="col-6 col-md-2">
                            <select
                                className="form-select form-select-sm"
                                value={selectedBrandSlug}
                                onChange={(e) => setSelectedBrandSlug(e.target.value)}
                            >
                                <option value="all">Tất cả hãng</option>
                                <option value="apple">Apple (iPhone)</option>
                                <option value="samsung">Samsung</option>
                                <option value="xiaomi">Xiaomi</option>
                                <option value="oppo">OPPO</option>
                                <option value="asus">ASUS ROG</option>
                                <option value="vivo">Vivo</option>
                                <option value="realme">Realme</option>
                            </select>
                        </div>

                        {/* CATEGORY SELECT */}
                        <div className="col-6 col-md-2">
                            <select
                                className="form-select form-select-sm"
                                value={selectedCategorySlug}
                                onChange={(e) => setSelectedCategorySlug(e.target.value)}
                            >
                                <option value="all">Tất cả danh mục</option>
                                <option value="flagship">Flagship</option>
                                <option value="cận cao cấp">Cận cao cấp</option>
                                <option value="tầm trung">Tầm trung</option>
                                <option value="giá rẻ">Giá rẻ</option>
                                <option value="gaming">Gaming Phone</option>
                            </select>
                        </div>

                        {/* PRICE RANGE SELECT */}
                        <div className="col-6 col-md-2">
                            <select
                                className="form-select form-select-sm"
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                            >
                                <option value="all">Mức giá: Tất cả</option>
                                <option value="under-10">Dưới 10 triệu</option>
                                <option value="10-20">10 - 20 triệu</option>
                                <option value="20-30">20 - 30 triệu</option>
                                <option value="above-30">Trên 30 triệu</option>
                            </select>
                        </div>

                        {/* SORT SELECT */}
                        <div className="col-6 col-md-2">
                            <select
                                className="form-select form-select-sm"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="default">Sắp xếp: Mặc định</option>
                                <option value="price-asc">Giá: Thấp đến cao</option>
                                <option value="price-desc">Giá: Cao đến thấp</option>
                                <option value="best-seller">Bán chạy nhất</option>
                                <option value="name-asc">Tên: A-Z</option>
                            </select>
                        </div>
                    </div>

                    {/* ACTIVE FILTER TAGS */}
                    {(selectedBrandSlug !== "all" || selectedCategorySlug !== "all" || priceRange !== "all" || searchTerm) && (
                        <div className="d-flex align-items-center gap-2 flex-wrap mt-3 pt-2 border-top">
                            <span className="small text-muted fw-semibold">Đang lọc theo:</span>
                            {selectedBrandSlug !== "all" && (
                                <span className="badge bg-light text-dark border px-2 py-1 d-flex align-items-center gap-1">
                                    Hãng: {selectedBrandSlug.toUpperCase()}
                                    <LuX size={12} role="button" className="text-danger" onClick={() => setSelectedBrandSlug("all")} />
                                </span>
                            )}
                            {selectedCategorySlug !== "all" && (
                                <span className="badge bg-light text-dark border px-2 py-1 d-flex align-items-center gap-1">
                                    Danh mục: {selectedCategorySlug}
                                    <LuX size={12} role="button" className="text-danger" onClick={() => setSelectedCategorySlug("all")} />
                                </span>
                            )}
                            {priceRange !== "all" && (
                                <span className="badge bg-light text-dark border px-2 py-1 d-flex align-items-center gap-1">
                                    Giá: {priceRange}
                                    <LuX size={12} role="button" className="text-danger" onClick={() => setPriceRange("all")} />
                                </span>
                            )}
                            {searchTerm && (
                                <span className="badge bg-light text-dark border px-2 py-1 d-flex align-items-center gap-1">
                                    Từ khóa: "{searchTerm}"
                                    <LuX size={12} role="button" className="text-danger" onClick={() => setSearchTerm("")} />
                                </span>
                            )}
                            <button
                                type="button"
                                className="btn btn-link btn-sm text-danger text-decoration-none p-0 ms-auto d-flex align-items-center gap-1"
                                onClick={handleResetFilters}
                            >
                                <LuRotateCcw size={13} />
                                <span>Xóa bộ lọc</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2 text-muted">Đang tải sản phẩm từ máy chủ...</p>
                    </div>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div className="alert alert-danger text-center my-4">{error}</div>
                )}

                {/* EMPTY */}
                {!loading && !error && products.length === 0 && (
                    <div className="card border-0 shadow-sm text-center py-5 my-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <LuSmartphone size={48} className="text-muted mx-auto mb-3" />
                        <h4 className="fw-bold font-display">Không tìm thấy sản phẩm nào phù hợp</h4>
                        <p className="text-muted small">Hãy thử đổi từ khóa tìm kiếm hoặc điều chỉnh khoảng giá</p>
                        <div>
                            <button className="btn btn-primary rounded-pill px-4" onClick={handleResetFilters}>
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                )}

                {/* PRODUCTS GRID */}
                {!loading && !error && products.length > 0 && (
                    <>
                        <div className="row g-2 g-md-4 mb-4">
                            {products.map((product) => (
                                <div className="col-6 col-md-4 col-lg-3" key={product.productId}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        {/* SERVER-SIDE PAGINATION BAR */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 pt-3 border-top">
                                <span className="small text-muted tabular-nums">
                                    Hiển thị <strong>{((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalItems)}</strong> trên <strong>{totalItems}</strong> máy
                                </span>

                                <div className="d-flex align-items-center gap-1">
                                    <button
                                        type="button"
                                        className="btn btn-light btn-sm rounded-pill px-3 d-flex align-items-center gap-1 border"
                                        disabled={page <= 1}
                                        onClick={() => handlePageChange(page - 1)}
                                    >
                                        <LuChevronLeft size={15} />
                                        <span className="d-none d-sm-inline">Trang trước</span>
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                        // Show first, last, and neighboring pages
                                        if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                            return (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    className={`btn btn-sm rounded-pill tabular-nums fw-bold ${p === page ? "btn-primary px-3" : "btn-light border px-3"}`}
                                                    onClick={() => handlePageChange(p)}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        }
                                        if (p === page - 2 || p === page + 2) {
                                            return <span key={p} className="px-1 text-muted">...</span>;
                                        }
                                        return null;
                                    })}

                                    <button
                                        type="button"
                                        className="btn btn-light btn-sm rounded-pill px-3 d-flex align-items-center gap-1 border"
                                        disabled={page >= totalPages}
                                        onClick={() => handlePageChange(page + 1)}
                                    >
                                        <span className="d-none d-sm-inline">Trang sau</span>
                                        <LuChevronRight size={15} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ProductsList;