import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import "../styles/Cart.css";

function Cart() {
  const [cart, setCart] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [count, setCount] = useState(-1);
  const [selectedItem, setSelectedItem] = useState(-1);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const mailId = userInfo?.mailId;
  const navigate = useNavigate();

  /* GET PRODUCT IMAGE URLS FROM S3 */

  async function getImageUrls(imageKeys) {
    const getUrlResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/generategeturls`,
      { imageKeys: [imageKeys[0]] }
    );
    const getUrls = getUrlResponse.data;
    return getUrls;
  }

  /* Cart APIs */

  async function getFromCart() {
    if (mailId) {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/getcartitems`,
        {
          mailId: mailId,
        }
      );
      if (response.data.access) {
        if (response.data.data.length) {
          const cartData = response.data.data;
          let cartProductIds = [];
          for (let i = 0; i < cartData.length; i++) {
            cartProductIds.push(cartData[i].productid);
            if (JSON.parse(cartData[i].imageTags).length)
              cartData[i].imageUrl = await getImageUrls(
                JSON.parse(cartData[i].imageTags)
              );
          }

          /* Get Reviews Of All Cart Products API */
          async function getCartProductReviews() {
            let response = await axios.post(
              `${import.meta.env.VITE_BASE_URL}/getallreviews`,
              {
                id: cartProductIds,
              }
            );
            if (response.data.access) {
              setReviews(response.data.data);
            } else {
              setSuccess(false);
              setError(true);
              setErrorMessage(response.data.errorMsg);
              setTimeout(() => {
                setError(false);
              }, 3500);
            }
            setCart(cartData);
          }
          getCartProductReviews();
        } else {
          setCart([]);
        }
      } else {
        setSuccess(false);
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
    } else {
      navigate("/account");
    }
  }

  async function updateCart() {
    let response = await axios.put(
      `${import.meta.env.VITE_BASE_URL}/updatecartitemcount`,
      {
        cartData: cart,
        mail: mailId,
      }
    );
    if (response.data.access) {
      window.open(`${window.location.origin}/checkout`);
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  async function removeFromCart(id) {
    let response = await axios.delete(
      `${import.meta.env.VITE_BASE_URL}/removecartitem`,
      {
        data: { id, mailId },
      }
    );
    if (response.data.access) {
      setError(false);
      setSuccess(true);
      setSuccessMessage(response.data.successMsg);
      setTimeout(() => {
        setSuccess(false);
      }, 3500);
      getFromCart();
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  /* Useful Functions */

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
    return finalAmount;
  }

  function getProductRatingData(id) {
    let totalRating = 0;
    let totalRatings = 0;
    let averageRatingRounded = -1;
    let actualProductRating = 0;
    if (reviews.length) {
      reviews.forEach((review) => {
        if (review.productid == id) {
          totalRating += review.rating;
          if (review.rating) {
            totalRatings += 1;
          }
        }
      });
      if (totalRatings) {
        actualProductRating = totalRating / totalRatings;
        averageRatingRounded = Math.round(actualProductRating) - 1;
      }
    }
    return {
      ratings: totalRatings,
      averageStarRating: averageRatingRounded,
      actualRating: actualProductRating.toFixed(1),
    };
  }

  useEffect(() => {
    getFromCart();
  }, []);

  return (
    <div className="Cart_Page">
      {/* Error Message Box */}
      <div
        className={
          error
            ? "Error_Message_Box Error_Message_Box--Active"
            : "Error_Message_Box Error_Message_Box--Inactive"
        }
      >
        <div className="Error_Message_Box--Container">
          <p className="Error_Message_Box--Heading">Error!</p>
          <p className="Error_Message_Box--Message">{errorMessage}</p>
        </div>
      </div>
      {/* Success Message Box */}
      <div
        className={
          success
            ? "Success_Message_Box Success_Message_Box--Active"
            : "Success_Message_Box Success_Message_Box--Inactive"
        }
      >
        <div className="Success_Message_Box--Container">
          <p className="Success_Message_Box--Heading">Success!</p>
          <p className="Success_Message_Box--Message">{successMessage}</p>
        </div>
      </div>
      {/* Cart Products Main */}
      <div className="Cart_Main_Container">
        <div className="Cart_Subcontainer">
          {userInfo ? (
            cart.length ? (
              <div className="Cart_Main">
                <div className="Cart_Main--Header_Container">
                  <div className="Cart_Main--Header">
                    <div className="Cart_Main--Header_Title">
                      <h2>Your Cart Items</h2>
                    </div>
                    <div className="Cart_Main--Header_Checkout_Button">
                      <button onClick={updateCart}>Checkout</button>
                    </div>
                  </div>
                </div>
                <div className="Cart_Main--Items_Display">
                  {cart.map((item, index) => {
                    let convertedMrp = currencyConvert(item.price);
                    let price = item.price - item.price * (item.discount / 100);
                    let priceInt;
                    let priceDecimal;
                    if (price.toString().split(".").length === 1) {
                      priceInt = currencyConvert(price);
                      priceDecimal = ".00";
                    } else {
                      priceInt = currencyConvert(
                        (Math.round(price * 100) / 100).toString().split(".")[0]
                      );
                      priceDecimal = (Math.round(price * 100) / 100)
                        .toString()
                        .split(".")[1]
                        .padEnd(2, "0");
                    }
                    let convertedPrice = priceInt + "." + priceDecimal;
                    let productRatingData = getProductRatingData(
                      item.productid
                    );
                    return (
                      <div key={index} className="Cart_Items_Display">
                        <div className="Cart_Items_Display--Image">
                          <img
                            src={
                              item.imageUrl
                                ? item.imageUrl[0].imageUrl
                                : "https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
                            }
                            onClick={() => {
                              window.open(
                                `${window.location.origin}/products/product/${item.productid}`
                              );
                            }}
                          ></img>
                        </div>
                        <div className="Cart_Items_Display--Details">
                          <p
                            className="Cart_Items_Details--Title"
                            onClick={() => {
                              window.open(
                                `${window.location.origin}/products/product/${item.productid}`
                              );
                            }}
                          >
                            {item.title}
                          </p>
                          <div className="Cart_Items_Details--Rating">
                            <span className="Cart_Items_Rating--Average_Rating">
                              {productRatingData.actualRating}
                            </span>
                            <div className="Cart_Items_Rating--Star_Container">
                              {Array(5)
                                .fill(0)
                                .map((_, index) => {
                                  return (
                                    <FaStar
                                      className="Cart_Items_Rating--Star"
                                      key={index}
                                      size={15}
                                      color={
                                        index <=
                                        productRatingData.averageStarRating
                                          ? "orange"
                                          : "white"
                                      }
                                    />
                                  );
                                })}
                            </div>
                            <span className="Cart_Items_Rating--Total_Ratings">
                              {productRatingData.ratings}{" "}
                              {productRatingData.ratings == 1
                                ? "rating"
                                : "ratings"}
                            </span>
                          </div>
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
                            <div className="Cart_Items_Buttons--Counter">
                              <button
                                className="Cart_Items_Counter--Decrement"
                                onClick={() => {
                                  setSelectedItem(item.productid);
                                  let newCount = item.count - 1;
                                  setCount(newCount);
                                  setCart((prev) => {
                                    let prevValues = prev;
                                    prevValues.map((current) => {
                                      if (item.productid == current.productid) {
                                        // console.log("Before -> ", current.count);
                                        current.count = newCount;
                                        // console.log("After -> ", current.count);
                                      }
                                    });
                                    // console.log(prevValues);
                                    return prevValues;
                                  });
                                }}
                              >
                                -
                              </button>
                              <input
                                className="Cart_Items_Counter--Input"
                                type="input"
                                value={
                                  selectedItem == item.productid
                                    ? count
                                    : item.count
                                }
                                // value={item.count}
                                onClick={() => {
                                  setSelectedItem(item.productid);
                                  setCount(item.count);
                                }}
                                onChange={(e) => {
                                  setCount(e.target.value);
                                  setCart((prev) => {
                                    let prevValues = prev;
                                    prevValues.map((current) => {
                                      if (item.productid == current.productid) {
                                        current.count = Number(e.target.value);
                                      }
                                    });
                                    // console.log(prevValues);
                                    return prevValues;
                                  });
                                }}
                              ></input>
                              <button
                                className="Cart_Items_Counter--Increment"
                                onClick={() => {
                                  setSelectedItem(item.productid);
                                  let newCount = item.count + 1;
                                  setCount(newCount);
                                  setCart((prev) => {
                                    let prevValues = prev;
                                    prevValues.map((current) => {
                                      if (item.productid == current.productid) {
                                        // console.log("Before -> ", current.count);
                                        current.count = newCount;
                                        // console.log("After -> ", current.count);
                                      }
                                    });
                                    // console.log(prevValues);
                                    return prevValues;
                                  });
                                }}
                              >
                                +
                              </button>
                            </div>
                            {/* <button
                            className="Cart_Items_Buttons--Buynow"
                            onClick={() => {
                              window.open(
                                `${window.location.origin}/buy/${item.productid}`
                              );
                            }}
                          >
                            Buy now
                          </button> */}
                            <button
                              className="Cart_Items_Buttons--Remove"
                              onClick={() => {
                                removeFromCart(item.productid);
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
    </div>
  );
}

export default Cart;
