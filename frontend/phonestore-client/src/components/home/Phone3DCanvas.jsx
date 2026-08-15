import { useEffect, useRef } from "react";
import * as THREE from "three";

function createPhoneGeometry() {
    const group = new THREE.Group();

    // Dimensions for modern flagship (width: 7.7, height: 16.0, depth: 0.82)
    const w = 3.6;
    const h = 7.4;
    const d = 0.38;
    const r = 0.45;

    // Helper: Rounded Box Shape
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

    const extrudeSettings = {
        depth: d,
        bevelEnabled: true,
        bevelSegments: 8,
        steps: 1,
        bevelSize: 0.08,
        bevelThickness: 0.08
    };

    const bodyGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeo.center();

    // 1. Titanium Frame Material
    const frameMat = new THREE.MeshStandardMaterial({
        color: 0xC5A880,
        metalness: 0.92,
        roughness: 0.28
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, frameMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    // 2. Back Glass Panel (Matte AG Glass)
    const backGeo = new THREE.PlaneGeometry(w * 0.94, h * 0.94);
    const backMat = new THREE.MeshStandardMaterial({
        color: 0xC5A880,
        metalness: 0.4,
        roughness: 0.45
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = -d / 2 - 0.085;
    backMesh.rotation.y = Math.PI;
    group.add(backMesh);

    // 2.1 Apple Logo on Back
    const logoCanvas = document.createElement("canvas");
    logoCanvas.width = 128;
    logoCanvas.height = 128;
    const lctx = logoCanvas.getContext("2d");
    lctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    lctx.beginPath();
    lctx.arc(64, 68, 22, 0, Math.PI * 2);
    lctx.fill();
    lctx.beginPath();
    lctx.arc(64, 38, 14, 0, Math.PI * 2);
    lctx.fill();
    const logoTex = new THREE.CanvasTexture(logoCanvas);
    const logoGeo = new THREE.PlaneGeometry(0.7, 0.7);
    const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, opacity: 0.5 });
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.position.set(0, 0.2, -d / 2 - 0.09);
    logoMesh.rotation.y = Math.PI;
    group.add(logoMesh);

    // 3. Camera Island (Top Left on back)
    const camIslandShape = new THREE.Shape();
    const cw = 1.7;
    const ch = 1.7;
    const cr = 0.35;
    camIslandShape.moveTo(-cw / 2 + cr, -ch / 2);
    camIslandShape.lineTo(cw / 2 - cr, -ch / 2);
    camIslandShape.quadraticCurveTo(cw / 2, -ch / 2, cw / 2, -ch / 2 + cr);
    camIslandShape.lineTo(cw / 2, ch / 2 - cr);
    camIslandShape.quadraticCurveTo(cw / 2, ch / 2, cw / 2 - cr, ch / 2);
    camIslandShape.lineTo(-cw / 2 + cr, ch / 2);
    camIslandShape.quadraticCurveTo(-cw / 2, ch / 2, -cw / 2, ch / 2 - cr);
    camIslandShape.lineTo(-cw / 2, -ch / 2 + cr);
    camIslandShape.quadraticCurveTo(-cw / 2, -ch / 2, -cw / 2 + cr, -ch / 2);

    const camIslandExtrude = { depth: 0.12, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.04, bevelThickness: 0.04 };
    const camIslandGeo = new THREE.ExtrudeGeometry(camIslandShape, camIslandExtrude);
    const camIslandMat = new THREE.MeshStandardMaterial({
        color: 0xC5A880,
        metalness: 0.75,
        roughness: 0.35
    });
    const camIslandMesh = new THREE.Mesh(camIslandGeo, camIslandMat);
    camIslandMesh.position.set(w / 2 - cw / 2 - 0.25, h / 2 - ch / 2 - 0.3, -d / 2 - 0.1);
    camIslandMesh.rotation.y = Math.PI;
    group.add(camIslandMesh);

    // 3.1 Three Camera Lenses
    const lensRingMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.95, roughness: 0.15 });
    const lensGlassMat = new THREE.MeshStandardMaterial({ color: 0x050b14, metalness: 0.9, roughness: 0.05, envMapIntensity: 2 });

    const lensPositions = [
        [w / 2 - 0.6, h / 2 - 0.65],
        [w / 2 - 0.6, h / 2 - 1.65],
        [w / 2 - 1.45, h / 2 - 1.15]
    ];

    lensPositions.forEach(([lx, ly]) => {
        const ringGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.14, 32);
        const ringMesh = new THREE.Mesh(ringGeo, lensRingMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.set(lx, ly, -d / 2 - 0.25);
        group.add(ringMesh);

        const glassGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.15, 32);
        const glassMesh = new THREE.Mesh(glassGeo, lensGlassMat);
        glassMesh.rotation.x = Math.PI / 2;
        glassMesh.position.set(lx, ly, -d / 2 - 0.26);
        group.add(glassMesh);

        // Pupil reflection dot
        const pupilGeo = new THREE.CircleGeometry(0.12, 16);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1d4ed8 });
        const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
        pupilMesh.rotation.y = Math.PI;
        pupilMesh.position.set(lx, ly, -d / 2 - 0.34);
        group.add(pupilMesh);
    });

    // 4. Front Screen (OLED with Wallpaper + Dynamic Island)
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 512;
    screenCanvas.height = 1024;
    const ctx = screenCanvas.getContext("2d");

    // Luxury Modern Tech Wallpaper
    const grad = ctx.createLinearGradient(0, 0, 512, 1024);
    grad.addColorStop(0, "#090d16");
    grad.addColorStop(0.3, "#0f172a");
    grad.addColorStop(0.7, "#1e1b4b");
    grad.addColorStop(1, "#0284c7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    // Glowing Sphere on screen
    const radialGrad = ctx.createRadialGradient(256, 480, 20, 256, 480, 220);
    radialGrad.addColorStop(0, "rgba(56, 189, 248, 0.85)");
    radialGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.4)");
    radialGrad.addColorStop(1, "transparent");
    ctx.fillStyle = radialGrad;
    ctx.beginPath();
    ctx.arc(256, 480, 220, 0, Math.PI * 2);
    ctx.fill();

    // Lock screen clock
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("09:41", 256, 240);

    ctx.font = "500 24px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("Thứ Bảy, 15 Tháng 8", 256, 285);

    // Dynamic Island Pill cutout
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.roundRect(196, 45, 120, 36, 18);
    ctx.fill();

    const screenTex = new THREE.CanvasTexture(screenCanvas);
    const screenGeo = new THREE.PlaneGeometry(w * 0.94, h * 0.94);
    const screenMat = new THREE.MeshStandardMaterial({
        map: screenTex,
        metalness: 0.1,
        roughness: 0.1,
        emissive: 0x0a192f,
        emissiveIntensity: 0.4
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = d / 2 + 0.085;
    group.add(screenMesh);

    return {
        group,
        updateColor: (hexColor) => {
            const c = new THREE.Color(hexColor);
            frameMat.color.set(c);
            backMat.color.set(c);
            camIslandMat.color.set(c);
        }
    };
}

function Phone3DCanvas({ currentColorHex = "#C5A880", autoRotate = true }) {
    const mountRef = useRef(null);
    const modelRef = useRef(null);
    const isDraggingRef = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = mount.clientWidth || 400;
        const height = mount.clientHeight || 450;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
        camera.position.set(0, 0, 15);

        // Renderer with Transparent Background
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mount.appendChild(renderer.domElement);

        // Lighting Rig
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
        keyLight.position.set(6, 8, 10);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
        fillLight.position.set(-8, -4, 6);
        scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 2.2);
        backLight.position.set(0, 6, -10);
        scene.add(backLight);

        // Create 3D Phone Model
        const { group: phoneGroup, updateColor } = createPhoneGeometry();
        phoneGroup.rotation.y = -0.35; // Show front 3/4 angle
        phoneGroup.rotation.x = 0.08;
        scene.add(phoneGroup);
        modelRef.current = { phoneGroup, updateColor };
        updateColor(currentColorHex);

        // Mouse Drag Interaction Handlers
        function onMouseDown(e) {
            isDraggingRef.current = true;
            previousMousePosition.current = { x: e.clientX, y: e.clientY };
        }

        function onMouseMove(e) {
            if (!isDraggingRef.current || !phoneGroup) return;
            const deltaX = e.clientX - previousMousePosition.current.x;
            const deltaY = e.clientY - previousMousePosition.current.y;

            phoneGroup.rotation.y += deltaX * 0.01;
            phoneGroup.rotation.x += deltaY * 0.01;

            // Clamp vertical rotation
            phoneGroup.rotation.x = Math.max(-0.6, Math.min(0.6, phoneGroup.rotation.x));

            previousMousePosition.current = { x: e.clientX, y: e.clientY };
        }

        function onMouseUp() {
            isDraggingRef.current = false;
        }

        // Touch Handlers for Mobile Drag
        function onTouchStart(e) {
            if (e.touches.length === 1) {
                isDraggingRef.current = true;
                previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        }

        function onTouchMove(e) {
            if (!isDraggingRef.current || !phoneGroup || e.touches.length !== 1) return;
            const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

            phoneGroup.rotation.y += deltaX * 0.012;
            phoneGroup.rotation.x += deltaY * 0.012;
            phoneGroup.rotation.x = Math.max(-0.6, Math.min(0.6, phoneGroup.rotation.x));

            previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }

        function onTouchEnd() {
            isDraggingRef.current = false;
        }

        const dom = renderer.domElement;
        dom.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        dom.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchend", onTouchEnd);

        // Animation Loop (Floating + Idle Auto-Rotation)
        let animationFrameId;
        let clock = new THREE.Clock();

        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            if (phoneGroup) {
                // Floating breath motion
                phoneGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.25;

                // Slow auto-rotation when not dragging
                if (autoRotate && !isDraggingRef.current) {
                    phoneGroup.rotation.y += 0.005;
                }
            }

            renderer.render(scene, camera);
        }
        animate();

        // Resize Handler
        function handleResize() {
            if (!mount) return;
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            dom.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            dom.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
            if (mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [autoRotate]);

    // Live update color when prop changes
    useEffect(() => {
        if (modelRef.current) {
            modelRef.current.updateColor(currentColorHex);
        }
    }, [currentColorHex]);

    return (
        <div 
            ref={mountRef} 
            className="w-100 h-100 d-flex align-items-center justify-content-center cursor-grab"
            style={{ minHeight: 380, touchAction: "none" }}
            title="Kéo chuột để xoay 3D 360 độ"
        />
    );
}

export default Phone3DCanvas;
