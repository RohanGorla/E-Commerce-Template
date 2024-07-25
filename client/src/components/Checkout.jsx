import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Checkout() {
  const [data, setData] = useState([]);
  useEffect(() => {
    const mailId = localStorage.getItem("mailId");
    const token = localStorage.getItem("token");
    async function checkAuthorized() {
      let response = await axios.post("http://localhost:3000/checkauthorized", {
        mail: mailId,
        token: token,
      });
      console.log(response.data);
      setData(response.data);
    }
    if (mailId && token) {
      checkAuthorized();
    }
  }, []);

  return (
    <div>
      {data.map((data) => (
        <div key={data.id} style={{margin:'30px 0'}}>
          <h2>{data.title}</h2>
          <p>MRP: {data.price} /-</p>
          <p>
            Final price:{" "}
            {(data.price - (data.price * data.discount) / 100).toFixed(2)}/-
          </p>
        </div>
      ))}
    </div>
  );
}

export default Checkout;
