import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
      <div className="navbar">
        <ul
          className="nav-items"
          style={{
            display: "flex",
            gap: "3em",
            listStyle: "none",
            justifyContent: "center",
            // padding: "2em 0",
          }}
        >
          <li className="nav-item">
            <NavLink
              to={""}
              style={({ isActive }) => {
                return isActive
                  ? { textDecoration: "none", color: "red" }
                  : { textDecoration: "none", color: "white" };
              }}
            >
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={"/products"}
              style={({ isActive }) => {
                return isActive
                  ? { textDecoration: "none", color: "red" }
                  : { textDecoration: "none", color: "white" };
              }}
            >
              Products
            </NavLink>
          </li>
          {/* <li className="nav-item">
            <NavLink
              to={"/wishlist"}
              style={({ isActive }) => {
                return isActive
                  ? { textDecoration: "none", color: "red" }
                  : { textDecoration: "none", color: "white" };
              }}
            >
              Wishlist
            </NavLink>
          </li> */}
          <li className="nav-item">
            <NavLink
              to={"/cart"}
              style={({ isActive }) => {
                return isActive
                  ? { textDecoration: "none", color: "red" }
                  : { textDecoration: "none", color: "white" };
              }}
            >
              Cart
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={"/account"}
              style={({ isActive }) => {
                return isActive
                  ? { textDecoration: "none", color: "red" }
                  : { textDecoration: "none", color: "white" };
              }}
            >
              My Account
            </NavLink>
          </li>
          {/* <li className="nav-item">
            <NavLink
              to={"/addproduct"}
              style={({ isActive }) => {
                return isActive
                  ? { textDecoration: "none", color: "red" }
                  : { textDecoration: "none", color: "white" };
              }}
            >
              Add product
            </NavLink>
          </li> */}
        </ul>
      </div>
  );
}

export default Navbar;
