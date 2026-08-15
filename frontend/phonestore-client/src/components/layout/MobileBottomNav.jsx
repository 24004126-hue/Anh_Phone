import { NavLink, useLocation } from "react-router-dom";
import { 
    LuHouse, 
    LuGrid2X2, 
    LuShoppingBag, 
    LuPackage, 
    LuUser 
} from "react-icons/lu";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

function MobileBottomNav() {
    const { cartCount } = useCart();
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // Hide bottom nav in admin backoffice
    if (location.pathname.startsWith("/admin")) {
        return null;
    }

    return (
        <nav className="mobile-bottom-bar d-md-none">
            <NavLink 
                to="/" 
                end 
                className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
            >
                <LuHouse size={20} />
                <span>Trang Chủ</span>
            </NavLink>

            <NavLink 
                to="/products" 
                className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
            >
                <LuGrid2X2 size={20} />
                <span>Sản Phẩm</span>
            </NavLink>

            <NavLink 
                to="/cart" 
                className={({ isActive }) => `mobile-nav-item position-relative ${isActive ? "active" : ""}`}
            >
                <div className="position-relative d-inline-flex">
                    <LuShoppingBag size={20} />
                    {cartCount > 0 && (
                        <span className="mobile-cart-badge">
                            {cartCount > 99 ? "99+" : cartCount}
                        </span>
                    )}
                </div>
                <span>Giỏ Hàng</span>
            </NavLink>

            <NavLink 
                to="/orders" 
                className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
            >
                <LuPackage size={20} />
                <span>Đơn Hàng</span>
            </NavLink>

            <NavLink 
                to={isAuthenticated ? "/profile" : "/login"} 
                className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
            >
                <LuUser size={20} />
                <span>{isAuthenticated ? "Tài Khoản" : "Đăng Nhập"}</span>
            </NavLink>
        </nav>
    );
}

export default MobileBottomNav;
