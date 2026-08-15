import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import ProductCard from "../../components/product/ProductCard";
import { LuHeart, LuRotateCcw, LuSmartphone } from "react-icons/lu";

function Wishlist() {
    const { wishlist, wishlistCount, clearWishlist } = useWishlist();

    return (
        <div className="py-4">
            <div className="container">
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h1 className="fw-bold fs-3 mb-1 font-display d-flex align-items-center gap-2">
                            <LuHeart className="text-danger" fill="#ef4444" />
                            <span>Danh Sách Sản Phẩm Yêu Thích</span>
                        </h1>
                        <p className="text-muted small mb-0">
                            Các dòng smartphone bạn quan tâm và lưu lại để theo dõi biến động giá
                        </p>
                    </div>

                    {wishlistCount > 0 && (
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 fs-6 rounded-pill tabular-nums">
                                {wishlistCount} máy đã lưu
                            </span>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                                onClick={clearWishlist}
                            >
                                <LuRotateCcw size={13} />
                                <span>Xóa tất cả</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* EMPTY STATE */}
                {wishlistCount === 0 && (
                    <div className="card border-0 shadow-sm p-5 text-center my-4 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                        <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle d-inline-block mx-auto mb-3">
                            <LuHeart size={40} />
                        </div>
                        <h3 className="fw-bold font-display">Danh sách yêu thích đang trống</h3>
                        <p className="text-muted small">
                            Hãy bấm vào biểu tượng trái tim trên các mẫu điện thoại bạn thích để lưu lại và xem lại bất kỳ lúc nào.
                        </p>
                        <div>
                            <Link to="/products" className="btn btn-primary rounded-pill px-4 mt-2">
                                ← Khám phá sản phẩm ngay
                            </Link>
                        </div>
                    </div>
                )}

                {/* PRODUCTS GRID */}
                {wishlistCount > 0 && (
                    <div className="row g-2 g-md-4">
                        {wishlist.map((product) => (
                            <div className="col-6 col-md-4 col-lg-3" key={product.productId}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Wishlist;
