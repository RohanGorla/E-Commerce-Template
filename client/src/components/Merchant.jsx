import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../styles/Merchant.css";

function Merchant() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [shippedOrders, setShippedOrders] = useState([]);
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRevenueCurrency, setTotalRevenueCurrency] = useState("");
  const navigate = useNavigate();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));

  /* Check Merchant Mail And Token Validity */

  async function checkMerchantCredentials() {
    if (merchantInfo?.mailId && merchantInfo?.token) {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/checkmerchant`,
        {
          mail: merchantInfo.mailId,
          token: merchantInfo.token,
          company: merchantInfo.company,
        }
      );
      if (response.data.access) {
        console.log("Orders details -> ", response.data.ordersData);
        let totalRevenue = 0;
        let totalRevenueCurrency;
        response.data.ordersData.forEach((order) => {
          const finalPrice = order.price * (1 - order.discount / 100);
          totalRevenue += Math.round(finalPrice * 100) / 100;
          const orderStatus = order.order_status;
          switch (orderStatus) {
            case "Order placed":
              setPendingOrders((prev) => [...prev, order]);
              break;
            case "Order shipped":
              setShippedOrders((prev) => [...prev, order]);
              break;
            case "Order delivered":
              setFinishedOrders((prev) => [...prev, order]);
              break;
            default:
              break;
          }
        });
        if (totalRevenue.toString().split(".").length !== 1) {
          totalRevenueCurrency =
            currencyConvert(totalRevenue.toString().split(".")[0]) +
            "." +
            totalRevenue.toString().split(".")[1];
        } else {
          totalRevenueCurrency = currencyConvert(totalRevenue) + ".00";
        }
        setTotalRevenue(totalRevenue);
        setTotalRevenueCurrency(totalRevenueCurrency);
        console.log("Inventory details -> ", response.data.inventoryData);
      } else {
        navigate("/mercahnt/merchantlogin");
      }
    } else {
      navigate("/merchant/merchantlogin");
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

  useEffect(() => {
    // checkMerchantCredentials();
  }, []);

  return (
    <div className="Merchant_Page" onClick={checkMerchantCredentials}>
      <div className="Merchant_Main">
        {/* Merchant Header */}
        <div className="Merchant_Header">
          <h1 className="Merchant_Header--Title">Merchant Dashboard</h1>
        </div>
        {/* Merchant Dashboard */}
        <div className="Merchant_Dashboard">
          {/* Merchant Details Section */}
          <div className="Merchant_Dashboard--Section">
            <div className="Merchant_Dashboard_Details_And_Signout">
              <div className="Merchant_Details">
                <p className="Merchant_Details--Company_Name">
                  {merchantInfo?.company}
                </p>
                <p className="Merchant_Details--Mail">{merchantInfo?.mailId}</p>
              </div>
              <div className="Merchant_Signout">
                <button
                  className="Merchant_Signout--Button"
                  onClick={() => {
                    localStorage.removeItem("merchantInfo");
                    navigate("merchantregister");
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
          {/* Merchant Sales Info Section */}
          <div className="Merchant_Dashboard--Section">
            <h2 className="Merchant_Dashboard--Section_Name">Sales Overview</h2>
            <div className="Merchant_Dashboard--Grid">
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">
                    Pending Orders
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">
                    {pendingOrders.length}
                  </p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">
                    Shipped Orders
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">
                    {shippedOrders.length}
                  </p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">
                    Finished Orders
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">
                    {finishedOrders.length}
                  </p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">
                    Revenue Generated
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">
                    ₹{totalRevenueCurrency}
                  </p>
                </div>
              </div>
              {/* <div className="Merchant_Dashboard--Item_Container">
              <div className="Merchant_Dashboard--Item">
                <p>Inventory Management</p>
              </div>
            </div> */}
            </div>
          </div>
          {/* Merchant Inventory Management Section */}
          <div className="Merchant_Dashboard--Section">
            <h2 className="Merchant_Dashboard--Section_Name">
              Inventory Management
            </h2>
            <div className="Merchant_Dashboard--Grid">
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">
                    Total Stock Quantity
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">100</p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">Low On Stock</p>
                  <p className="Merchant_Dashboard--Item--Value">34</p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">Out Of Stock</p>
                  <p className="Merchant_Dashboard--Item--Value">2</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Merchant;
