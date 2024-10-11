import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Buy.css";

function Buy() {
  const [productData, setProductData] = useState({});
  const [addressData, setAddressData] = useState([]);
  const [showSelectAddress, setShowSelectAddress] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressFullName, setAddressFullName] = useState("");
  const [addressHouse, setAddressHouse] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productTotal, setProductTotal] = useState("");
  const [initiatePayment, setInitiatePayment] = useState(false);
  const [time, setTime] = useState(30);
  const address = JSON.parse(localStorage.getItem("address"));
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const order = JSON.parse(localStorage.getItem("order"));

  async function addDeliveryAddress() {
    let mailId = userInfo?.mailId;
    let response = await axios.post("http://localhost:3000/addaddress", {
      mail: mailId,
      name: addressFullName,
      house: addressHouse,
      street: addressStreet,
      landmark: addressLandmark,
      city: addressCity,
      state: addressState,
      country: addressCountry,
    });
    localStorage.setItem(
      "userInfo",
      JSON.stringify({ ...userInfo, base_address: addressFullName })
    );
    localStorage.setItem(
      "address",
      JSON.stringify({
        addressname: addressFullName,
        house: addressHouse,
        street: addressStreet,
        landmark: addressLandmark,
        city: addressCity,
        state: addressState,
        country: addressCountry,
      })
    );
    setShowAddAddress(false);
  }

  function currencyConvert(amount) {
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
    const mailId = userInfo?.mailId;
    async function getProduct() {
      let response = await axios.post("http://localhost:3000/getproduct", {
        mail: mailId,
      });
      if (response.data.access) {
        let data = response.data.data[0];
        let cost = data.price * (1 - data.discount / 100);
        let priceCurrency =
          currencyConvert(
            (Math.round(cost * 100) / 100).toString().split(".")[0]
          ) +
          "." +
          (Math.round(cost * 100) / 100).toString().split(".")[1];
        let total = cost * data.count;
        let totalCurrency =
          currencyConvert(
            (Math.round(total * 100) / 100).toString().split(".")[0]
          ) +
          "." +
          (Math.round(total * 100) / 100).toString().split(".")[1];
        setProductTotal(totalCurrency);
        setProductPrice(priceCurrency);
        setProductData(data);
      } else {
        console.log(response.data.errorMsg);
      }
    }
    async function getAddress() {
      let response = await axios.post("http://localhost:3000/getaddress", {
        mail: mailId,
      });
      setAddressData(response.data);
    }
    getAddress();
    getProduct();
  }, []);

  return (
    <>
      {initiatePayment ? (
        <div
          className={
            order?.orderPlaced
              ? "But_Order_Placed"
              : "But_Order_Placed--Inactive"
          }
        >
          <p className="Buy_Order_Placed--Success">
            Your order has been placed successfully! You can view all your order
            details in the 'Your orders' section in Your account.
          </p>
          <p className="Buy_Order_Placed--Timer">
            You can close this tab now or it will be closed automatically in{" "}
            {time}
            seconds.
          </p>
        </div>
      ) : (
        <div className="Buy_Main_Container">
          <div
            className={
              showSelectAddress
                ? "Buy_Select_Address"
                : "Buy_Select_Address--Inactive"
            }
          >
            <div className="Buy_Select_Address--Tint"></div>
            <div className="Buy_Select_Address--Address_Container">
              <div className="Buy_Select_Address--Address_Subcontainer">
                <div
                  className="Close--Buy_Select_Address"
                  onClick={() => {
                    setShowSelectAddress(false);
                  }}
                >
                  <span className="Close--Buy_Select_Address--Cross"></span>
                </div>
                <div className="Buy_Select_Address--Header">
                  <h3>Select Delivery Address</h3>
                </div>
                {addressData.length ? (
                  addressData.map((address, index) => {
                    return (
                      <div key={index} className="Buy_Select_Address--Address">
                        <p className="Buy_Select_Address--Name">
                          {address.addressname}
                        </p>
                        <p className="Buy_Select_Address--House">
                          {address.house}
                        </p>
                        <p className="Buy_Select_Address--Street">
                          {address.street}
                        </p>
                        <p className="Buy_Select_Address--Landmark">
                          Near {address.landmark}
                        </p>
                        <p className="Buy_Select_Address--City_State">
                          {address.city}, {address.state}
                        </p>
                        <p className="Buy_Select_Address--Country">
                          {address.country}
                        </p>
                        <div className="Buy_Select_Address--Button">
                          <button
                            onClick={() => {
                              changeBaseAddress(address);
                            }}
                          >
                            Deliver to this address
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="Buy_Select_Address--Empty">
                    <p className="Buy_Select_Address--Empty--Note">
                      You have not added any delivery address. Add an address to
                      ship your order!
                    </p>
                    <button
                      className="Buy_Select_Address--Empty--Button"
                      onClick={() => {
                        setShowAddAddress(true);
                        setShowSelectAddress(false);
                      }}
                    >
                      Add Delivery Address
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className={
              showAddAddress ? "Buy_Add_Address" : "Buy_Add_Address--Inactive"
            }
          >
            <div className="Buy_Add_Address--Tint"></div>
            <div className="Buy_Add_Address--Container">
              <div className="Buy_Add_Address--Subcontainer">
                <div
                  className="Close--Buy_Add_Address"
                  onClick={() => {
                    setShowAddAddress(false);
                  }}
                >
                  <span className="Close--Buy_Add_Address--Cross"></span>
                </div>
                <div className="Buy_Add_Address--Header">
                  <h3>Add Delivery Address</h3>
                </div>
                <div className="Buy_Add_Address--Address">
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--Name">
                    <label>Address name</label>
                    <input
                      value={addressFullName}
                      onChange={(e) => {
                        setAddressFullName(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--House">
                    <label>House/Flat</label>
                    <input
                      value={addressHouse}
                      onChange={(e) => {
                        setAddressHouse(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--Street">
                    <label>Street</label>
                    <input
                      value={addressStreet}
                      onChange={(e) => {
                        setAddressStreet(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--Landmark">
                    <label>Landmark</label>
                    <input
                      value={addressLandmark}
                      onChange={(e) => {
                        setAddressLandmark(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--City">
                    <label>City</label>
                    <input
                      value={addressCity}
                      onChange={(e) => {
                        setAddressCity(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--State">
                    <label>State</label>
                    <input
                      value={addressState}
                      onChange={(e) => {
                        setAddressState(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--Country">
                    <label>Country</label>
                    <input
                      value={addressCountry}
                      onChange={(e) => {
                        setAddressCountry(e.target.value);
                      }}
                      required
                    ></input>
                  </div>
                  <div className="Buy_Add_Address--Portion Buy_Add_Address--Button">
                    <button onClick={addDeliveryAddress}>
                      Add Delivery Address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="Buy_Header">
            <h1 className="Buy_Header--Heading">Checkout</h1>
          </div>
          <div className="Buy_Main">
            <div className="Buy_Main--Products">
              <div className="Buy_Products_Container">
                <div className="Buy_Products--Product">
                  <div className="Buy_Products--Product_Image">
                    <img src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"></img>
                  </div>
                  <div className="Buy_Products--Product_Details">
                    <p className="Buy_Product_Details--Name">
                      {productData.title}
                    </p>
                    <p className="Buy_Product_Details--Price">
                      <span className="Buy_Product_Details--Price_Symbol">
                        ₹
                      </span>
                      {productPrice}
                    </p>
                    <div className="Buy_Product_Details--Total_Cost">
                      <p className="Buy_Product_Details--Quantity">
                        Qty: {productData.count}
                      </p>
                      <p className="Buy_Product_Details--Total">
                        <span className="Buy_Product_Details--Total_Symbol">
                          ₹
                        </span>
                        {productTotal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Buy;
