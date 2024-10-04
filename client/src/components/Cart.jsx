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

  function currencyConvert(amount) {
    let amountString = amount.toString();
    let amountArray = amountString.split("").reverse();
    let iterator = Math.floor(amountArray.length / 2);
    let k = 3;
    for (let j = 0; j < iterator - 1; j++) {
      amountArray.splice(k, 0, ",");
      k += 3;
    }
    let finalAmount = amountArray.reverse().join("");
    console.log(finalAmount);
    return finalAmount;
  }

  useEffect(() => {
    getFromCart();
  }, []);

  return (
    <div className="Cart_Main_Container">
      <div className="Cart_Subcontainer">
        {userInfo ? (
          cart.length ? (
            <div className="Cart_Main">
              <div className="Cart_Main--Header">
                <div className="Cart_Main--Header_Title">
                  <h2>Your Cart Items</h2>
                </div>
                <div className="Cart_Main--Header_Checkout_Button">
                  <button
                    onClick={() => {
                      navigate("/checkout");
                    }}
                  >
                    Checkout
                  </button>
                </div>
              </div>
              <div className="Cart_Main--Items_Display">
                {cart.map((item, index) => {
                  let convertedMrp = currencyConvert(item.price);
                  let price = (
                    item.price -
                    item.price * (item.discount / 100)
                  ).toFixed(2);
                  let priceInt = price.split(".")[0];
                  let priceDecimal = price.split(".")[1].toString();
                  let convertedPrice =
                    currencyConvert(priceInt) + "." + priceDecimal;
                  return (
                    <div key={index} className="Cart_Items_Display">
                      <div className="Cart_Items_Display--Image">
                        <img src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"></img>
                      </div>
                      <div className="Cart_Items_Display--Details">
                        <p className="Cart_Items_Details--Title">
                          {item.title}
                        </p>
                        <p className="Cart_Items_Details--Price">
                          <span className="Cart_Items_Details--Discount">
                            -{item.discount}%
                          </span>{" "}
                          ₹{convertedPrice}
                        </p>
                        <p className="Cart_Items_Details--Mrp">
                          M.R.P:{" "}
                          <span className="Cart_Items_Details--Mrp--Strike">
                            ₹{convertedMrp}
                          </span>
                        </p>
                        <div className="Cart_Items_Details--Buttons">
                          <button
                            className="Cart_Items_Details--Buttons--Buynow"
                            onClick={() => {
                              window.open(
                                `${window.location.origin}/buy/${item.productid}`
                              );
                            }}
                          >
                            Buy now
                          </button>
                          <button
                            className="Cart_Items_Details--Buttons--Remove"
                            onClick={() => {
                              removeFromCart(item.id);
                            }}
                          >
                            Remove from cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="Cart_Empty">
              <h3 className="Cart_Empty--Heading">Cart empty!</h3>
              <p className="Cart_Empty--Note">
                Your cart is empty. Shop for products and add them to cart to
                show them here.
              </p>
              <div className="Cart_Empty--Button">
                <button
                  onClick={() => {
                    navigate("/products");
                  }}
                >
                  Go shopping
                </button>
              </div>
            </div>
          )
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
