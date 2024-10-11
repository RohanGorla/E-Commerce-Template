import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Orders() {
  const [orders, setOrders] = useState([]);
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
    <div>
      {orders.map((order) => {
        return (
          <>
            <h2>{order.title}</h2>
            <p>{order.price}</p>
            <p>{order.discount}</p>
          </>
        );
      })}
    </div>
  );
}

export default Orders;
