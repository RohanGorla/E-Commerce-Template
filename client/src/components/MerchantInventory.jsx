import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import altImgUrl from "../assets/alternateImage.js";
import "../styles/MerchantInventory.css";

function MerchantInventory() {
  const { type } = useParams();
  const navigate = useNavigate();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const [inventoryType, setInventoryType] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [loadedImages, setLoadedImages] = useState([]);
  const [showStockEditor, setShowStockEditor] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(0);
  const [stockValue, setStockValue] = useState(0);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  /* GET PRODUCT IMAGE URLS FROM S3 */

  async function getImageUrls(imageKeys) {
    const getUrlResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/generategeturls`,
      { imageKeys: [imageKeys[0]] }
    );
    const getUrls = getUrlResponse.data;
    return getUrls;
  }

  async function getInventory() {
    if (merchantInfo.mailId && merchantInfo.company) {
      const company = merchantInfo.company;
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/getinventory`,
        {
          company,
        }
      );
      if (response.data.access) {
        const allInventory = response.data.data;
        for (let i = 0; i < allInventory.length; i++) {
          if (JSON.parse(allInventory[i]?.imageTags).length)
            allInventory[i].imageUrl = await getImageUrls(
              JSON.parse(allInventory[i].imageTags)
            );
        }
        filterInventoryData(allInventory);
      }
    } else {
      navigate("/merchant/merchantlogin");
    }
  }

  async function updateProductStock(id) {
    if (merchantInfo.company) {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/updateinventory`,
        {
          id,
          stockValue,
        }
      );
      if (response.data.access) {
        setSuccess(true);
        setSuccessMessage(response.data.successMsg);
        setTimeout(() => {
          setSuccess(false);
        }, 3500);
        const updatedInventoryData = inventoryData.map((product) => {
          if (product.id == id) product.stock_left = stockValue;
          return product;
        });
        setInventoryData(updatedInventoryData);
      } else {
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
    } else navigate("/merchant/merchantlogin");
  }

  function filterInventoryData(allInventory) {
    switch (inventoryType) {
      case "Your Inventory":
        setInventoryData(allInventory);
        break;
      case "Low On Stock":
        const lowStock = allInventory.filter((product) => {
          if (product.stock_left <= product.stock_alert) return product;
        });
        setInventoryData(lowStock);
        break;
      case "Out Of Stock":
        const outOfStock = allInventory.filter((product) => {
          if (product.stock_left == 0) return product;
        });
        setInventoryData(outOfStock);
        break;
    }
  }

  useEffect(() => {
    getInventory();
  }, [inventoryType]);

  useEffect(() => {
    switch (type) {
      case "allinventory":
        setInventoryType("Your Inventory");
        break;
      case "lowstock":
        setInventoryType("Low On Stock");
        break;
      case "outofstock":
        setInventoryType("Out Of Stock");
        break;
    }
  }, []);

  return (
    <div className="MerchantInventory_Page">
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
      {/* Merchant Inventory Box */}
      <div className="MerchantInventory_Container">
        <div className="MerchantInventory_Header">
          <h1 className="MerchantInventory_Header--Title">{inventoryType}</h1>
        </div>
        <div className="MerchantInventory_Main">
          {inventoryData.length ? (
            inventoryData.map((product, index) => {
              return (
                <div key={index} className="MerchantInventory--Product">
                  <div className="MerchantInventory--Product_Image">
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
                    ></img>
                  </div>
                  <div className="MerchantInventory--Product_Details">
                    <p className="MerchantInventory--Product_Name">
                      {product.title}
                    </p>
                    <p className="MerchantInventory--Product_Quantity">
                      Current stock quantity: {product.stock_left}
                    </p>
                    <button
                      className={
                        currentProduct == product.id
                          ? showStockEditor
                            ? "MerchantInventory--Restock_Button--Inactive"
                            : "MerchantInventory--Restock_Button"
                          : "MerchantInventory--Restock_Button"
                      }
                      onClick={() => {
                        setShowStockEditor(true);
                        setStockValue(product.stock_left);
                        setCurrentProduct(product.id);
                      }}
                    >
                      Restock Item
                    </button>
                    <div
                      className={
                        currentProduct == product.id
                          ? showStockEditor
                            ? "MerchantInventory--StockEditor"
                            : "MerchantInventory--StockEditor--Inactive"
                          : "MerchantInventory--StockEditor--Inactive"
                      }
                    >
                      <label htmlFor="stockInput">New Stock Quantity:</label>
                      <div className="MerchantInventory--StockEditor--Input_And_Confirm">
                        <input
                          id="stockInput"
                          type="number"
                          value={stockValue}
                          onChange={(e) => {
                            if (e.target.value <= 0) {
                              setStockValue(0);
                            } else {
                              setStockValue(e.target.value);
                            }
                          }}
                        ></input>
                        <button
                          onClick={() => {
                            updateProductStock(product.id);
                            setShowStockEditor(false);
                          }}
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="MerchantInventory--Empty">
              <p className="MerchantInventory--Empty--Header">
                {inventoryType} products list empty!
              </p>
              <p className="MerchantInventory--Empty--Note">
                There are currently no products in the '{inventoryType}' list.
                Check back later or update your inventory to see changes here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MerchantInventory;
