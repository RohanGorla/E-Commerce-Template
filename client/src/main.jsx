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
import Registerbase from "./components/Registerbase.jsx";
import Register from "./components/Register.jsx";
import Registerotp from "./components/Registerotp.jsx";
import Login from "./components/Login.jsx";
import Credentials from "./components/Credentials.jsx";
import Editname from "./components/Editname.jsx";
import Editmailbase from "./components/Editmailbase.jsx";
import Editmail from "./components/Editmail.jsx";
import Emailotp from "./components/Emailotp.jsx";
import Editpassword from "./components/Editpassword.jsx";
import Orders from "./components/Orders.jsx";
import Address from "./components/Address.jsx";
import Addaddress from "./components/Addaddress.jsx";
import Merchant from "./components/Merchant.jsx";
import MerchantRegisterBase from "./components/MerchantRegisterBase.jsx";
import MerchantRegister from "./components/MerchantRegister.jsx";
import AddProduct from "./components/AddProduct.jsx";
import Profile from "./components/Profile.jsx";
import "./index.css";
import MerchantOtp from "./components/MerchantOtp.jsx";

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
        <Route path="cart" element={<Cart />} />
        <Route path="account">
          <Route path="" element={<Account />} />
          <Route path="register" element={<Registerbase />}>
            <Route path="" element={<Register />} />
            <Route path="registerotp" element={<Registerotp />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="orders" element={<Orders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="address">
            <Route path="" element={<Address />} />
            <Route path="addaddress" element={<Addaddress />} />
          </Route>
          <Route path="credentials">
            <Route path="" element={<Credentials />} />
            <Route path="editname" element={<Editname />} />
            <Route path="email" element={<Editmailbase />}>
              <Route path="" element={<Editmail />} />
              <Route path="emailotp" element={<Emailotp />} />
            </Route>
            <Route path="editpassword" element={<Editpassword />} />
          </Route>
        </Route>
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="checkout" element={<Checkout />} />
      <Route path="buy" element={<Buy />} />
      <Route path="merchant">
        <Route path="" element={<Merchant />} />
        <Route path="merchantregister" element={<MerchantRegisterBase />}>
          <Route path="" element={<MerchantRegister />} />
          <Route path="merchantotp" element={<MerchantOtp />} />
        </Route>
        <Route path="addproduct" element={<AddProduct />} />
      </Route>
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
