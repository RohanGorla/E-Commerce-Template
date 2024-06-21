import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/Cart.css";

function Cart() {
  const context = useOutletContext();
  return (
    <>
      {context.cart.map((item, index) => {
        return (
          <div key={index}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <p>{item.category}</p>
          </div>
        );
      })}
    </>
  );
}

export default Cart;
