import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/MerchantOrders.css";

function MerchantOrders() {
  const { status } = useParams();
  const navigate = useNavigate();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function getPendingOrders() {
    const company = merchantInfo?.company;
    if (company) {
      let orderStatus;
      switch (status) {
        case "pending":
          orderStatus = "Order placed";
          break;
        case "shipped":
          orderStatus = "Shipped orders";
          break;
        case "finished":
          orderStatus = "Finished orders";
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
        // console.log(response.data.data.address);
        // response.data.data.address = deliveryAddress;
        setOrders(response.data.data);
        console.log(response.data.data);
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
        <div className="MerchantOrders_Orders--Container">
          {orders.map((order, index) => {
            const deliveryAddress = JSON.parse(order.address);
            return (
              <div className="MerchantOrders_Orders--Order" key={index}>
                <div className="MerchantOrders_Orders--Order_Image">
                  <img src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"></img>
                </div>
                <div className="MerchantOrders_Orders--Order_Details">
                  <p>{order.title}</p>
                  <p>{order.price}</p>
                  <p>{order.count}</p>
                  <p>Delivery Address:</p>
                  <p>{deliveryAddress.house}</p>
                  <p>{deliveryAddress.street}</p>
                  <p>{deliveryAddress.city}</p>
                  <p>{deliveryAddress.state}</p>
                  <p>{deliveryAddress.country}</p>
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
