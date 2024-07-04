import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/Cart.css";

function Cart() {
  const context = useOutletContext();
  return (
    <>
      {context.cart.map((item, index) => {
        return (
          <div key={index} style={{ margin: "1em 0", padding: "1em 2em" }}>
            <img
              src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
              style={{ width: "300px" }}
            ></img>
            <h2>{item.title}</h2>
            <p>{item.price}</p>
            <p>{item.discount}</p>
            <p>
              final price: {item.price - item.price * (item.discount / 100)}
            </p>
            {/* Add remove from cart, go to buy buttons */}
          </div>
        );
      })}
    </>
  );
}

export default Cart;
