import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Checkout() {
  const [data, setData] = useState([]);
  const [ordered, setOrdered] = useState(false);
  const [address, setAddress] = useState({});

  async function placeOrder() {
    const mail = localStorage.getItem("mailId");
    let orders = await axios.post("http://localhost:3000/placeorder", {
      mail: mail,
    });
    console.log(orders);
    // let response = await axios.delete("http://localhost:3000/placeorder", {
    //   data: { mail },
    // });
    // console.log(response);
  }

  useEffect(() => {
    const mailId = localStorage.getItem("mailId");
    const token = localStorage.getItem("token");
    const address = JSON.parse(localStorage.getItem("address"));
    setAddress(address);
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
    <>
      {data.length ? (
        <div>
          <h1 style={{ textAlign: "center" }}>Your Products</h1>
          {address ? (
            <div>
              <h2>Delivering to:</h2>
              <p>{address?.username}</p>
              <p>{address?.house}</p>
              <p>{address?.street}</p>
              <p>
                {address?.city}, {address?.state}
              </p>
              <p>{address?.country}</p>
            </div>
          ) : null}
          {data.map((data) => (
            <div key={data.id} style={{ margin: "30px 0" }}>
              <h2>{data.title}</h2>
              <p>MRP: {data.price} /-</p>
              <p>
                Final price:{" "}
                {(data.price - (data.price * data.discount) / 100).toFixed(2)}{" "}
                /-
              </p>
            </div>
          ))}
          <button
            style={{
              backgroundColor: "gold",
              borderStyle: "none",
              padding: "10px 15px",
              borderRadius: "20px",
              fontSize: "20px",
              fontWeight: "700",
              cursor: "pointer",
            }}
            onClick={() => {
              placeOrder();
              setOrdered(true);
              setData([]);
            }}
          >
            Place order
          </button>
        </div>
      ) : (
        <div>
          <h1>
            {ordered
              ? "Your order has been placed successfully!"
              : "You have no Products to buy!"}
          </h1>
        </div>
      )}
    </>
  );
}

export default Checkout;
