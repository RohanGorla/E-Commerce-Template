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
        console.log(order);
        let address = JSON.parse(order.address) || {city: "city"};
        console.log(address);
        {
          /* let name = address?.addressname || "Blah"; */
        }
        return (
          <>
            <h2>{order.title}</h2>
            <p>{order.price}</p>
            <p>{order.discount}</p>
            <p>{address.city}</p>
          </>
        );
      })}
    </div>
  );
}

export default Orders;
