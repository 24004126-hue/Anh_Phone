import { LuSmartphone } from "react-icons/lu";

function LoadingFallback({ text = "Đang tải trang..." }) {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-50" style={{ minHeight: "50vh" }}>
            <div className="position-relative mb-3">
                <div 
                    className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white shadow-sm"
                    style={{ width: 56, height: 56, animation: "pulse 1.8s infinite ease-in-out" }}
                >
                    <LuSmartphone size={26} />
                </div>
            </div>
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <span className="text-muted small fw-semibold font-display">{text}</span>
        </div>
    );
}

export default LoadingFallback;
