import React, { useEffect, useState } from "react";
import "../styles/MerchantInventory.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function MerchantInventory() {
  const { type } = useParams();
  const navigate = useNavigate();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const [inventoryType, setInventoryType] = useState("");

  async function getInventory() {
    if (merchantInfo.mailid && merchantInfo.company) {
      const company = merchantInfo.company;
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/getinventory`,
        {
          company,
          inventoryType,
        }
      );
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
        <div className="MerchantInventory_Main"></div>
      </div>
    </div>
  );
}

export default MerchantInventory;
