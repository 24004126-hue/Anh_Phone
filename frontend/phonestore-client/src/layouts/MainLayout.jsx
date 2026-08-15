import { Outlet } from "react-router-dom";
import NavbarComponent from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AIAssistantWidget from "../components/common/AIAssistantWidget";
import MobileBottomNav from "../components/layout/MobileBottomNav";
import CompareBar from "../components/common/CompareBar";
import PwaInstallPrompt from "../components/common/PwaInstallPrompt";

function MainLayout() {
    return (
        <div className="d-flex flex-column min-vh-100 pb-5 pb-md-0">
            <NavbarComponent />

            <main className="store-main flex-grow-1">
                <div className="container mt-3 mt-md-4">
                    <Outlet />
                </div>
            </main>

            <Footer />
            <AIAssistantWidget />
            <CompareBar />
            <PwaInstallPrompt />
            <MobileBottomNav />
        </div>
    );
}

export default MainLayout;