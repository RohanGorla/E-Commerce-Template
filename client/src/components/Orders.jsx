import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const mailId = userInfo?.mailId;
    async function getorders() {
      let response = await axios.post("http://localhost:3000/getorders", {
        mail: mailId,
      });
      console.log(response);
      setOrders(response.data);
    }
    if (mailId) {
      getorders();
    }
  }, []);

  return (
    <div className="Orders_Container">
      {orders.length ? (
        <div className="Orders_Main"></div>
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
