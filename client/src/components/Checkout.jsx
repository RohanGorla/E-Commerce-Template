import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Checkout.css";

function Checkout() {
  const [cartData, setCartData] = useState([]);
  const [addressData, setAddressData] = useState([]);
  const [showAddress, setShowSelectAddress] = useState(false);
  const [addAddress, setShowAddAddress] = useState(false);
  const [addressFullName, setAddressFullName] = useState("");
  const [addressHouse, setAddressHouse] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [count, setCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderCostNumber, setOrderCostNumber] = useState(0);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [resOrderId, setResOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [signature, setSignature] = useState("");
  const [paymentInitiate, setPaymentInitiate] = useState(false);
  const [time, setTime] = useState(30);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const address = JSON.parse(localStorage.getItem("address"));
  const order = JSON.parse(sessionStorage.getItem("order"));
  const mailId = userInfo?.mailId;
  const token = userInfo?.token;

  /* GET PRODUCT IMAGE URLS FROM S3 */

  async function getImageUrls(imageKeys) {
    const getUrlResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/generategeturls`,
      { imageKeys: [imageKeys[0]] }
    );
    const getUrls = getUrlResponse.data;
    return getUrls;
  }

  /* User Authorization API */

  async function checkAuthorized() {
    let response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/checkauthorized`,
      {
        mail: mailId,
        token: token,
      }
    );
    if (response.data.access) {
      getCartItems();
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 4500);
      if (response.data.logout) {
        setTimeout(() => {
          localStorage.removeItem("userInfo");
          localStorage.removeItem("address");
          navigate("/account");
        }, 5000);
      }
    }
  }

  /* Get Cart Products API */

  async function getCartItems() {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getcartitems`,
      {
        mailId: mailId,
      }
    );
    if (response.data.access) {
      const cartProducts = response.data.data;
      for (let i = 0; i < cartProducts.length; i++) {
        if (cartProducts[i].imageTags)
          cartProducts[i].imageUrl = await getImageUrls(
            JSON.parse(cartProducts[i].imageTags)
          );
      }
      setCartData(cartProducts);
      let count = 0;
      let totalCost = 0;
      response.data.data.forEach((product) => {
        let cost = product.final_price;
        count += Number(product.count);
        totalCost += product.count * cost;
      });
      totalCost = Math.round(totalCost * 100) / 100;
      let totalCostCurrency;
      let orderCostCurrency;
      if (totalCost.toString().split(".").length === 1) {
        totalCostCurrency = currencyConvert(totalCost) + ".00";
        orderCostCurrency = currencyConvert(totalCost + 20) + ".00";
      } else {
        totalCostCurrency =
          currencyConvert(totalCost.toString().split(".")[0]) +
          "." +
          totalCost.toString().split(".")[1].padEnd(2, "0");
        orderCostCurrency =
          currencyConvert((totalCost + 20).toString().split(".")[0]) +
          "." +
          (totalCost + 20).toString().split(".")[1].padEnd(2, "0");
      }
      if (totalCost > 500) {
        setOrderTotal(totalCostCurrency);
        setTotalCost(totalCostCurrency);
        setOrderCostNumber(totalCost);
        setFreeDelivery(true);
      } else {
        setOrderTotal(orderCostCurrency);
        setTotalCost(totalCostCurrency);
        setOrderCostNumber(totalCost + 20);
        setFreeDelivery(false);
      }
      setCount(count);
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  /* Address APIs */

  async function getAddress() {
    let response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getaddress`,
      {
        mail: mailId,
      }
    );
    if (response.data.access) {
      setAddressData(response.data.data);
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  async function addDeliveryAddress() {
    let response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/addaddress`,
      {
        mail: mailId,
        name: addressFullName,
        house: addressHouse,
        street: addressStreet,
        landmark: addressLandmark,
        city: addressCity,
        state: addressState,
        country: addressCountry,
      }
    );
    if (response.data.access) {
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...userInfo, base_address: addressFullName })
      );
      localStorage.setItem(
        "address",
        JSON.stringify({
          addressname: addressFullName,
          house: addressHouse,
          street: addressStreet,
          landmark: addressLandmark,
          city: addressCity,
          state: addressState,
          country: addressCountry,
        })
      );
      setError(false);
      setSuccess(true);
      setSuccessMessage(response.data.successMsg);
      setTimeout(() => {
        setSuccess(false);
      }, 3500);
      setShowAddAddress(false);
      setAddressData(response.data.data);
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  async function changeBaseAddress(current) {
    if (current.addressname === userInfo.base_address) {
      setError(false);
      setSuccess(true);
      setSuccessMessage("Delivery address has been updated successfully!");
      setTimeout(() => {
        setSuccess(false);
      }, 3500);
    } else {
      let response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/updatebaseaddress`,
        {
          address: current,
          mailId: mailId,
        }
      );
      if (response.data.access) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...userInfo, base_address: current.addressname })
        );
        localStorage.setItem("address", JSON.stringify(current));
        setError(false);
        setSuccess(true);
        setSuccessMessage(response.data.successMsg);
        setTimeout(() => {
          setSuccess(false);
        }, 3500);
      } else {
        setSuccess(false);
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
    }
    setShowSelectAddress(false);
  }

  /* Order And Payment APIs */

  async function placeOrder() {
    let response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/placeorder`,
      {
        mail: mailId,
        address: address,
      }
    );
    if (response.data.access) {
      sessionStorage.setItem("order", JSON.stringify({ orderPlaced: true }));
      setTimeout(() => {
        window.close();
      }, 30000);
      setInterval(() => {
        setTime((prev) => {
          return prev - 1;
        });
      }, 1000);
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  async function openPayment() {
    if (address) {
      let response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/initiatepayment`,
        {
          mail: mailId,
        }
      );
      let amount = Math.round(orderCostNumber * 100);
      if (response.data.access) {
        const options = {
          key: import.meta.env.VITE_KEY,
          amount: amount,
          currency: "INR",
          name: "Ron-commerce",
          description: "Test Transaction",
          image: "https://example.com/your_logo",
          order_id: response.data.data.id,
          handler: function (response) {
            setPaymentId(response.razorpay_payment_id);
            setSignature(response.razorpay_signature);
            setResOrderId(response.razorpay_order_id);
            placeOrder();
          },
          notes: {
            address: "Razorpay Corporate Office",
          },
          theme: {
            color: "#3399cc",
          },
        };
        setPaymentInitiate(true);
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        setSuccess(false);
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
    } else {
      setError(true);
      setErrorMessage("Select a delivery address before initiating payment!");
      setTime(() => {
        setError(false);
      }, 3500);
      setShowSelectAddress(true);
    }
  }

  /* Currency Converter */

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

  useEffect(() => {
    const orderPlaced = order?.orderPlaced;
    if (orderPlaced) {
      setPaymentInitiate(true);
    }
    getAddress();
    if (mailId && token) {
      checkAuthorized();
    } else {
      navigate("/account");
    }
  }, []);

  return (
    <div className="Checkout_Page">
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
      {/* Checkout Page */}
      {paymentInitiate ? (
        <div
          className={
            order?.orderPlaced
              ? "Checkout_Order_Placed"
              : "Checkout_Order_Placed--Inactive"
          }
        >
          <p className="Checkout_Order_Placed--Success">
            Your order has been placed successfully! You can view all your order
            details in the 'Your orders' section in Your account.
          </p>
          <p className="Checkout_Order_Placed--Timer">
            You can close this tab now or it will be closed automatically in{" "}
            {time}
            seconds.
          </p>
        </div>
      ) : (
        <div className="Checkout_Main_Container">
          <div
            className={
              showAddress
                ? "Checkout_Select_Address"
                : "Checkout_Select_Address--Inactive"
            }
          >
            <div className="Checkout_Select_Address--Tint"></div>
            <div className="Checkout_Select_Address--Address_Container">
              <div className="Checkout_Select_Address--Address_Subcontainer">
                <div
                  className="Close--Checkout_Select_Address"
                  onClick={() => {
                    setShowSelectAddress(false);
                  }}
                >
                  <span className="Close--Checkout_Select_Address--Cross"></span>
                </div>
                <div className="Checkout_Select_Address--Header">
                  <h3>Select Delivery Address</h3>
                  <button
                    onClick={() => {
                      setShowAddAddress(true);
                      setShowSelectAddress(false);
                    }}
                  >
                    Add New Address
                  </button>
                </div>
                {addressData.length ? (
                  addressData.map((address, index) => {
                    return (
                      <div
                        key={index}
                        className="Checkout_Select_Address--Address"
                      >
                        <p className="Checkout_Select_Address--Name">
                          {address.addressname}
                        </p>
                        <p className="Checkout_Select_Address--House">
                          {address.house}
                        </p>
                        <p className="Checkout_Select_Address--Street">
                          {address.street}
                        </p>
                        <p className="Checkout_Select_Address--Landmark">
                          Near {address.landmark}
                        </p>
                        <p className="Checkout_Select_Address--City_State">
                          {address.city}, {address.state}
                        </p>
                        <p className="Checkout_Select_Address--Country">
                          {address.country}
                        </p>
                        <div className="Checkout_Select_Address--Button">
                          <button
                            onClick={() => {
                              changeBaseAddress(address);
                            }}
                          >
                            Deliver to this address
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="Checkout_Select_Address--Empty">
                    <p className="Checkout_Select_Address--Empty--Note">
                      You have not added any delivery address. Add an address to
                      ship your order!
                    </p>
                    <button
                      className="Checkout_Select_Address--Empty--Button"
                      onClick={() => {
                        setShowAddAddress(true);
                        setShowSelectAddress(false);
                      }}
                    >
                      Add Delivery Address
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className={
              addAddress
                ? "Checkout_Add_Address"
                : "Checkout_Add_Address--Inactive"
            }
          >
            <div className="Checkout_Add_Address--Tint"></div>
            <div className="Checkout_Add_Address--Container">
              <div className="Checkout_Add_Address--Subcontainer">
                <div
                  className="Close--Checkout_Add_Address"
                  onClick={() => {
                    setShowAddAddress(false);
                  }}
                >
                  <span className="Close--Checkout_Add_Address--Cross"></span>
                </div>
                <div className="Checkout_Add_Address--Header">
                  <h3>Add Delivery Address</h3>
                </div>
                <div className="Checkout_Add_Address--Address">
                  <div className="Checkout_Add_Address--Portion Checkout_Add_Address--Name">
                    <label>Address name</label>
                    <input
                      value={addressFullName}
                      onChange={(e) => {
                        setAddressFullName(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Checkout_Add_Address--Portion Checkout_Add_Address--House">
                    <label>House/Flat</label>
                    <input
                      value={addressHouse}
                      onChange={(e) => {
                        setAddressHouse(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Checkout_Add_Address--Portion Checkout_Add_Address--Street">
                    <label>Street</label>
                    <input
                      value={addressStreet}
                      onChange={(e) => {
                        setAddressStreet(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Checkout_Add_Address--Portion Checkout_Add_Address--Landmark">
                    <label>Landmark</label>
                    <input
                      value={addressLandmark}
                      onChange={(e) => {
                        setAddressLandmark(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Checkout_Add_Address--Portion Checkout_Add_Address--City">
                    <label>City</label>
                    <input
                      value={addressCity}
                      onChange={(e) => {
                        setAddressCity(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Checkout_Add_Address--Portion Checkout_Add_Address--State">
                    <label>State</label>
                    <input
                      value={addressState}
                      onChange={(e) => {
                        setAddressState(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Checkout_Add_Address--Portion Checkout_Add_Address--Country">
                    <label>Country</label>
                    <input
                      value={addressCountry}
                      onChange={(e) => {
                        setAddressCountry(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Checkout_Add_Address--Portion Checkout_Add_Address--Button">
                    <button onClick={addDeliveryAddress}>
                      Add Delivery Address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="Checkout_Header">
            <h1 className="Checkout_Header--Heading">Checkout</h1>
          </div>
          <div className="Checkout_Main">
            <div className="Checkout_Main--Products">
              <div className="Checkout_Products_Container">
                {cartData.map((product, index) => {
                  let totalPrice;
                  let actualPrice;
                  let price = product.final_price;
                  if (price.toString().split(".").length === 1) {
                    actualPrice = currencyConvert(price) + ".00";
                    totalPrice = currencyConvert(price * product.count) + ".00";
                  } else {
                    actualPrice =
                      currencyConvert(price.toString().split(".")[0]) +
                      "." +
                      price.toString().split(".")[1].padEnd(2, "0");
                    totalPrice =
                      currencyConvert(
                        (price * product.count).toString().split(".")[0]
                      ) +
                      "." +
                      (price * product.count)
                        .toString()
                        .split(".")[1]
                        .padEnd(2, "0");
                  }
                  return (
                    <div className="Checkout_Products--Product" key={index}>
                      <div className="Checkout_Products--Product_Image">
                        <img src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"></img>
                      </div>
                      <div className="Checkout_Products--Product_Details">
                        <p className="Checkout_Product_Details--Name">
                          {product.title}
                        </p>
                        <p className="Checkout_Product_Details--Price">
                          <span className="Checkout_Product_Details--Price_Symbol">
                            ₹
                          </span>
                          {actualPrice}
                        </p>
                        <div className="Checkout_Product_Details--Total_Cost">
                          <p className="Checkout_Product_Details--Quantity">
                            Qty: {product.count}
                          </p>
                          <p className="Checkout_Product_Details--Total">
                            <span className="Checkout_Product_Details--Total_Symbol">
                              ₹
                            </span>
                            {totalPrice}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="Checkout_Main--Info">
              <div className="Checkout_Info_Container">
                <div className="Checkout_Info--Header">
                  <h2>Order Details</h2>
                </div>
                <div className="Checkout_Info--Details">
                  <div className="Checkout_Info_Details--Address">
                    <h3 className="Checkout_Info_Address--Heading">
                      Delivery Address
                    </h3>
                    <p className="Checkout_Info_Address--Name">
                      {address?.addressname}
                    </p>
                    <p className="Checkout_Info_Address--House">
                      {address?.house}
                    </p>
                    <p className="Checkout_Info_Address--Street">
                      {address?.street}
                    </p>
                    <p className="Checkout_Info_Address--Landmark">
                      Near {address?.landmark}
                    </p>
                    <p className="Checkout_Info_Address--City_State">
                      {address?.city}, {address?.state}
                    </p>
                    <p className="Checkout_Info_Address--Country">
                      {address?.country}
                    </p>
                    <div className="Checkout_Info_Address--Button">
                      <button
                        onClick={() => {
                          setShowSelectAddress(true);
                        }}
                      >
                        Change Delivery Address
                      </button>
                    </div>
                  </div>
                  <div className="Checkout_Info_Details--Order">
                    <h3 className="Checkout_Info_Order--Heading">
                      Payment Summary
                    </h3>
                    <div className="Checkout_Info_Order--Quantity">
                      <p>Items:</p>
                      <p>{count}</p>
                    </div>
                    <div className="Checkout_Info_Order--Total">
                      <p>Total:</p>
                      <p>₹{totalCost}</p>
                    </div>
                    <div className="Checkout_Info_Order--Delivery">
                      <p>Delivery fee:</p>
                      <p>{freeDelivery ? "₹0" : "₹20"}</p>
                    </div>
                    <div className="Checkout_Info_Order--Final">
                      <p>Order total:</p>
                      <p>₹{orderTotal}</p>
                    </div>
                  </div>
                </div>
                <div className="Checkout_Info--Payment">
                  <p className="Checkout_Info--Payment_Note">
                    Thoroughly review your order details before proceeding to
                    payment!
                  </p>
                  <button
                    className="Checkout_Info--Payment_Button"
                    onClick={openPayment}
                  >
                    Proceed to Pay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
