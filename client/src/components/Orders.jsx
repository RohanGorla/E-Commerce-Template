import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import altImgUrl from "../assets/alternateImage.js";
import "../styles/Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loadedImages, setLoadedImages] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [showAddressId, setShowAddressId] = useState(-1);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const mailId = userInfo?.mailId;

  /* GET PRODUCT IMAGE URLS FROM S3 */

  async function getImageUrls(imageKeys) {
    const getUrlResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/generategeturls`,
      { imageKeys: [imageKeys[0]] }
    );
    const getUrls = getUrlResponse.data;
    return getUrls;
  }

  /* Get Orders API */

  async function getorders() {
    let response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getorders`,
      {
        mail: mailId,
      }
    );
    if (response.data.access) {
      const ordersData = response.data.data;
      for (let i = 0; i < ordersData.length; i++) {
        if (JSON.parse(ordersData[i]?.imageTags).length)
          ordersData[i].imageUrl = await getImageUrls(
            JSON.parse(ordersData[i].imageTags)
          );
      }
      setOrders(ordersData);
    } else {
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
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

  function deliveryDateCalculator(date) {
    const deliveryDate = new Date(date);
    const deliveryDateString = deliveryDate.toDateString();
    const deliveryDateDisplay = `${deliveryDateString.split(" ")[0]}, ${
      deliveryDateString.split(" ")[1]
    } ${deliveryDateString.split(" ")[2]}, ${deliveryDateString.split(" ")[3]}`;
    return deliveryDateDisplay;
  }

  useEffect(() => {
    getorders();
  }, []);

  return (
    <div
      className="Orders_Container"
      onClick={() => {
        setShowAddress(false);
        setShowAddressId(-1);
      }}
    >
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
      {/* Orders */}
      {orders.length ? (
        <div className="Orders_Main">
          <div className="Orders_Main--Header">
            <h1>Your Orders</h1>
          </div>
          <div className="Orders_Main--Orders">
            {orders.map((order, index) => {
              let address = JSON.parse(order.address);
              let cost = order.final_price;
              let orderTotal = order.count * cost;
              let orderCurrency;
              const deliveryDate = deliveryDateCalculator(order.delivery_date);
              if (cost.toString().split(".").length === 1) {
                if (orderTotal > 500) {
                  orderCurrency = currencyConvert(orderTotal) + ".00";
                } else {
                  orderCurrency = currencyConvert(orderTotal + 20) + ".00";
                }
              } else {
                if (orderTotal > 500) {
                  orderCurrency =
                    currencyConvert(
                      (Math.round(orderTotal * 100) / 100)
                        .toString()
                        .split(".")[0]
                    ) +
                    "." +
                    (Math.round(orderTotal * 100) / 100)
                      .toString()
                      .split(".")[1]
                      .padEnd(2, "0");
                } else {
                  orderCurrency =
                    currencyConvert(
                      (Math.round((orderTotal + 20) * 100) / 100)
                        .toString()
                        .split(".")[0]
                    ) +
                    "." +
                    (Math.round((orderTotal + 20) * 100) / 100)
                      .toString()
                      .split(".")[1]
                      .padEnd(2, "0");
                }
              }
              return (
                <div className="Orders_Main--Order_Container" key={index}>
                  <div className="Orders_Main--Order_Image">
                    <img
                      src={
                        order.imageUrl &&
                        loadedImages.includes(JSON.parse(order.imageTags)[0])
                          ? order.imageUrl[0].imageUrl
                          : `data:image/jpeg;base64,${altImgUrl}`
                      }
                      onClick={() => {
                        window.open(
                          `${window.location.origin}/products/product/${order.productid}`
                        );
                      }}
                      onLoad={() => {
                        const imageTag = JSON.parse(order.imageTags)[0];
                        if (!loadedImages.includes(imageTag))
                          setLoadedImages((prev) => [...prev, imageTag]);
                      }}
                    ></img>
                  </div>
                  <div className="Orders_Main--Order_Details">
                    <p
                      className="Orders_Main--Order_Name"
                      onClick={() => {
                        window.open(
                          `${window.location.origin}/products/product/${order.productid}`
                        );
                      }}
                    >
                      {order.title}
                    </p>
                    <p className="Orders_Main--Order_Count">
                      Qty: {order.count}
                    </p>
                    <p className="Orders_Main--Order_Total">
                      Order total: ₹{orderCurrency}
                    </p>
                    <p className="Orders_Main--Order_Status">
                      Order status -{" "}
                      <span className="Orders_Main--Order_Status--Status">
                        {order.order_status}
                      </span>
                    </p>
                    <p className="Orders_Main--Order_Delivery--Date">
                      Arriving on {deliveryDate}
                    </p>
                    <div className="Orders_Main--Order_Delivery--Address_Container">
                      <div
                        className={
                          showAddress
                            ? order.productid == showAddressId
                              ? "Orders_Main--Order_Delivery--Address_Details Orders_Main--Order_Delivery--Address_Details--Active"
                              : "Orders_Main--Order_Delivery--Address_Details Orders_Main--Order_Delivery--Address_Details--Inactive"
                            : "Orders_Main--Order_Delivery--Address_Details Orders_Main--Order_Delivery--Address_Details--Inactive"
                        }
                        onClick={(e) => {
                          setShowAddress(true);
                          setShowAddressId(order.productid);
                          e.stopPropagation();
                        }}
                      >
                        <p className="Orders_Main--Order_Delivery--Address_Details--Name">
                          {address.addressname}
                        </p>
                        <p className="Orders_Main--Order_Delivery--Address_Details--House">
                          {address.house}
                        </p>
                        <p className="Orders_Main--Order_Delivery--Address_Details--Street">
                          {address.street}
                        </p>
                        <p className="Orders_Main--Order_Delivery--Address_Details--City">
                          {address.city}, {address.state}
                        </p>
                        <p className="Orders_Main--Order_Delivery--Address_Details--Country">
                          {address.country}
                        </p>
                      </div>
                      <p className="Orders_Main--Order_Delivery--Address">
                        Delivery address -
                        <span
                          className="Orders_Main--Order_Delivery--Address_Name"
                          onClick={(e) => {
                            if (order.productid == showAddressId) {
                              setShowAddress(false);
                              setShowAddressId(-1);
                            } else {
                              setShowAddress(true);
                              setShowAddressId(order.productid);
                            }
                            e.stopPropagation();
                          }}

                          // If Hover Function Is Preferred Use Below Code

                          // onMouseOver={() => {
                          //   setShowAddress(true);
                          //   setShowAddressId(order.productid);
                          // }}
                          // onMouseLeave={() => {
                          //   setTimeout(() => {
                          //     setShowAddress(false);
                          //     setShowAddressId(-1);
                          //   }, 300);
                          // }}
                        >
                          {address.addressname}
                          <span className="Orders_Main--Order_Delivery--Address_Show"></span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="Orders_Empty">
          <p className="Orders_Empty--Header">You do not have any orders!</p>
          <p className="Orders_Empty--Note">
            You have not placed any orders yet. Once you successfully place an
            order, the order details will be shown here!
          </p>
          <button
            className="Orders_Empty--Button"
            onClick={() => {
              navigate("/products");
            }}
          >
            Go shopping
          </button>
        </div>
      )}
    </div>
  );
}

export default Orders;
