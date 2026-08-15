import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
    LuStar, 
    LuThumbsUp, 
    LuBadgeCheck, 
    LuPenLine, 
    LuMessageSquare,
    LuStore,
    LuSparkles,
    LuFilter
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_SAMPLE_REVIEWS = [
    {
        id: "rev-1",
        userName: "Trần Minh Quân",
        rating: 5,
        date: "10/08/2026",
        comment: "Máy dùng cực kỳ mượt mà, màn hình 120Hz siêu nét. Camera chụp đêm xuất sắc ngoài mong đợi. Đóng gói rất cẩn thận và giao nhanh chỉ sau 2 tiếng!",
        tags: ["Chụp ảnh đẹp", "Màn hình nét", "Giao hàng hỏa tốc"],
        likes: 24,
        storeReply: "Cảm ơn anh Quân đã tin tưởng mua sắm tại PhoneStore! Chúc anh có những trải nghiệm tuyệt vời với máy."
    },
    {
        id: "rev-2",
        userName: "Nguyễn Thu Hà",
        rating: 5,
        date: "04/08/2026",
        comment: "Màu sắc ở ngoài đẹp hơn trong hình nhiều. Pin trâu on-screen cả ngày không hết, sạc nhanh tầm 30 phút là đầy. Nhân viên tư vấn rất nhiệt tình.",
        tags: ["Pin cực trâu", "Thiết kế sang trọng"],
        likes: 18,
        storeReply: null
    },
    {
        id: "rev-3",
        userName: "Lê Hoàng Nam",
        rating: 4,
        date: "28/07/2026",
        comment: "Hiệu năng chơi Genshin Impact với PUBG max setting vẫn rất mát, không bị drop fps. Điểm trừ nhẹ là máy hơi đầm tay nhưng bù lại cầm rất chắc chắn.",
        tags: ["Cấu hình khủng", "Chơi game mượt"],
        likes: 9,
        storeReply: null
    }
];

