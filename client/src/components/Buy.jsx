import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Buy() {
  const [productData, setProductData] = useState({});
  const address = JSON.parse(localStorage.getItem("address"));
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

  return <></>;
}

export default Buy;
