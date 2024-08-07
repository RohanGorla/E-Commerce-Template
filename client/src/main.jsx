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
import Categories from "./components/Products/Categories.jsx";
import Items from "./components/Products/Items.jsx";
import Product from "./components/Products/Product.jsx";
import Buy from "./components/Buy.jsx";
import Wishlist from "./components/Wishlist.jsx";
import Cart from "./components/Cart.jsx";
import Checkout from "./components/Checkout.jsx";
import Account from "./components/Account.jsx";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import Orders from "./components/Orders.jsx";
import Address from "./components/Address.jsx";
import Addaddress from "./components/Addaddress.jsx";
import AddProduct from "./components/AddProduct.jsx";
import Profile from "./components/Profile.jsx";
import "./index.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />}>
        <Route path="" element={<Home />} />
        <Route path="products">
          <Route path="" element={<Categories />} />
          <Route path="items/:item" element={<Items />} />
          <Route path="product/:product" element={<Product />} />
        </Route>
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="cart" element={<Cart />} />
        <Route path="account">
          <Route path="" element={<Account />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="orders" element={<Orders />} />
          <Route path="address">
            <Route path="" element={<Address />} />
            <Route path="addaddress" element={<Addaddress />} />
          </Route>
        </Route>
        <Route path="profile" element={<Profile />} />
        <Route path="addproduct" element={<AddProduct />} />
      </Route>
      <Route path="buy/:product" element={<Buy />} />
      <Route path="checkout" element={<Checkout />} />
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
