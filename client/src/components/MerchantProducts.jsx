import { useState, useEffect } from "react";
import "../styles/MerchantProducts.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MerchantProducts() {
  const [merchantProducts, setMerchantProducts] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));

  async function getMerchantProducts() {
    const company = merchantInfo.company;
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getmerchantproducts`,
      { company }
    );
    if (response.data.access) {
      setMerchantProducts(response.data.data);
      console.log(response.data.data);
    } else {
      setSuccess(false);
      setSuccessMessage("");
      setError(true);
      setErrorMessage(response.data.errorMsg);
    }
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
        <div className="MerchantProducts_Main"></div>
      </div>
    </div>
  );
}

export default MerchantProducts;
