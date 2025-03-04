import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import altImgUrl from "../assets/alternateImage.js";
import "../styles/MerchantOrders.css";

function MerchantOrders() {
  const { status } = useParams();
  const navigate = useNavigate();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const [orders, setOrders] = useState([]);
  const [loadedImages, setLoadedImages] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  /* GET PRODUCT IMAGE URLS FROM S3 */

  async function getImageUrls(imageKeys) {
    const getUrlResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/generategeturls`,
      { imageKeys: [imageKeys[0]] }
    );
    const getUrls = getUrlResponse.data;
    return getUrls;
  }

  async function getPendingOrders() {
    const company = merchantInfo?.company;
    if (company) {
      let orderStatus;
      switch (status) {
        case "pending":
          orderStatus = "Order placed";
          break;
        case "shipped":
          orderStatus = "Order shipped";
          break;
        case "finished":
          orderStatus = "Order finished";
          break;
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/getmerchantorders`,
        {
          company: company,
          orderStatus: orderStatus,
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
    } else {
      navigate("/merchant/merchantlogin");
    }
  }

  async function markAsShipped(id) {
    const orderId = id;
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/markasshipped`,
      {
        orderId,
      }
    );
    if (response.data.access) {
      setSuccess(true);
      setSuccessMessage(response.data.successMsg);
      setTimeout(() => {
        setSuccess(false);
      }, 3500);
      const updatedOrders = orders.filter((order) => order.id !== id);
      setOrders(updatedOrders);
    } else {
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  useEffect(() => {
    getPendingOrders();
  }, []);

  return (
    <div className="MerchantOrders_Page">
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
      {/* Merchant Orders Section */}
      <div className="MerchantOrders_Main">
        <div className="MerchantOrders_Header">
          <h1 className="MerchantOrders_Header--Title">
            {status[0].toUpperCase()}
            {status.slice(1)} Orders
          </h1>
        </div>
        <div
          className={
            orders.length
              ? "MerchantOrders_Empty_Container--Inactive"
              : "MerchantOrders_Empty_Container"
          }
        >
          <div className="MerchantOrders_Empty">
            <p className="MerchantOrders_Empty--Header">No {status} orders!</p>
            <p className="MerchantOrders_Empty--Text">
              Your {status} orders list is empty for now. As orders transition
              to {status} status, they'll appear here automatically.
            </p>
          </div>
        </div>
        <div
          className={
            orders.length
              ? "MerchantOrders_Container"
              : "MerchantOrders_Container--Inactive"
          }
        >
          {orders.map((order, index) => {
            const deliveryAddress = JSON.parse(order.address);
            return (
              <div className="MerchantOrders_Order" key={index}>
                <div className="MerchantOrders_Order_Image">
                  <img
                    src={
                      order.imageUrl &&
                      loadedImages.includes(JSON.parse(order.imageTags)[0])
                        ? order.imageUrl[0].imageUrl
                        : `data:image/jpeg;base64,${altImgUrl}`
                    }
                    onLoad={() => {
                      const imageTag = JSON.parse(order.imageTags)[0];
                      if (!loadedImages.includes(imageTag))
                        setLoadedImages((prev) => [...prev, imageTag]);
                    }}
                  ></img>
                </div>
                <div className="MerchantOrders_Order_Details">
                  <p className="MerchantOrders_Order_Details--Name">
                    {order.title}
                  </p>
                  <p className="MerchantOrders_Order_Details--Quantity">
                    Qty: {order.count}
                  </p>
                  <p className="MerchantOrders_Order_Details--Delivery_Address--Heading">
                    Delivery Address:
                  </p>
                  <p className="MerchantOrders_Order_Details--Delivery_Address--Section">
                    {deliveryAddress.house},
                  </p>
                  <p className="MerchantOrders_Order_Details--Delivery_Address--Section">
                    {deliveryAddress.street},
                  </p>
                  <p className="MerchantOrders_Order_Details--Delivery_Address--Section">
                    {deliveryAddress.city},
                  </p>
                  <p className="MerchantOrders_Order_Details--Delivery_Address--Section">
                    {deliveryAddress.state}, {deliveryAddress.country}.
                  </p>
                  <button
                    className={
                      status == "pending"
                        ? "MerchantOrders_Order_Details--Button"
                        : "MerchantOrders_Order_Details--Button--Inactive"
                    }
                    onClick={() => {
                      markAsShipped(order.id);
                    }}
                  >
                    Mark As Shipped
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MerchantOrders;
