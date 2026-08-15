import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    LuSparkles, 
    LuScale, 
    LuSend, 
    LuX, 
    LuArrowRight, 
    LuCheck, 
    LuCpu, 
    LuCamera, 
    LuBattery, 
    LuSmartphone,
    LuBot
} from "react-icons/lu";
import productApi from "../../api/productApi";
import { formatPrice } from "../product/ProductCard";

const ADVISOR_KNOWLEDGE = [
    {
        keywords: ["dưới 10 triệu", "dưới 10tr", "10 triệu", "giá rẻ", "tiết kiệm", "tầm trung"],
        reply: "Với ngân sách dưới 10 triệu, lựa chọn hàng đầu hiện nay là **Xiaomi Redmi Note 13 Pro** (khoảng 6.49 triệu) với camera 200MP, màn hình AMOLED 120Hz và sạc nhanh 67W, hoặc **Samsung Galaxy A55 5G** (khoảng 8.99 triệu) với thiết kế viền kim loại sang trọng và kháng nước IP67.",
        suggestedIds: [6, 4]
    },
    {
        keywords: ["15 triệu", "15tr", "20 triệu", "20tr", "cận cao cấp"],
        reply: "Trong phân khúc 12 - 20 triệu, bạn nên cân nhắc **OPPO Reno12 5G** (11.99 triệu) cực mạnh về AI chân dung và thiết kế siêu mỏng nhẹ, hoặc **iPhone 15 128GB** (18.49 triệu) với Dynamic Island và hiệu năng Apple A16 Bionic mượt mà lâu dài.",
        suggestedIds: [8, 2]
    },
    {
        keywords: ["so sánh", "iphone 16", "s24 ultra", "iphone 16 pro max"],
        reply: "So sánh chi tiết iPhone 16 Pro Max và Galaxy S24 Ultra:\n• iPhone 16 Pro Max: Chip Apple A18 Pro 3nm mạnh nhất, phím Camera Control, viền Titan sa mạc siêu mỏng, quay 4K 120fps Dolby Vision.\n• Galaxy S24 Ultra: Màn hình phẳng chống chói Dynamic AMOLED 2X 2600 nits, bút S-Pen quyền năng, camera 200MP zoom 5x/10x cùng bộ Galaxy AI thông minh.\nCả 2 đều là Flagship hàng đầu hiện nay.",
        suggestedIds: [1, 3]
    },
    {
        keywords: ["gaming", "chơi game", "rog phone", "mượt", "pubg", "genshin"],
        reply: "Nếu bạn ưu tiên chơi game nặng (Genshin, PUBG 120fps), **ASUS ROG Phone 8 Pro** là lựa chọn số 1 với chip Snapdragon 8 Gen 3, tản nhiệt GameCool 8, nút cảm ứng AirTrigger và màn hình 165Hz siêu tốc.",
        suggestedIds: [7]
    },
    {
        keywords: ["chụp ảnh", "camera", "leica", "quay phim", "nhiếp ảnh", "zeiss"],
        reply: "Về nhiếp ảnh di động chuyên nghiệp:\n• Xiaomi 14 Ultra: 4 ống kính 50MP hợp tác cùng Leica, cảm biến 1 inch khẩu độ biến thiên.\n• iPhone 16 Pro Max: Camera 48MP Fusion 2x, quay video log 4K 120fps chuẩn Hollywood.\n• Galaxy S24 Ultra: Camera 200MP chi tiết vượt trội và zoom xa ấn tượng.",
        suggestedIds: [5, 1]
    }
];

function AIAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("advisor"); // "advisor" or "compare"
    const [allProducts, setAllProducts] = useState([]);
    
    // Compare states
    const [compareIdA, setCompareIdA] = useState(1);
    const [compareIdB, setCompareIdB] = useState(3);

    // Chat states
    const [messages, setMessages] = useState([
        {
            id: "msg-0",
            sender: "bot",
            text: "Xin chào! Tôi là Trợ Lý Công Nghệ của PhoneStore. Bạn cần tư vấn chọn máy theo ngân sách hay so sánh cấu hình điện thoại?",
            suggestions: [
                "Tư vấn điện thoại dưới 10 triệu",
                "Tư vấn phân khúc 15 - 20 triệu",
                "So sánh iPhone 16 Pro Max & S24 Ultra",
                "Điện thoại gaming mạnh nhất",
                "Điện thoại chụp ảnh Leica / Zeiss đẹp nhất"
            ]
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        productApi.getAll()
            .then(res => setAllProducts(res.data || []))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (isOpen && activeTab === "advisor") {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen, isTyping, activeTab]);

    const productA = allProducts.find(p => p.productId === Number(compareIdA)) || allProducts[0];
    const productB = allProducts.find(p => p.productId === Number(compareIdB)) || allProducts[1] || allProducts[0];

    function handleSend(queryText) {
        const text = (queryText || input).trim();
        if (!text) return;

        const userMsg = {
            id: `msg-${Date.now()}`,
            sender: "user",
            text: text
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            const lower = text.toLowerCase();
            let match = ADVISOR_KNOWLEDGE.find((k) =>
                k.keywords.some((kw) => lower.includes(kw))
            );

            let matchedProducts = [];
            if (match && match.suggestedIds) {
                matchedProducts = allProducts.filter(p => match.suggestedIds.includes(p.productId));
            } else {
                matchedProducts = allProducts.slice(0, 2);
            }

            const botMsg = {
                id: `msg-${Date.now() + 1}`,
                sender: "bot",
                text: match ? match.reply : `Cảm ơn bạn đã hỏi về "${text}". Tại PhoneStore hiện đang có đầy đủ các dòng iPhone, Samsung Galaxy, Xiaomi, ASUS ROG và OPPO chính hãng. Bạn có thể cho tôi biết thêm mức ngân sách mong muốn?`,
                products: matchedProducts
            };

            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 500);
    }

    return (
        <div className="tech-concierge-fab">
            {/* FLOATING ACTION BUTTON */}
            {!isOpen && (
                <button
                    type="button"
                    className="concierge-trigger-btn"
                    onClick={() => setIsOpen(true)}
                >
                    <LuSparkles size={18} className="text-primary" />
                    <span>Trợ Lý & So Sánh Máy</span>
                </button>
            )}

            {/* DRAWER WINDOW */}
            {isOpen && (
                <div className="concierge-drawer">
                    {/* DRAWER HEADER */}
                    <div className="concierge-header">
                        <div className="d-flex align-items-center gap-2">
                            <div className="p-2 rounded-3 bg-primary text-white d-flex align-items-center justify-content-center">
                                <LuSparkles size={18} />
                            </div>
                            <div>
                                <div className="fw-bold fs-6">PhoneStore Tech Advisor</div>
                                <small className="text-white-50" style={{ fontSize: "0.75rem" }}>Tư vấn & So sánh cấu hình</small>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-link text-white p-1 text-decoration-none"
                            onClick={() => setIsOpen(false)}
                        >
                            <LuX size={20} />
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="d-flex border-bottom bg-white">
                        <button
                            className={`btn flex-grow-1 rounded-0 py-2 small fw-bold d-flex align-items-center justify-content-center gap-2 ${activeTab === "advisor" ? "border-bottom border-3 border-primary text-primary" : "text-muted"}`}
                            onClick={() => setActiveTab("advisor")}
                        >
                            <LuBot size={16} />
                            <span>Tư Vấn Nhanh</span>
                        </button>
                        <button
                            className={`btn flex-grow-1 rounded-0 py-2 small fw-bold d-flex align-items-center justify-content-center gap-2 ${activeTab === "compare" ? "border-bottom border-3 border-primary text-primary" : "text-muted"}`}
                            onClick={() => setActiveTab("compare")}
                        >
                            <LuScale size={16} />
                            <span>So Sánh 2 Máy</span>
                        </button>
                    </div>

                    {/* TAB CONTENT: ADVISOR CHAT */}
                    {activeTab === "advisor" && (
                        <>
                            <div className="concierge-body">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`d-flex flex-column ${msg.sender === "user" ? "align-items-end" : "align-items-start"}`}>
                                        <div className={`p-3 rounded-4 small ${msg.sender === "user" ? "bg-primary text-white" : "bg-white text-dark border"}`} style={{ maxWidth: "88%", lineHeight: 1.5 }}>
                                            <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>

                                            {/* SUGGESTED PRODUCTS */}
                                            {msg.products && msg.products.length > 0 && (
                                                <div className="mt-3 pt-2 border-top d-flex flex-column gap-2">
                                                    <div className="small fw-bold text-primary">Sản phẩm gợi ý:</div>
                                                    {msg.products.map((p) => (
                                                        <div key={p.productId} className="p-2 bg-light rounded-3 border d-flex align-items-center justify-content-between gap-2">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <img
                                                                    src={p.thumbnail || "/images/products/iphone-16-pro-max.jpg"}
                                                                    alt={p.productName}
                                                                    style={{ width: 36, height: 36, objectFit: "contain" }}
                                                                    onError={(e) => { e.target.src = "https://placehold.co/40x40?text=Phone"; }}
                                                                />
                                                                <div>
                                                                    <div className="fw-bold text-truncate" style={{ maxWidth: 160, fontSize: "0.8rem" }}>{p.productName}</div>
                                                                    <div className="text-danger fw-bold tabular-nums" style={{ fontSize: "0.78rem" }}>
                                                                        {formatPrice(p.discountPrice || p.price)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Link
                                                                to={`/product/${p.productId}`}
                                                                className="btn btn-sm btn-outline-primary py-1 px-2 small"
                                                                onClick={() => setIsOpen(false)}
                                                            >
                                                                Xem
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* SUGGESTION CHIPS */}
                                            {msg.suggestions && (
                                                <div className="d-flex flex-wrap gap-1 mt-3">
                                                    {msg.suggestions.map((s, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            className="btn btn-sm btn-light border text-primary small py-1 px-2 text-start rounded-pill"
                                                            style={{ fontSize: "0.75rem" }}
                                                            onClick={() => handleSend(s)}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="small text-muted p-2 bg-white rounded-3 border align-self-start">
                                        Đang tổng hợp thông tin...
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form
                                className="p-3 bg-white border-top d-flex gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                            >
                                <input
                                    type="text"
                                    className="form-control form-control-sm rounded-pill"
                                    placeholder="Hỏi về giá, camera, chip, nhu cầu..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm rounded-pill px-3"
                                    disabled={!input.trim()}
                                >
                                    <LuSend size={14} />
                                </button>
                            </form>
                        </>
                    )}

                    {/* TAB CONTENT: SPEC COMPARISON */}
                    {activeTab === "compare" && (
                        <div className="concierge-body">
                            <div className="p-3 bg-white rounded-4 border">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 font-display">
                                    <LuScale size={16} className="text-primary" />
                                    <span>Chọn 2 Máy Để So Sánh Trực Quan</span>
                                </h6>

                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <label className="small text-muted fw-semibold mb-1">Máy 1:</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={compareIdA}
                                            onChange={(e) => setCompareIdA(Number(e.target.value))}
                                        >
                                            {allProducts.map(p => (
                                                <option key={p.productId} value={p.productId}>{p.productName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="small text-muted fw-semibold mb-1">Máy 2:</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={compareIdB}
                                            onChange={(e) => setCompareIdB(Number(e.target.value))}
                                        >
                                            {allProducts.map(p => (
                                                <option key={p.productId} value={p.productId}>{p.productName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {productA && productB && (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm align-middle small mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: "30%" }}>Thông số</th>
                                                    <th>{productA.productName}</th>
                                                    <th>{productB.productName}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="fw-semibold text-muted">Giá bán</td>
                                                    <td className="text-danger fw-bold tabular-nums">{formatPrice(productA.discountPrice || productA.price)}</td>
                                                    <td className="text-danger fw-bold tabular-nums">{formatPrice(productB.discountPrice || productB.price)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-semibold text-muted"><LuCpu size={12} className="me-1" /> Chip</td>
                                                    <td>{productA.chip || "N/A"}</td>
                                                    <td>{productB.chip || "N/A"}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-semibold text-muted">RAM / ROM</td>
                                                    <td>{productA.ram} / {productA.storage}</td>
                                                    <td>{productB.ram} / {productB.storage}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-semibold text-muted"><LuCamera size={12} className="me-1" /> Camera</td>
                                                    <td>{productA.rearCamera || "N/A"}</td>
                                                    <td>{productB.rearCamera || "N/A"}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-semibold text-muted"><LuBattery size={12} className="me-1" /> Pin & Sạc</td>
                                                    <td>{productA.battery || "N/A"}</td>
                                                    <td>{productB.battery || "N/A"}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-semibold text-muted">Màn hình</td>
                                                    <td>{productA.screen || "N/A"}</td>
                                                    <td>{productB.screen || "N/A"}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AIAssistantWidget;
