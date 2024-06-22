import React from "react";
import ReactDOM from "react-dom/client";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import App from "./App.jsx";
import Home from "./components/Home.jsx";
import Products from "./components/Products/Products.jsx";
import Categories from "./components/Products/Categories.jsx";
import Items from "./components/Products/Items.jsx";
import Wishlist from "./components/Wishlist.jsx";
import Cart from "./components/Cart.jsx";
import Register from "./components/Register.jsx";
import "./index.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />}>
        <Route path="" element={<Home />} />
        <Route path="products" element={<Products />}>
          <Route path="" element={<Categories />} />
          <Route path="items" element={<Items />} />
        </Route>
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="cart" element={<Cart />} />
        <Route path="register" element={<Register />} />
      </Route>
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