function ProductReviews({ productId, productName }) {
    const { user, isAuthenticated } = useAuth();
    const storageKey = `reviews_product_${productId}`;

    const [reviews, setReviews] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error(e);
            }
        }
        return DEFAULT_SAMPLE_REVIEWS;
    });

    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewerName, setReviewerName] = useState(user?.fullName || "");
    const [selectedTag, setSelectedTag] = useState("");
    const [filterStar, setFilterStar] = useState(0); // 0 = all

    const suggestedTags = [
        "Chụp ảnh siêu nét",
        "Pin cực trâu",
        "Màn hình 120Hz đỉnh",
        "Chơi game mượt",
        "Thiết kế sang trọng",
        "Giao hàng hỏa tốc"
    ];

    useEffect(() => {
        if (user?.fullName && !reviewerName) {
            setReviewerName(user.fullName);
        }
    }, [user]);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "5.0";

    const ratingCounts = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
        return { star, count, percent };
    });

    const filteredReviews = filterStar === 0
        ? reviews
        : reviews.filter(r => r.rating === filterStar);

    function handleSubmitReview(e) {
        e.preventDefault();
        if (!comment.trim()) {
            toast.warn("Vui lòng nhập nội dung đánh giá.");
            return;
        }

        const newReview = {
            id: `rev-${Date.now()}`,
            userName: reviewerName.trim() || user?.fullName || "Khách hàng ẩn danh",
            rating: rating,
            date: new Date().toLocaleDateString("vi-VN"),
            comment: comment.trim(),
            tags: selectedTag ? [selectedTag] : ["Sản phẩm chính hãng"],
            likes: 0,
            storeReply: null
        };

        const updated = [newReview, ...reviews];
        setReviews(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));

        toast.success("Cảm ơn bạn đã gửi đánh giá cho sản phẩm! 🎉");
        setComment("");
        setSelectedTag("");
        setShowForm(false);
    }

    function handleLike(id) {
        const updated = reviews.map(r => {
            if (r.id === id) {
                return { ...r, likes: (r.likes || 0) + 1 };
            }
            return r;
        });
        setReviews(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    return (
        <div className="card border-0 shadow-sm p-4 rounded-4 mt-5" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h4 className="fw-bold mb-1 font-display">Đánh Giá & Nhận Xét Từ Khách Hàng</h4>
                    <p className="text-muted small mb-0">Nhận xét thực tế từ người dùng đã trải nghiệm {productName}</p>
                </div>
                <button
                    className="btn btn-primary px-4 py-2 fw-bold rounded-pill d-flex align-items-center gap-2"
                    onClick={() => setShowForm(!showForm)}
                >
                    <LuPenLine size={16} />
                    <span>{showForm ? "Đóng Form" : "Viết Đánh Giá"}</span>
                </button>
            </div>

            {/* SCORE BREAKDOWN */}
            <div className="row g-4 mb-4 align-items-center">
                <div className="col-12 col-md-4">
                    <div className="p-4 rounded-4 text-center" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div className="display-4 fw-bold text-primary font-display tabular-nums mb-1">{averageRating}</div>
                        <div className="d-flex justify-content-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <LuStar
                                    key={s}
                                    size={20}
                                    className={Math.round(Number(averageRating)) >= s ? "text-warning fill-warning" : "text-muted opacity-25"}
                                    style={{ fill: Math.round(Number(averageRating)) >= s ? "#f59e0b" : "transparent" }}
                                />
                            ))}
                        </div>
                        <div className="text-muted small fw-semibold">
                            {reviews.length} lượt đánh giá thực tế
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-8">
                    <div className="d-flex flex-column gap-2">
                        {ratingCounts.map(({ star, count, percent }) => (
                            <div key={star} className="d-flex align-items-center gap-3">
                                <span className="small fw-bold text-nowrap d-flex align-items-center gap-1" style={{ width: 45 }}>
                                    {star} <LuStar size={12} className="text-warning" />
                                </span>
                                <div className="progress flex-grow-1" style={{ height: 8, borderRadius: 8, background: "#f1f5f9" }}>
                                    <div
                                        className="progress-bar bg-warning"
                                        role="progressbar"
                                        style={{ width: `${percent}%` }}
                                        aria-valuenow={percent}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    ></div>
                                </div>
                                <span className="small text-muted text-end tabular-nums" style={{ width: 45 }}>
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* REVIEW SUBMISSION FORM */}
            {showForm && (
                <div className="p-4 rounded-4 mb-4 border shadow-sm" style={{ background: "#f8fafc", border: "1px solid #0284c7" }}>
                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <LuPenLine size={18} className="text-primary" />
                        <span>Viết Đánh Giá Sản Phẩm</span>
                    </h5>
                    <form onSubmit={handleSubmitReview}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Chọn mức độ hài lòng:</label>
                            <div className="d-flex gap-2 align-items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <LuStar
                                        key={star}
                                        size={28}
                                        style={{
                                            cursor: "pointer",
                                            fill: (hoverRating || rating) >= star ? "#f59e0b" : "transparent",
                                            color: (hoverRating || rating) >= star ? "#f59e0b" : "#cbd5e1"
                                        }}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                                <span className="small text-muted ms-2 fw-semibold">
                                    {rating === 5 ? "⭐⭐⭐⭐⭐ Rất hài lòng" : rating === 4 ? "⭐⭐⭐⭐ Hài lòng" : rating === 3 ? "⭐⭐⭐ Bình thường" : rating === 2 ? "⭐⭐ Chưa tốt" : "⭐ Rất thất vọng"}
                                </span>
                            </div>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold small">Họ và tên của bạn</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nguyễn Văn A"
                                    required
                                    value={reviewerName}
                                    onChange={(e) => setReviewerName(e.target.value)}
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold small">Điểm nổi bật bạn yêu thích</label>
                                <select
                                    className="form-select"
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                >
                                    <option value="">-- Chọn điểm nổi bật --</option>
                                    {suggestedTags.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Nhận xét chi tiết</label>
                            <textarea
                                rows="3"
                                className="form-control"
                                placeholder="Hãy chia sẻ trải nghiệm về hiệu năng, camera, thời lượng pin, độ hoàn thiện của máy..."
                                required
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        <div className="d-flex gap-2 justify-content-end">
                            <button
                                type="button"
                                className="btn btn-outline-secondary rounded-pill px-3"
                                onClick={() => setShowForm(false)}
                            >
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">
                                Gửi Đánh Giá Ngay
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* FILTER REVIEWS BY STARS */}
            <div className="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom flex-wrap">
                <span className="small text-muted fw-semibold d-flex align-items-center gap-1 me-2">
                    <LuFilter size={14} /> Lọc theo:
                </span>
                <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 ${filterStar === 0 ? "btn-primary" : "btn-light border"}`}
                    onClick={() => setFilterStar(0)}
                >
                    Tất cả ({reviews.length})
                </button>
                {[5, 4, 3, 2, 1].map((s) => {
                    const count = reviews.filter(r => r.rating === s).length;
                    return (
                        <button
                            key={s}
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1 ${filterStar === s ? "btn-primary" : "btn-light border"}`}
                            onClick={() => setFilterStar(s)}
                        >
                            <span>{s}</span>
                            <LuStar size={11} className={filterStar === s ? "text-white" : "text-warning"} fill={filterStar === s ? "#fff" : "#f59e0b"} />
                            <span className="opacity-75">({count})</span>
                        </button>
                    );
                })}
            </div>

            {/* REVIEWS LIST */}
            <div className="d-flex flex-column gap-3">
                {filteredReviews.length === 0 ? (
                    <div className="p-4 text-center text-muted small">
                        Chưa có đánh giá nào cho bộ lọc {filterStar} sao này.
                    </div>
                ) : (
                    filteredReviews.map((rev) => (
                        <div key={rev.id} className="p-3 rounded-3 border-bottom">
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="user-avatar" style={{ width: 38, height: 38, fontSize: "0.9rem" }}>
                                        {rev.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="fw-bold">{rev.userName}</div>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="d-flex gap-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <LuStar
                                                        key={s}
                                                        size={13}
                                                        style={{
                                                            fill: rev.rating >= s ? "#f59e0b" : "transparent",
                                                            color: rev.rating >= s ? "#f59e0b" : "#cbd5e1"
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill d-flex align-items-center gap-1" style={{ fontSize: "0.72rem" }}>
                                                <LuBadgeCheck size={13} /> Đã mua hàng tại PhoneStore
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <small className="text-muted tabular-nums">
                                    {rev.date}
                                </small>
                            </div>

                            <p className="mb-2 text-secondary small" style={{ lineHeight: 1.6 }}>
                                {rev.comment}
                            </p>

                            {rev.tags?.length > 0 && (
                                <div className="d-flex gap-2 flex-wrap mb-2">
                                    {rev.tags.map((t, idx) => (
                                        <span key={idx} className="badge bg-light text-primary border border-primary border-opacity-25 rounded-pill px-2 py-1 small">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="d-flex align-items-center gap-3 mt-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-3 d-flex align-items-center gap-1"
                                    style={{ fontSize: "0.78rem" }}
                                    onClick={() => handleLike(rev.id)}
                                >
                                    <LuThumbsUp size={12} />
                                    <span>Hữu ích ({rev.likes || 0})</span>
                                </button>
                            </div>

                            {rev.storeReply && (
                                <div className="mt-3 p-3 bg-light rounded-3 border-start border-3 border-primary">
                                    <div className="fw-bold text-primary small mb-1 d-flex align-items-center gap-1">
                                        <LuStore size={14} /> Phản hồi từ PhoneStore Official:
                                    </div>
                                    <div className="small text-muted">
                                        {rev.storeReply}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ProductReviews;
