import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Buy() {
  const [productData, setProductData] = useState({});
  const { product } = useParams();
  console.log(product);
  useEffect(() => {
    async function getProduct() {
      let response = await axios.post("http://localhost:3000/getproduct", {
        id: product,
      });
      console.log(response);
      setProductData(response.data[0]);
    }
    getProduct();
  }, []);
  return (
    <>
      <h1 style={{ textAlign: "center", margin: "20px 0px" }}>BUY PAGE</h1>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div style={{ width: "40%" }}>
          <img
            style={{ width: "100%" }}
            src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
          ></img>
        </div>
        <div style={{ width: "40%" }}>
          <h2>{productData.title}</h2>
          <h3>₹ {productData.price}</h3>
          <p>-{productData.discount} %</p>
          <span>
            final price: ₹{" "}
            {productData.price -
              productData.price * (productData.discount / 100)}
          </span>
        </div>
      </div>
    </>
  );
}

export default Buy;
