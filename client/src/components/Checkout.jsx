import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Checkout.css";

function Checkout() {
  const [cartData, setCartData] = useState([]);
  const [addressData, setAddressData] = useState([]);
  const [showAddress, setShowAddress] = useState(true);
  const [count, setCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const address = JSON.parse(localStorage.getItem("address"));

  async function placeOrder() {
    const mailId = userInfo?.mailId;
    let orders = await axios.post("http://localhost:3000/placeorder", {
      mail: mailId,
    });
    console.log(orders);
  }

  async function changeBaseAddress(current) {
    let response = await axios.put("http://localhost:3000/updatebaseaddress", {
      address: current,
      mailId: userInfo.mailId,
    });
    console.log(response);
    if (response.data.access) {
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...userInfo, base_address: current.addressname })
      );
      localStorage.setItem("address", JSON.stringify(current));
    }
    setShowAddress(false);
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
    return finalAmount;
  }

  useEffect(() => {
    const mailId = userInfo?.mailId;
    const token = userInfo?.token;
    async function getAddress() {
      let response = await axios.post("http://localhost:3000/getaddress", {
        mail: mailId,
      });
      console.log(response);
      setAddressData(response.data);
    }
    getAddress();
    async function checkAuthorized() {
      let response = await axios.post("http://localhost:3000/checkauthorized", {
        mail: mailId,
        token: token,
      });
      if (response.data.access) {
        setCartData(response.data.data);
        let count = 0;
        let totalCost = 0;
        response.data.data.forEach((product) => {
          count += Number(product.count);
          totalCost +=
            Number(product.count) *
            (
              Number(product.price) *
              (1 - Number(product.discount) / 100)
            ).toFixed(2);
        });
        let totalCostCurrency =
          currencyConvert(totalCost.toString().split(".")[0]) +
          "." +
          totalCost.toString().split(".")[1];
        if (totalCost > 500) {
          setOrderTotal(totalCostCurrency);
          setFreeDelivery(true);
        } else {
          let orderTotal =
            currencyConvert((totalCost + 20).toString().split(".")[0]) +
            "." +
            (totalCost + 20).toString().split(".")[1];
          setOrderTotal(orderTotal);
          setFreeDelivery(false);
        }
        setCount(count);
        setTotalCost(totalCostCurrency);
      }
    }
    if (mailId && token) {
      checkAuthorized();
    }
  }, []);

  return (
    <div className="Checkout_Main_Container">
      <div
        className={
          showAddress
            ? "Checkout_Select_Address"
            : "Checkout_Select_Address--Inactive"
        }
      >
        <div className="Checkout_Select_Address--Tint"></div>
        {addressData.length ? (
          <div className="Checkout_Select_Address--Address_Container">
            <div className="Checkout_Select_Address--Address_Subcontainer">
              <div
                className="Close--Checkout_Select_Address"
                onClick={() => {
                  setShowAddress(false);
                }}
              >
                <span className="Close--Checkout_Select_Address--Cross"></span>
              </div>
              <div className="Checkout_Select_Address--Header">
                <h3>Select Delivery Address</h3>
              </div>
              {addressData.map((address, index) => {
                return (
                  <div key={index} className="Checkout_Select_Address--Address">
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
              })}
            </div>
          </div>
        ) : (
          <div className="Checkout_Select_Address--No_Address"></div>
        )}
      </div>
      <div className="Checkout_Header">
        <h1 className="Checkout_Header--Heading">Checkout</h1>
      </div>
      <div className="Checkout_Main">
        <div className="Checkout_Main--Products">
          <div className="Checkout_Products_Container">
            {cartData.map((product, index) => {
              let price = (
                product.price -
                (product.price * product.discount) / 100
              ).toFixed(2);
              let actualPrice =
                currencyConvert(price.split(".")[0]) +
                "." +
                price.split(".")[1].toString();
              let totalPrice = price * product.count;
              let actualTotal =
                currencyConvert(totalPrice.toString().split(".")[0]) +
                "." +
                totalPrice.toString().split(".")[1].toString();
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
                        {actualTotal}
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
                  {address.addressname}
                </p>
                <p className="Checkout_Info_Address--House">{address.house}</p>
                <p className="Checkout_Info_Address--Street">
                  {address.street}
                </p>
                <p className="Checkout_Info_Address--Landmark">
                  Near {address.landmark}
                </p>
                <p className="Checkout_Info_Address--City_State">
                  {address.city}, {address.state}
                </p>
                <p className="Checkout_Info_Address--Country">
                  {address.country}
                </p>
                <div className="Checkout_Info_Address--Button">
                  <button
                    onClick={() => {
                      setShowAddress(true);
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
              <button className="Checkout_Info--Payment_Button">
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
