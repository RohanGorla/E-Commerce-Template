import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <>
      <div className="navbar">
        <ul
          className="nav-items"
          style={{
            display: "flex",
            gap: "3em",
            listStyle: "none",
            justifyContent: "center",
            padding: "2em 0",
          }}
        >
          <li className="nav-item">
            <NavLink
              to={""}
              style={({ isActive }) => {
                return isActive
                  ? { textDecoration: "none", color: "red" }
                  : { textDecoration: "none", color: "black" };
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
                  : { textDecoration: "none", color: "black" };
              }}
            >
              Products
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={"/wishlist"}
              style={({ isActive }) => {
                return isActive
                  ? { textDecoration: "none", color: "red" }
                  : { textDecoration: "none", color: "black" };
              }}
            >
              Wishlist
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={"/cart"}
              style={({ isActive }) => {
                return isActive
                  ? { textDecoration: "none", color: "red" }
                  : { textDecoration: "none", color: "black" };
              }}
            >
              Cart
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={"/register"}
              style={({ isActive }) => {
                return isActive
                  ? { textDecoration: "none", color: "red" }
                  : { textDecoration: "none", color: "black" };
              }}
            >
              Log in
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Navbar;
