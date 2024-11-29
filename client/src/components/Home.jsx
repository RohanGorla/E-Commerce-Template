import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bg from "../assets/homepagebg.js";
import "../styles/Home.css";

function Home() {
  const [mostBought, setMostBought] = useState([]);
  const [mostDiscount, setMostDiscount] = useState([]);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  async function getProducts() {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/gethomeproducts`
    );
    if (response.data.access) {
      setMostDiscount(response.data.mostDiscount);
      setMostBought(response.data.mostBought);
    }
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
    if (userInfo.mailId) {
      getProducts();
    } else {
      navigate("/account/login");
    }
  }, []);

  return (
    <div className="Home_Page">
      <div className="Home_Header">
        <div className="Home_Title">
          <h1>E-Commerce Store</h1>
          <p>For all your needs and more!</p>
          <button
            onClick={() => {
              navigate("/products");
            }}
          >
            Shop now
          </button>
        </div>
        <div className="Home_BG--Image">
          <img src={`data:image/jpeg;base64,${bg}`}></img>
        </div>
      </div>
      <div className="Home_Main">
        <div className="Home_Products_Section">
          <h2>Best Offers</h2>
          <div className="Home_Products_Container">
            {mostDiscount.map((product, index) => {
              let final_price;
              if (product.final_price.toString().split(".").length !== 2) {
                final_price = currencyConvert(product.final_price) + ".00";
              } else {
                final_price =
                  currencyConvert(
                    product.final_price.toString().split(".")[0]
                  ) +
                  "." +
                  product.final_price.toString().split(".")[1].padEnd(2, "0");
              }
              const price = currencyConvert(product.price);
              return (
                <div key={index} className="Home_Product">
                  <div className="Home_Product--Image">
                    <img src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"></img>
                  </div>
                  <div className="Home_Product--Details">
                    <p className="Home_Product--Name">{product.title}</p>
                    <p className="Home_Product--Price">₹{final_price}</p>
                    <div>
                      <span className="Home_Product--Discount">
                        -{product.discount}%
                      </span>
                      <span className="Home_Product--MRP">M.R.P: ₹{price}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="Home_Products_Section">
          <h2>Most Bought</h2>
          <div className="Home_Products_Container">
            {mostBought.map((product, index) => {
              let final_price;
              if (product.final_price.toString().split(".").length !== 2) {
                final_price = currencyConvert(product.final_price) + ".00";
              } else {
                final_price =
                  currencyConvert(
                    product.final_price.toString().split(".")[0]
                  ) +
                  "." +
                  product.final_price.toString().split(".")[1].padEnd(2, "0");
              }
              const price = currencyConvert(product.price);
              return (
                <div key={index} className="Home_Product">
                  <div className="Home_Product--Image">
                    <img src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"></img>
                  </div>
                  <div className="Home_Product--Details">
                    <p className="Home_Product--Name">{product.title}</p>
                    <p className="Home_Product--Price">₹{final_price}</p>
                    <div>
                      <span className="Home_Product--Discount">
                        -{product.discount}%
                      </span>
                      <span className="Home_Product--MRP">M.R.P: ₹{price}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home;
