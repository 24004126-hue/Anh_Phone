import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CompareProvider } from "./context/CompareContext";
import "./styles/store.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <CompareProvider>
                        <App />
                    </CompareProvider>
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    </BrowserRouter>
);