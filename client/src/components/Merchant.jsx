import React from "react";
import axios from "axios";
import "../styles/Merchant.css";

function Merchant() {
  return (
    <div className="Merchant_Page">
      <div className="Merchant_Main">
        <div className="Merchant_Header">
          <h1 className="Merchant_Header--Title">Merchant Dashboard</h1>
        </div>
        <div className="Merchant_Dashboard">
          <div className="Merchant_Dashboard--Section">
            <h2 className="Merchant_Dashboard--Section_Name">Sales Overview</h2>
            <div className="Merchant_Dashboard--Grid">
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">Pending</p>
                  <p className="Merchant_Dashboard--Item--Value">10</p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">Shipped</p>
                  <p className="Merchant_Dashboard--Item--Value">5</p>
                </div>
              </div>
              <div className="Merchant_Dashboard--Item_Container">
                <div className="Merchant_Dashboard--Item">
                  <p className="Merchant_Dashboard--Item--Text">Delivered</p>
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
        </div>
      </div>
    </div>
  );
}

export default Merchant;
