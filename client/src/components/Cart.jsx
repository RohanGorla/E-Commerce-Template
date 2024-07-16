import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/Cart.css";
import axios from "axios";

function Cart() {
  const [cart, setCart] = useState([]);

  const context = useOutletContext();

  async function getFromCart() {
    console.log("cart");
    const mailId = localStorage.getItem("mailId");
    if (mailId) {
      const response = await axios.post("http://localhost:3000/getcartitems", {
        mailId: mailId,
      });
      const data = response.data;
      console.log(data);
      setCart(data);
    }
  }

  async function removeFromCart(id) {
    let response = await axios.delete("http://localhost:3000/removecartitem", {
      data: { id },
    });
    console.log(response);
    getFromCart();
  }

  useEffect(() => {
    getFromCart();
  }, []);
  return (
    <>
      {cart.map((item, index) => {
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
            <button
              onClick={() => {
                removeFromCart(item.id);
              }}
            >
              Remove
            </button>
          </div>
        );
      })}
    </>
  );
}

export default Cart;
