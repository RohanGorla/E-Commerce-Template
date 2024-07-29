import { useState, useEffect } from "react";
import { Outlet, useOutletContext, useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/Products.css";

function Product() {
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
      <img
        src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
        style={{ width: "300px" }}
      ></img>
      <h2>{productData?.title}</h2>
      <p>{productData?.price}</p>
      <p>{productData.category}</p>
      <p>{productData.price}</p>
      <p>{productData.discount}</p>
      <p>
        final price:{" "}
        {productData.price - productData.price * (productData.discount / 100)}
      </p>
      <button
        style={{
          backgroundColor: "gold",
          borderStyle: "none",
          padding: "10px 15px",
          borderRadius: "10px",
          fontSize: "20px",
          fontWeight: "700",
          cursor: "pointer",
        }}
        onClick={() => {
          window.open(`${window.location.origin}/buy/${product}`);
        }}
      >
        Buy now
      </button>
    </>
  );
}

export default Product;
