import { useState, useRef } from "react";
import { LuSparkles } from "react-icons/lu";

const FLAGSHIP_COLORS = [
    {
        id: "desert",
        name: "Titan Sa Mạc (Desert)",
        hex: "#C5A880",
        glowColor: "rgba(197, 168, 128, 0.65)",
        secondaryGlow: "rgba(217, 119, 6, 0.35)",
        image: "/images/hero/iphone16-desert.png",
        badgeColor: "#fbbf24"
    },
    {
        id: "natural",
        name: "Titan Tự Nhiên (Natural)",
        hex: "#9E9E9C",
        glowColor: "rgba(158, 158, 156, 0.65)",
        secondaryGlow: "rgba(56, 189, 248, 0.35)",
        image: "/images/hero/iphone16-natural.png",
        badgeColor: "#38bdf8"
    },
    {
        id: "black",
        name: "Titan Đen (Black)",
        hex: "#2B2C2E",
        glowColor: "rgba(37, 99, 235, 0.6)",
        secondaryGlow: "rgba(99, 102, 241, 0.35)",
        image: "/images/hero/iphone16-black.png",
        badgeColor: "#60a5fa"
    },
    {
        id: "white",
        name: "Titan Trắng (White)",
        hex: "#E2E4E5",
        glowColor: "rgba(255, 255, 255, 0.55)",
        secondaryGlow: "rgba(14, 165, 233, 0.35)",
        image: "/images/hero/iphone16-white.png",
        badgeColor: "#e2e8f0"
    }
];

