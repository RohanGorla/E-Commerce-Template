import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/AddProduct.css";

function MerchantEditProduct() {
  const [productDetails, setProductDetails] = useState([]);
  const [file, setFile] = useState();
  const [title, setTitle] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { productid } = useParams();
  const navigate = useNavigate();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const merchantMail = merchantInfo.mailId;

  /* Get Product Details API */

  async function getProductDetails() {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getproduct`,
      { id: productid }
    );
    if (response.data.access) {
      const productDetails = response.data.data[0];
      setProductDetails(productDetails);
      setTitle(productDetails.title);
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

  /* Submit Edited Product Details API */

  async function handleSubmitProductEdit(e) {
    e.preventDefault();
  }

  useEffect(() => {
    if (merchantMail) {
      getProductDetails();
    } else {
      navigate("/merchant/merchantlogin");
    }
  }, []);

  return (
    <div className="AddProduct_Page">
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
      {/* Edit Product */}
      <div className="AddProduct_Container">
        {/* Edit Product Page Header */}
        <div className="AddProduct_Header">
          <h1 className="AddProduct_Header--Title">Add Your Product</h1>
        </div>
        <div className="AddProduct_Main">
          {/* Edit Product Details Form */}
          <form
            className="AddProduct_Section"
            onSubmit={handleSubmitProductEdit}
          >
            {/* Edit Product Basic Details */}
            <h2>Product Basic Details</h2>
            <div className="AddProduct--Basic_Details">
              <div className="AddProduct--Basic_Details--Primary">
                {/* Edit Product Images Field */}
                <div className="AddProduct_Section--Field">
                  <label>Photo</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                    }}
                  ></input>
                </div>
                {/* Edit Product Title Field */}
                <div className="AddProduct_Section--Field">
                  <label>Title</label>
                  <textarea
                    placeholder="Product name..."
                    rows={2}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                  ></textarea>
                </div>
              </div>
            </div>
            {/* Edit Product Submit Button */}
            <div className="AddProduct_Section--Submit">
              <input type="submit" value="Add Product"></input>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MerchantEditProduct;
