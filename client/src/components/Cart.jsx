import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Cart.css";
import axios from "axios";

function Cart() {
  const [cart, setCart] = useState([]);

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
    <div className="Cart_Main">
      {cart.length ? (
        <div>
          <Link
            to="/checkout"
            target="_blank"
            style={{
              textDecoration: "none",
              backgroundColor: "gold",
              color: "black",
              borderStyle: "none",
              padding: "10px 15px",
              borderRadius: "10px",
              fontSize: "20px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Checkout
          </Link>
          <div className="Cart_Items_Container">
            {cart.map((item, index) => {
              return (
                <div
                  key={index}
                  style={{ margin: "1em 0", padding: "1em 2em" }}
                >
                  <img
                    src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
                    style={{ width: "300px" }}
                  ></img>
                  <h2>{item.title}</h2>
                  <p>{item.price}</p>
                  <p>{item.discount}</p>
                  <p>
                    final price:{" "}
                    {item.price - item.price * (item.discount / 100)}
                  </p>
                  <div className="Cart_Buttons">
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                      }}
                      style={{
                        backgroundColor: "rgb(51, 50, 50)",
                        color: "white",
                        borderStyle: "none",
                        padding: "10px 15px",
                        borderRadius: "10px",
                        fontSize: "20px",
                        fontWeight: "700",
                        cursor: "pointer",
                        marginRight: "1em",
                      }}
                    >
                      Remove
                    </button>
                    <button
                      style={{
                        backgroundColor: "gold",
                        borderStyle: "none",
                        padding: "10px 15px",
                        borderRadius: "10px",
                        fontSize: "20px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                      className="Buy_Button"
                      onClick={() => {
                        window.open(
                          `${window.location.origin}/buy/${item.productid}`
                        );
                      }}
                    >
                      Buy now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <h2>Cart is empty</h2>
      )}
    </div>
  );
}

export default Cart;