function Hero3DPhoneShowcase() {
    const [selectedColor, setSelectedColor] = useState(FLAGSHIP_COLORS[0]);
    const [isSwitching, setIsSwitching] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });
    const cardRef = useRef(null);

    function handleMouseMove(e) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = -((y - centerY) / centerY) * 14;
        const rotateY = ((x - centerX) / centerX) * 14;

        setTilt({ x: rotateX, y: rotateY, active: true });
    }

    function handleMouseLeave() {
        setTilt({ x: 0, y: 0, active: false });
    }

    function handleColorChange(c) {
        if (c.id === selectedColor.id) return;
        setIsSwitching(true);
        setSelectedColor(c);
        setTimeout(() => setIsSwitching(false), 350);
    }

    return (
        <div 
            className="hero-3d-showcase-wrap position-relative d-flex flex-column align-items-center justify-content-center w-100 py-3"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1200 }}
        >
            {/* =========================================================================
                1. MULTI-LAYER AURORA GLOW (MATCHES ACTIVE COLOR)
            ========================================================================= */}
            <div 
                className="hero-aurora-glow position-absolute"
                style={{
                    width: 380,
                    height: 380,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${selectedColor.glowColor} 0%, ${selectedColor.secondaryGlow} 45%, transparent 70%)`,
                    filter: "blur(50px)",
                    transform: `translate(-50%, -50%) scale(${tilt.active ? 1.15 : 1})`,
                    top: "44%",
                    left: "50%",
                    zIndex: 1,
                    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    pointerEvents: "none"
                }}
            />

            {/* CYBER ROTATING RING */}
            <div 
                className="hero-cyber-ring position-absolute"
                style={{
                    width: 430,
                    height: 430,
                    borderRadius: "50%",
                    border: "1.5px dashed rgba(255, 255, 255, 0.12)",
                    top: "44%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                    pointerEvents: "none",
                    animation: "spinSlow 30s linear infinite"
                }}
            />

            {/* =========================================================================
                2. 3D FLOATING DEVICE CONTAINER WITH DEEP MOUSE PARALLAX
            ========================================================================= */}
            <div 
                className="hero-phone-stage position-relative text-center d-flex align-items-center justify-content-center"
                style={{
                    zIndex: 3,
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.active ? 1.05 : 1})`,
                    transition: tilt.active ? "transform 0.08s ease-out" : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    transformStyle: "preserve-3d",
                    cursor: "pointer"
                }}
            >
                {/* FLOATING BREATH CONTAINER */}
                <div className="hero-floating-breath position-relative d-inline-block">
                    <img
                        key={selectedColor.id}
                        src={selectedColor.image}
                        alt={`iPhone 16 Pro Max ${selectedColor.name}`}
                        className={`hero-phone-img ${isSwitching ? "phone-switching" : ""}`}
                        style={{ 
                            height: 390,
                            maxHeight: "56vh",
                            width: "auto",
                            objectFit: "contain",
                            filter: `drop-shadow(0 25px 35px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 30px ${selectedColor.glowColor})`,
                            transform: "translateZ(35px)",
                            transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)"
                        }}
                        onError={(e) => { e.target.src = "https://placehold.co/500x500?text=Flagship+Phone"; }}
                    />

                    {/* DYNAMIC LIGHT SHEEN REFLECTION OVERLAY */}
                    <div 
                        className="hero-sheen-overlay position-absolute"
                        style={{
                            inset: 0,
                            background: `linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.3) 45%, transparent 70%)`,
                            opacity: tilt.active ? 0.9 : 0.2,
                            transform: `translateX(${tilt.y * 8}px) translateZ(45px)`,
                            transition: "opacity 0.25s ease, transform 0.1s ease-out",
                            pointerEvents: "none",
                            borderRadius: 36
                        }}
                    />
                </div>
            </div>

            {/* =========================================================================
                3. DUAL FLOOR PEDESTAL REFLECTION LIGHT
            ========================================================================= */}
            <div 
                className="hero-floor-light position-relative"
                style={{
                    width: 330,
                    height: 24,
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse, ${selectedColor.glowColor} 0%, ${selectedColor.secondaryGlow} 40%, transparent 75%)`,
                    filter: "blur(8px)",
                    marginTop: -10,
                    zIndex: 2,
                    transition: "all 0.6s ease"
                }}
            />

            {/* =========================================================================
                4. INTERACTIVE TITANIUM COLOR SELECTOR BAR
            ========================================================================= */}
            <div className="mt-4 p-2 px-3 rounded-pill bg-dark bg-opacity-80 border border-white border-opacity-20 backdrop-blur d-flex align-items-center gap-3 z-3 shadow-lg">
                <div className="d-flex align-items-center gap-2">
                    <span 
                        className="rounded-circle d-inline-block" 
                        style={{ width: 8, height: 8, background: selectedColor.badgeColor, boxShadow: `0 0 8px ${selectedColor.badgeColor}` }}
                    />
                    <span className="text-white-50 fw-semibold" style={{ fontSize: "0.78rem" }}>
                        Màu: <strong className="text-white">{selectedColor.name}</strong>
                    </span>
                </div>

                <div className="vr bg-white opacity-25" style={{ height: 18 }} />

                <div className="d-flex align-items-center gap-2 pe-1">
                    {FLAGSHIP_COLORS.map((c) => {
                        const isSelected = selectedColor.id === c.id;
                        return (
                            <button
                                key={c.id}
                                type="button"
                                className="btn p-0 rounded-circle border-0 d-flex align-items-center justify-content-center position-relative"
                                style={{
                                    width: 26,
                                    height: 26,
                                    background: c.hex,
                                    boxShadow: isSelected 
                                        ? `0 0 0 2.5px #ffffff, 0 0 16px ${c.glowColor}` 
                                        : "0 0 0 1px rgba(255,255,255,0.25)",
                                    transform: isSelected ? "scale(1.22)" : "scale(1)",
                                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                    cursor: "pointer"
                                }}
                                onClick={() => handleColorChange(c)}
                                title={`Đổi sang ${c.name}`}
                            >
                                {isSelected && (
                                    <span 
                                        className="position-absolute rounded-circle"
                                        style={{ 
                                            inset: -4, 
                                            border: `1.5px solid ${c.badgeColor}`, 
                                            animation: "spinSlow 6s linear infinite" 
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Hero3DPhoneShowcase;
