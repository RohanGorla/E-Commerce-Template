import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import imageUrl from "../assets/Dreamkart_Logo";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <div className="Navbar_Container">
      <div className="Navbar_Logo">
        <img src={`data:image/png;base64,${imageUrl}`}></img>
      </div>
      <ul
        className="Navbar_List"
        style={{
          display: "flex",
          gap: "3em",
          listStyle: "none",
          justifyContent: "center",
        }}
      >
        <li className="Navbar_Item">
          <NavLink
            to={""}
            style={({ isActive }) => {
              return isActive
                ? { textDecoration: "none", color: "#ff851b" }
                : { textDecoration: "none", color: "white" };
            }}
          >
            Home
          </NavLink>
        </li>
        <li className="Navbar_Item">
          <NavLink
            to={"/products"}
            style={({ isActive }) => {
              return isActive
                ? { textDecoration: "none", color: "#ff851b" }
                : { textDecoration: "none", color: "white" };
            }}
          >
            Products
          </NavLink>
        </li>
        <li className="Navbar_Item">
          <NavLink
            to={"/cart"}
            style={({ isActive }) => {
              return isActive
                ? { textDecoration: "none", color: "#ff851b" }
                : { textDecoration: "none", color: "white" };
            }}
          >
            Cart
          </NavLink>
        </li>
        <li className="Navbar_Item">
          <NavLink
            to={"/account"}
            style={({ isActive }) => {
              return isActive
                ? { textDecoration: "none", color: "#ff851b" }
                : { textDecoration: "none", color: "white" };
            }}
          >
            My Account
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Navbar;
