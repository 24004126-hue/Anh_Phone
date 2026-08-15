import { useState, useEffect } from "react";
import { LuDownload, LuX, LuSmartphone } from "react-icons/lu";

function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        function handleBeforeInstallPrompt(e) {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt only if not dismissed before
            const dismissed = localStorage.getItem("phonestore_pwa_dismissed");
            if (!dismissed) {
                setShowPrompt(true);
            }
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }, []);

    async function handleInstallClick() {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    }

    function handleDismiss() {
        setShowPrompt(false);
        localStorage.setItem("phonestore_pwa_dismissed", "true");
    }

    if (!showPrompt) return null;

    return (
        <div 
            className="fixed-bottom p-3 z-3 d-flex justify-content-center"
            style={{ pointerEvents: "none", marginBottom: 70 }}
        >
            <div 
                className="card border-0 shadow-lg p-3 rounded-4 bg-dark text-white d-flex flex-row align-items-center justify-content-between gap-3"
                style={{ 
                    maxWidth: 460, 
                    width: "100%", 
                    pointerEvents: "auto", 
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "rgba(15, 23, 42, 0.95)",
                    backdropFilter: "blur(10px)"
                }}
            >
                <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-3 bg-primary text-white d-flex align-items-center justify-content-center">
                        <LuSmartphone size={22} />
                    </div>
                    <div>
                        <div className="fw-bold font-display small">Cài Đặt App PhoneStore</div>
                        <div className="text-white-50" style={{ fontSize: "0.75rem" }}>Trải nghiệm mượt mà, thông báo đơn hàng tức thì</div>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        className="btn btn-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-sm"
                        onClick={handleInstallClick}
                    >
                        <LuDownload size={14} />
                        <span>Cài Đặt</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-link text-white-50 p-0"
                        onClick={handleDismiss}
                    >
                        <LuX size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PwaInstallPrompt;
