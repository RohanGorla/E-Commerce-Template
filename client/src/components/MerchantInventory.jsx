import React, { useEffect, useState } from "react";
import "../styles/MerchantInventory.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function MerchantInventory() {
  const { type } = useParams();
  const navigate = useNavigate();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const [inventoryType, setInventoryType] = useState("");
  const [inventoryData, setInventoryData] = useState([]);

  async function getInventory() {
    if (merchantInfo.mailId && merchantInfo.company) {
      const company = merchantInfo.company;
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/getinventory`,
        {
          company,
          inventoryType,
        }
      );
      if (response.data.access) {
        const allInventory = response.data.data;
        console.log(allInventory);
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
    } else {
      navigate("/merchant/merchantlogin");
    }
  }

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
    <div
      className="MerchantInventory_Page"
      onClick={() => {
        getInventory();
      }}
    >
      <div className="MerchantInventory_Container">
        <div className="MerchantInventory_Header">
          <h1 className="MerchantInventory_Header--Title">{inventoryType}</h1>
        </div>
        <div className="MerchantInventory_Main">
          {inventoryData.map((product, index) => {
            return (
              <div key={index} className="MerchantInventory--Product">
                <p className="MerchantInventory--Product_Name">
                  {product.title}
                </p>
                <p className="MerchantInventory--Product_Quantity">
                  {product.stock_left}
                </p>
                <button
                  className={
                    inventoryType == "Your Inventory"
                      ? "MerchantInventory--Add_Stock_Button--Inactive"
                      : "MerchantInventory--Add_Stock_Button"
                  }
                >
                  Restock Item
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MerchantInventory;
