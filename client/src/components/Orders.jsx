import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [showAddressId, setShowAddressId] = useState(-1);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

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
    async function getorders() {
      let response = await axios.post("http://localhost:3000/getorders", {
        mail: mailId,
      });
      if (response.data.access) {
        setOrders(response.data.ordersData);
      } else {
        console.log(response.data.errorMsg);
      }
    }
    getorders();
  }, []);

  return (
    <div
      className="Orders_Container"
      onClick={(e) => {
        setShowAddress(false);
        setShowAddressId(-1);
      }}
    >
      {orders.length ? (
        <div className="Orders_Main">
          <div className="Orders_Main--Header">
            <h1>Your Orders</h1>
          </div>
          <div className="Orders_Main--Orders">
            {orders.map((order, index) => {
              let address = JSON.parse(order.address);
              let cost = order.price - (order.price * order.discount) / 100;
              let orderTotal = order.count * cost;
              let costCurrency;
              let orderCurrency;
              if (cost.toString().split(".").length === 1) {
                costCurrency =
                  currencyConvert(cost.toString().split(".")[0]) + ".00";
                orderCurrency =
                  currencyConvert(orderTotal.toString().split(".")[0]) + ".00";
              } else {
                costCurrency =
                  currencyConvert(cost.toString().split(".")[0]) +
                  "." +
                  cost.toString().split(".")[1];
                orderCurrency =
                  currencyConvert(orderTotal.toString().split(".")[0]) +
                  "." +
                  orderTotal.toString().split(".")[1];
              }
              return (
                <div className="Orders_Main--Order_Container" key={index}>
                  <div className="Orders_Main--Order_Image">
                    <img
                      src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
                      onClick={() => {
                        window.open(
                          `${window.location.origin}/products/product/${order.productid}`
                        );
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
                    {/* <p className="Orders_Main--Order_Price">
                      <span className="Orders_Main--Order_Price--Symbol">
                        ₹
                      </span>
                      {costCurrency}
                    </p> */}
                    <p className="Orders_Main--Order_Count">
                      Qty: {order.count}
                    </p>
                    <p className="Orders_Main--Order_Total">
                      Order total: ₹{orderCurrency}
                    </p>
                    <p className="Orders_Main--Order_Delivery--Date">
                      Arriving on `Delivery date`
                    </p>
                    <div className="Orders_Main--Order_Delivery--Address_Container">
                      <div
                        className={
                          showAddress
                            ? order.productid == showAddressId
                              ? "Orders_Main--Order_Delivery--Address_Details"
                              : "Orders_Main--Order_Delivery--Address_Details--Inactive"
                            : "Orders_Main--Order_Delivery--Address_Details--Inactive"
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
                        {/* <p className="Orders_Main--Order_Delivery--Address_Details--Landmark">
                          {address.landmark}
                        </p> */}
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
