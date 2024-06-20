import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <>
      <div className="navbar">
        <ul className="nav-items">
          <li className="nav-item">
            <Link to={""}>Products</Link>
          </li>
          <li className="nav-item">
            <Link to={"/Wishlist"}>Wishlist</Link>
          </li>
          <li className="nav-item">
            <Link to={"/Cart"}>Cart</Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Navbar;
