import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoadingFallback from "../components/common/LoadingFallback";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Lazy-loaded Public & Customer Pages
const Home = lazy(() => import("../pages/Home/Home"));
const ProductsList = lazy(() => import("../pages/Product/ProductsList"));
const ProductDetail = lazy(() => import("../pages/ProductDetail/ProductDetail"));
const Compare = lazy(() => import("../pages/Compare/Compare"));
const Wishlist = lazy(() => import("../pages/Wishlist/Wishlist"));
const Cart = lazy(() => import("../pages/Cart/Cart"));
const Checkout = lazy(() => import("../pages/Checkout/Checkout"));
const Orders = lazy(() => import("../pages/Orders/Orders"));
const Profile = lazy(() => import("../pages/Profile/Profile"));

// Lazy-loaded Auth Pages
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));

// Lazy-loaded Admin Layout & Backoffice Pages
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const Dashboard = lazy(() => import("../pages/Admin/Dashboard"));
const Products = lazy(() => import("../pages/Admin/Products"));
const ProductForm = lazy(() => import("../pages/Admin/ProductForm"));
const Brands = lazy(() => import("../pages/Admin/Brands"));
const Categories = lazy(() => import("../pages/Admin/Categories"));
const AdminOrders = lazy(() => import("../pages/Admin/Orders"));
const Users = lazy(() => import("../pages/Admin/Users"));

export default function AppRoutes() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Public Store Pages wrapped in MainLayout */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/products" element={<ProductsList />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/wishlist" element={<Wishlist />} />

                    {/* User Private Store Pages */}
                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute>
                                <Cart />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <Orders />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Authentication Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Backoffice Pages */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/create" element={<ProductForm />} />
                    <Route path="products/edit/:id" element={<ProductForm />} />
                    <Route path="brands" element={<Brands />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<Users />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}