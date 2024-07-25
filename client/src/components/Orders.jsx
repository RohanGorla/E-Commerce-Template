import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Orders() {
  const [orders, sestOrders] = useState([]);

  useEffect(() => {
    const mail = localStorage.getItem("mailId");
    async function getorders() {
      let response = await axios.post("http://localhost:3000/getorders", {
        mail: mail,
      });
      console.log(response);
      sestOrders(response.data);
    }
    if (mail) {
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
