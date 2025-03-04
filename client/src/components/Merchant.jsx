import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Merchant.css";

function Merchant() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [shippedOrders, setShippedOrders] = useState([]);
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRevenueCurrency, setTotalRevenueCurrency] = useState("");
  const [totalStocks, setTotalStocks] = useState([]);
  const [totalStocksQuantity, setTotalStocksQuantity] = useState(0);
  const [lowStocks, setLowStocks] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
        let totalRevenue = 0;
        let totalRevenueCurrency;
        response.data.ordersData.forEach((order) => {
          totalRevenue += order.final_price * order.count;
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
          }
        });
        if (totalRevenue.toString().split(".").length !== 1) {
          totalRevenueCurrency =
            currencyConvert(totalRevenue.toString().split(".")[0]) +
            "." +
            totalRevenue.toString().split(".")[1].padEnd(2, "0");
        } else {
          totalRevenueCurrency = currencyConvert(totalRevenue) + ".00";
        }
        setTotalRevenue(totalRevenue);
        setTotalRevenueCurrency(totalRevenueCurrency);
        setTotalStocks(response.data.inventoryData);
        response.data.inventoryData.forEach((product) => {
          setTotalStocksQuantity((prev) => prev + product.stock_left);
          const stocksQuantity = product.stock_left;
          if (stocksQuantity <= product.stock_alert)
            setLowStocks((prev) => [...prev, product]);
          if (stocksQuantity === 0) setOutOfStock((prev) => [...prev, product]);
        });
      } else {
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
          if (response.data.logout) navigate("/merchant/merchantlogin");
        }, 3500);
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
    checkMerchantCredentials();
  }, []);

  return (
    <div className="Merchant_Page">
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
      <div className="Merchant_Main">
        {/* Merchant Header */}
        <div className="Merchant_Header">
          <h1 className="Merchant_Header--Title">Merchant Dashboard</h1>
        </div>
        {/* Merchant Dashboard */}
        <div className="Merchant_Dashboard">
          {/* Merchant Details Section */}
          <div className="Merchant_Dashboard--Section">
            <div className="Merchant_Dashboard_Details_And_Options">
              <div className="Merchant_Details">
                <p className="Merchant_Details--Company_Name">
                  {merchantInfo?.company}
                </p>
                <p className="Merchant_Details--Mail">{merchantInfo?.mailId}</p>
              </div>
              <div className="Merchant_Options">
                <button
                  className="Merchant_Options--MyAccount_Button"
                  onClick={() => {
                    navigate("/merchant/merchantdetails");
                  }}
                >
                  Merchant credentials
                </button>
                <button
                  className="Merchant_Options--Signout_Button"
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
                <div
                  className="Merchant_Dashboard--Item"
                  onClick={() => {
                    window.open(
                      `${window.location.origin}/merchant/orders/pending`
                    );
                  }}
                >
                  <p className="Merchant_Dashboard--Item--Text">
                    Pending Orders
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">
                    {pendingOrders.length}
                  </p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div
                  className="Merchant_Dashboard--Item"
                  onClick={() => {
                    window.open(
                      `${window.location.origin}/merchant/orders/shipped`
                    );
                  }}
                >
                  <p className="Merchant_Dashboard--Item--Text">
                    Shipped Orders
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">
                    {shippedOrders.length}
                  </p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div
                  className="Merchant_Dashboard--Item"
                  onClick={() => {
                    window.open(
                      `${window.location.origin}/merchant/orders/finished`
                    );
                  }}
                >
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
                <div
                  className="Merchant_Dashboard--Item"
                  onClick={() => {
                    window.open(
                      `${window.location.origin}/merchant/inventory/allinventory`
                    );
                  }}
                >
                  <p className="Merchant_Dashboard--Item--Text">
                    Total Stock Quantity
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">
                    {totalStocksQuantity}
                  </p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div
                  className="Merchant_Dashboard--Item"
                  onClick={() => {
                    window.open(
                      `${window.location.origin}/merchant/inventory/lowstock`
                    );
                  }}
                >
                  <p className="Merchant_Dashboard--Item--Text">Low On Stock</p>
                  <p className="Merchant_Dashboard--Item--Value">
                    {lowStocks.length}
                  </p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div
                  className="Merchant_Dashboard--Item"
                  onClick={() => {
                    window.open(
                      `${window.location.origin}/merchant/inventory/outofstock`
                    );
                  }}
                >
                  <p className="Merchant_Dashboard--Item--Text">Out Of Stock</p>
                  <p className="Merchant_Dashboard--Item--Value">
                    {outOfStock.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Merchant Products Section */}
          <div className="Merchant_Dashboard--Section">
            <h2 className="Merchant_Dashboard--Section_Name">Your Products</h2>
            <div className="Merchant_Dashboard--Grid">
              <div className="Merchant_Dashboard--Item_Container">
                <div
                  className="Merchant_Dashboard--Item"
                  onClick={() => {
                    window.open(`${window.location.origin}/merchant/products`);
                  }}
                >
                  <p className="Merchant_Dashboard--Item--Text">All Products</p>
                  <p className="Merchant_Dashboard--Item--Value">
                    {totalStocks.length}
                  </p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div
                  className="Merchant_Dashboard--Item"
                  onClick={() => {
                    window.open(
                      `${window.location.origin}/merchant/addproduct`
                    );
                  }}
                >
                  <p className="Merchant_Dashboard--Item--Text">
                    + Add New Product
                  </p>
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
