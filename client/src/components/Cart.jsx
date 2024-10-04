import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";
import axios from "axios";

function Cart() {
  const [cart, setCart] = useState([]);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();

  async function getFromCart() {
    const mailId = userInfo?.mailId;
    if (mailId) {
      const response = await axios.post("http://localhost:3000/getcartitems", {
        mailId: mailId,
      });
      const data = response.data;
      setCart(data);
    }
  }

  async function removeFromCart(id) {
    let response = await axios.delete("http://localhost:3000/removecartitem", {
      data: { id },
    });
    getFromCart();
  }

  useEffect(() => {
    getFromCart();
  }, []);

  return (
    <div className="Cart_Main_Container">
      <div className="Cart_Subcontainer">
        {userInfo ? (
          <div className="Cart_Main">
            {cart.length ? (
              <div>
                <div>
                  <button
                    onClick={() => {
                      navigate("/checkout");
                    }}
                  >
                    Checkout
                  </button>
                </div>
                <div className="">
                  {cart.map((item, index) => {
                    return (
                      <div key={index}>
                        <img src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"></img>
                        <h2>{item.title}</h2>
                        <p>{item.price}</p>
                        <p>{item.discount}</p>
                        <p>
                          final price:{" "}
                          {item.price - item.price * (item.discount / 100)}
                        </p>
                        <div className="">
                          <button
                            onClick={() => {
                              removeFromCart(item.id);
                            }}
                          >
                            Remove
                          </button>
                          <button
                            className=""
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
        ) : (
          <div className="Cart_Login_Redirect">
            <p className="Cart_Login_Redirect--Note">
              Please login to add items to your cart!
            </p>
            <div className="Cart_Login_Redirect--Button">
              <button
                onClick={() => {
                  navigate("/account");
                }}
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
