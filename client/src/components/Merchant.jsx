import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Merchant.css";

function Merchant() {
  const navigate = useNavigate();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));

  useEffect(() => {
    if (!merchantInfo?.mailId) {
      navigate("merchantregister");
    }
  }, []);

  return (
    <div className="Merchant_Page">
      <div className="Merchant_Main">
        {/* Merchant Header */}
        <div className="Merchant_Header">
          <h1 className="Merchant_Header--Title">Merchant Dashboard</h1>
        </div>
        {/* Merchant Dashboard */}
        <div className="Merchant_Dashboard">
          {/* Merchant Details Section */}
          <div className="Merchant_Dashboard--Section">
            <div className="Merchant_Dashboard_Details_And_Signout">
              <div className="Merchant_Details">
                <p className="Merchant_Details--Company_Name">
                  {merchantInfo?.company}
                </p>
                <p className="Merchant_Details--Mail">{merchantInfo?.mailId}</p>
              </div>
              <div className="Merchant_Signout">
                <button
                  className="Merchant_Signout--Button"
                  onClick={() => {
                    localStorage.removeItem("merchantInfo");
                    navigate("merchantregister");
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
          {/* Merchant Sales Info Section */}
          <div className="Merchant_Dashboard--Section">
            <h2 className="Merchant_Dashboard--Section_Name">Sales Overview</h2>
            <div className="Merchant_Dashboard--Grid">
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">
                    Pending Orders
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">10</p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">
                    Shipped Orders
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">5</p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">
                    Finished Orders
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">26</p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">Total Sales</p>
                  <p className="Merchant_Dashboard--Item--Value">79</p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">
                    Revenue Generated
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">₹5,34,798</p>
                </div>
              </div>
              {/* <div className="Merchant_Dashboard--Item_Container">
              <div className="Merchant_Dashboard--Item">
                <p>Inventory Management</p>
              </div>
            </div> */}
            </div>
          </div>
          {/* Merchant Inventory Management Section */}
          <div className="Merchant_Dashboard--Section">
            <h2 className="Merchant_Dashboard--Section_Name">
              Inventory Management
            </h2>
            <div className="Merchant_Dashboard--Grid">
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">
                    Total Stock Quantity
                  </p>
                  <p className="Merchant_Dashboard--Item--Value">100</p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">Low On Stock</p>
                  <p className="Merchant_Dashboard--Item--Value">34</p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">Out Of Stock</p>
                  <p className="Merchant_Dashboard--Item--Value">2</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Merchant;
