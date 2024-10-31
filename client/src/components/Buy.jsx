import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Buy.css";

function Buy() {
  const [productData, setProductData] = useState({});
  const [addressData, setAddressData] = useState([]);
  const [showSelectAddress, setShowSelectAddress] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressFullName, setAddressFullName] = useState("");
  const [addressHouse, setAddressHouse] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productTotal, setProductTotal] = useState("");
  const [orderTotal, setOrderTotal] = useState("");
  const [orderTotalNumber, setOrderTotalNumber] = useState(0);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [resOrderId, setResOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [signature, setSignature] = useState("");
  const [initiatePayment, setInitiatePayment] = useState(false);
  const [time, setTime] = useState(30);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const address = JSON.parse(localStorage.getItem("address"));
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const mailId = userInfo?.mailId;
  const order = JSON.parse(sessionStorage.getItem("order"));

  /* Get Buy Product API */

  async function getProduct() {
    let response = await axios.post(`${import.meta.env.VITE_BASE_URL}/getbuyproduct`, {
      mail: mailId,
    });
    if (response.data.access) {
      let data = response.data.data[0];
      let cost = data.price * (1 - data.discount / 100);
      let total = cost * data.count;
      let priceCurrency;
      let totalCurrency;
      let orderTotalCurrency;
      if (cost.toString().split(".").length === 1) {
        priceCurrency = currencyConvert(cost) + ".00";
        totalCurrency = currencyConvert(cost * data.count) + ".00";
        if (total > 500) {
          setFreeDelivery(true);
          setOrderTotal(totalCurrency);
          setOrderTotalNumber(total);
        } else {
          setFreeDelivery(false);
          orderTotalCurrency = currencyConvert(total + 20) + ".00";
          setOrderTotal(orderTotalCurrency);
          setOrderTotalNumber(total + 20);
        }
      } else {
        priceCurrency =
          currencyConvert(
            (Math.round(cost * 100) / 100).toString().split(".")[0]
          ) +
          "." +
          (Math.round(cost * 100) / 100)
            .toString()
            .split(".")[1]
            .padEnd(2, "0");
        totalCurrency =
          currencyConvert(
            (Math.round(total * 100) / 100).toString().split(".")[0]
          ) +
          "." +
          (Math.round(total * 100) / 100)
            .toString()
            .split(".")[1]
            .padEnd(2, "0");
        if (total > 500) {
          setFreeDelivery(true);
          setOrderTotal(totalCurrency);
          setOrderTotalNumber(Math.round(total * 100) / 100);
        } else {
          setFreeDelivery(false);
          orderTotalCurrency =
            currencyConvert(
              (Math.round((total + 20) * 100) / 100).toString().split(".")[0]
            ) +
            "." +
            (Math.round((total + 20) * 100) / 100)
              .toString()
              .split(".")[1]
              .padEnd(2, "0");
          setOrderTotal(orderTotalCurrency);
          setOrderTotalNumber(total + 20);
        }
      }
      setProductTotal(totalCurrency);
      setProductPrice(priceCurrency);
      setProductData(data);
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  /* Place Buy Order API */

  async function placeBuyOrder() {
    let response = await axios.post(`${import.meta.env.VITE_BASE_URL}/placebuyorder`, {
      mail: mailId,
      product: productData,
      address: address,
    });
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
    }
  }

  /* Initiate Payment API */

  async function openPayment() {
    if (address) {
      let response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/initiatebuypayment`,
        {
          mail: mailId,
        }
      );
      let amount = Math.round(orderTotalNumber * 100);
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
            placeBuyOrder();
          },
          notes: {
            address: "Razorpay Corporate Office",
          },
          theme: {
            color: "#3399cc",
          },
        };
        setInitiatePayment(true);
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTime(() => {
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

  /* Address APIs */

  async function getAddress() {
    let response = await axios.post(`${import.meta.env.VITE_BASE_URL}/getaddress`, {
      mail: mailId,
    });
    setAddressData(response.data.data);
  }

  async function addDeliveryAddress() {
    let response = await axios.post(`${import.meta.env.VITE_BASE_URL}/addaddress`, {
      mail: mailId,
      name: addressFullName,
      house: addressHouse,
      street: addressStreet,
      landmark: addressLandmark,
      city: addressCity,
      state: addressState,
      country: addressCountry,
    });
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
    } else {
      setSuccess(false);
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
    setShowAddAddress(false);
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

  /* Number to Currency Converter */

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
    getAddress();
    getProduct();
  }, []);

  return (
    <div className="Buy_Page">
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
      {/* Buy Page Main */}
      {initiatePayment ? (
        <div
          className={
            order?.orderPlaced
              ? "Buy_Order_Placed"
              : "Buy_Order_Placed--Inactive"
          }
        >
          <p className="Buy_Order_Placed--Success">
            Your order has been placed successfully! You can view all your order
            details in the 'Your orders' section in Your account.
          </p>
          <p className="Buy_Order_Placed--Timer">
            You can close this tab now or it will be closed automatically in{" "}
            {time}
            seconds.
          </p>
        </div>
      ) : (
        <div className="Buy_Main_Container">
          <div
            className={
              showSelectAddress
                ? "Buy_Select_Address"
                : "Buy_Select_Address--Inactive"
            }
          >
            <div className="Buy_Select_Address--Tint"></div>
            <div className="Buy_Select_Address--Address_Container">
              <div className="Buy_Select_Address--Address_Subcontainer">
                <div
                  className="Close--Buy_Select_Address"
                  onClick={() => {
                    setShowSelectAddress(false);
                  }}
                >
                  <span className="Close--Buy_Select_Address--Cross"></span>
                </div>
                <div className="Buy_Select_Address--Header">
                  <h3>Select Delivery Address</h3>
                </div>
                {addressData.length ? (
                  addressData.map((address, index) => {
                    return (
                      <div key={index} className="Buy_Select_Address--Address">
                        <p className="Buy_Select_Address--Name">
                          {address.addressname}
                        </p>
                        <p className="Buy_Select_Address--House">
                          {address.house}
                        </p>
                        <p className="Buy_Select_Address--Street">
                          {address.street}
                        </p>
                        <p className="Buy_Select_Address--Landmark">
                          Near {address.landmark}
                        </p>
                        <p className="Buy_Select_Address--City_State">
                          {address.city}, {address.state}
                        </p>
                        <p className="Buy_Select_Address--Country">
                          {address.country}
                        </p>
                        <div className="Buy_Select_Address--Button">
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
                  <div className="Buy_Select_Address--Empty">
                    <p className="Buy_Select_Address--Empty--Note">
                      You have not added any delivery address. Add an address to
                      ship your order!
                    </p>
                    <button
                      className="Buy_Select_Address--Empty--Button"
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
              showAddAddress ? "Buy_Add_Address" : "Buy_Add_Address--Inactive"
            }
          >
            <div className="Buy_Add_Address--Tint"></div>
            <div className="Buy_Add_Address--Container">
              <div className="Buy_Add_Address--Subcontainer">
                <div
                  className="Close--Buy_Add_Address"
                  onClick={() => {
                    setShowAddAddress(false);
                  }}
                >
                  <span className="Close--Buy_Add_Address--Cross"></span>
                </div>
                <div className="Buy_Add_Address--Header">
                  <h3>Add Delivery Address</h3>
                </div>
                <div className="Buy_Add_Address--Address">
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--Name">
                    <label>Address name</label>
                    <input
                      value={addressFullName}
                      onChange={(e) => {
                        setAddressFullName(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--House">
                    <label>House/Flat</label>
                    <input
                      value={addressHouse}
                      onChange={(e) => {
                        setAddressHouse(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--Street">
                    <label>Street</label>
                    <input
                      value={addressStreet}
                      onChange={(e) => {
                        setAddressStreet(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--Landmark">
                    <label>Landmark</label>
                    <input
                      value={addressLandmark}
                      onChange={(e) => {
                        setAddressLandmark(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--City">
                    <label>City</label>
                    <input
                      value={addressCity}
                      onChange={(e) => {
                        setAddressCity(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--State">
                    <label>State</label>
                    <input
                      value={addressState}
                      onChange={(e) => {
                        setAddressState(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--Country">
                    <label>Country</label>
                    <input
                      value={addressCountry}
                      onChange={(e) => {
                        setAddressCountry(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--Button">
                    <button onClick={addDeliveryAddress}>
                      Add Delivery Address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="Buy_Header">
            <h1 className="Buy_Header--Heading">Checkout</h1>
          </div>
          <div className="Buy_Main">
            <div className="Buy_Main--Products">
              <div className="Buy_Products_Container">
                <div className="Buy_Products--Product">
                  <div className="Buy_Products--Product_Image">
                    <img src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"></img>
                  </div>
                  <div className="Buy_Products--Product_Details">
                    <p className="Buy_Product_Details--Name">
                      {productData.title}
                    </p>
                    <p className="Buy_Product_Details--Price">
                      <span className="Buy_Product_Details--Price_Symbol">
                        ₹
                      </span>
                      {productPrice}
                    </p>
                    <div className="Buy_Product_Details--Total_Cost">
                      <p className="Buy_Product_Details--Quantity">
                        Qty: {productData.count}
                      </p>
                      <p className="Buy_Product_Details--Total">
                        <span className="Buy_Product_Details--Total_Symbol">
                          ₹
                        </span>
                        {productTotal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="Buy_Main--Info">
              <div className="Buy_Info_Container">
                <div className="Buy_Info--Header">
                  <h2>Order Details</h2>
                </div>
                <div className="Buy_Info--Details">
                  <div className="Buy_Info_Details--Address">
                    <h3 className="Buy_Info_Address--Heading">
                      Delivery Address
                    </h3>
                    <p className="Buy_Info_Address--Name">
                      {address?.addressname}
                    </p>
                    <p className="Buy_Info_Address--House">{address?.house}</p>
                    <p className="Buy_Info_Address--Street">
                      {address?.street}
                    </p>
                    <p className="Buy_Info_Address--Landmark">
                      Near {address?.landmark}
                    </p>
                    <p className="Buy_Info_Address--City_State">
                      {address?.city}, {address?.state}
                    </p>
                    <p className="Buy_Info_Address--Country">
                      {address?.country}
                    </p>
                    <div className="Buy_Info_Address--Button">
                      <button
                        onClick={() => {
                          setShowSelectAddress(true);
                        }}
                      >
                        Change Delivery Address
                      </button>
                    </div>
                  </div>
                  <div className="Buy_Info_Details--Order">
                    <h3 className="Buy_Info_Order--Heading">Payment Summary</h3>
                    <div className="Buy_Info_Order--Quantity">
                      <p>Quantity:</p>
                      <p>{productData.count}</p>
                    </div>
                    <div className="Buy_Info_Order--Total">
                      <p>Total:</p>
                      <p>₹{productTotal}</p>
                    </div>
                    <div className="Buy_Info_Order--Delivery">
                      <p>Delivery fee:</p>
                      <p>{freeDelivery ? "₹0" : "₹20"}</p>
                    </div>
                    <div className="Buy_Info_Order--Final">
                      <p>Order total:</p>
                      <p>₹{orderTotal}</p>
                    </div>
                  </div>
                </div>
                <div className="Buy_Info--Payment">
                  <p className="Buy_Info--Payment_Note">
                    Thoroughly review your order details before proceeding to
                    payment!
                  </p>
                  <button
                    className="Buy_Info--Payment_Button"
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

export default Buy;
