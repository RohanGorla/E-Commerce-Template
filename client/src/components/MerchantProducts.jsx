import { useState, useEffect } from "react";
import "../styles/MerchantProducts.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import altImgUrl from "../assets/alternateImage.js";

function MerchantProducts() {
  const [merchantProducts, setMerchantProducts] = useState([]);
  const [loadedImages, setLoadedImages] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));

  /* GET PRODUCT IMAGE URLS FROM S3 */

  async function getImageUrls(imageKeys) {
    const getUrlResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/generategeturls`,
      { imageKeys: [imageKeys[0]] }
    );
    const getUrls = getUrlResponse.data;
    return getUrls;
  }

  async function getMerchantProducts() {
    const company = merchantInfo.company;
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getmerchantproducts`,
      { company }
    );
    if (response.data.access) {
      const merchantProductsData = response.data.data;
      for (let i = 0; i < merchantProductsData.length; i++) {
        if (JSON.parse(merchantProductsData[i]?.imageTags).length)
          merchantProductsData[i].imageUrl = await getImageUrls(
            JSON.parse(merchantProductsData[i].imageTags)
          );
      }
      setMerchantProducts(merchantProductsData);
    } else {
      setSuccess(false);
      setSuccessMessage("");
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  function currencyConvertor(amount) {
    let amountString = amount.toString();
    let amountArray = amountString.split("").reverse();
    let iterator = Math.floor(amountArray.length / 2);
    let k = 3;
    for (let j = 0; j < iterator - 1; j++) {
      amountArray.splice(k, 0, ",");
      k += 3;
    }
    let finalAmount = amountArray.reverse().join("");
    return finalAmount;
  }

  useEffect(() => {
    if (merchantInfo.mailId && merchantInfo.company) {
      getMerchantProducts();
    } else {
      navigate("/merchant/merchantlogin");
    }
  }, []);

  return (
    <div className="MerchantProducts_Page">
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
      {/* Merchant Products */}
      <div className="MerchantProducts_Container">
        <div className="MerchantProducts_Header">
          <h1 className="MerchantProducts_Header--Title">Your Products</h1>
        </div>
        <div className="MerchantProducts_Main">
          {merchantProducts.map((product, index) => {
            const priceCurrency = currencyConvertor(product.price);
            let finalPriceCurrency;
            if (product.final_price.toString().split(".").length !== 2) {
              finalPriceCurrency =
                currencyConvertor(product.final_price) + ".00";
            } else {
              finalPriceCurrency =
                currencyConvertor(Math.round(product.final_price)) +
                "." +
                product.final_price.toString().split(".")[1].padEnd(2, "0");
            }

            return (
              <div key={index} className="MerchantProducts--Product">
                <div className="MerchantProducts--Product_Image">
                  <img
                    src={
                      product.imageUrl &&
                      loadedImages.includes(JSON.parse(product.imageTags)[0])
                        ? product.imageUrl[0].imageUrl
                        : `data:image/jpeg;base64,${altImgUrl}`
                    }
                    onLoad={() => {
                      const imageTag = JSON.parse(product.imageTags)[0];
                      if (!loadedImages.includes(imageTag))
                        setLoadedImages((prev) => [...prev, imageTag]);
                    }}
                  />
                </div>
                <div className="MerchantProducts--Product_Details">
                  <p className="MerchantProducts--Product_Name">
                    {product.title}
                  </p>
                  <p className="MerchantProducts--Product_Category">
                    <span>{product.category}</span> - {product.company}
                  </p>
                  <p className="MerchantProducts--Product_FinalPrice">
                    <span className="MerchantProducts--Product_Discount">
                      -{product.discount}%
                    </span>{" "}
                    ₹{finalPriceCurrency}
                  </p>
                  <p className="MerchantProducts--Product_MRP">
                    M.R.P:{" "}
                    <span className="MerchantProducts--Product_MRP--Strike">
                      ₹{priceCurrency}
                    </span>
                  </p>
                  <p className="MerchantProducts--Product_Stock">
                    In stock: {product.stock_left}
                  </p>
                  <button
                    className="MerchantProducts--Product_EditButton"
                    onClick={() => {
                      window.open(
                        `${window.location.origin}/merchant/editproduct/${product.id}`
                      );
                    }}
                  >
                    Edit Product Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MerchantProducts;
