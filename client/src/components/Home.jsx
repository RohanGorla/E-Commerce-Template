import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bg from "../assets/homepagebg.js";
import "../styles/Home.css";

function Home() {
  const [mostBought, setMostBought] = useState([]);
  const [mostDiscount, setMostDiscount] = useState([]);
  const navigate = useNavigate();

  /* GET PRODUCT IMAGE URLS FROM S3 */

  async function getImageUrls(imageKeys) {
    const getUrlResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/generategeturls`,
      { imageKeys: [imageKeys[0]] }
    );
    const getUrls = getUrlResponse.data;
    return getUrls;
  }

  /* GET MOST DISCOUNT AND MOST BOUGHT PRODUCTS */

  async function getProducts() {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/gethomeproducts`
    );
    if (response.data.access) {
      const mostDiscountProducts = response.data.mostDiscount;
      for (let i = 0; i < mostDiscountProducts.length; i++) {
        if (mostDiscountProducts[i].imageTags)
          mostDiscountProducts.imageUrl = await getImageUrls(
            JSON.stringify(mostDiscountProducts[i].imageTags)
          );
      }
      setMostDiscount(mostDiscountProducts);
      setMostBought(response.data.mostBought);
    }
  }

  /* CURRENCY CONVERTER FUNCTION */

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
    getProducts();
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
                    <img
                      src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
                      onClick={() => {
                        window.open(
                          `${window.location.origin}/products/product/${product.id}`
                        );
                      }}
                    ></img>
                  </div>
                  <div className="Home_Product--Details">
                    <p
                      className="Home_Product--Name"
                      onClick={() => {
                        window.open(
                          `${window.location.origin}/products/product/${product.id}`
                        );
                      }}
                    >
                      {product.title}
                    </p>
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
                    <img
                      src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
                      onClick={() => {
                        window.open(
                          `${window.location.origin}/products/product/${product.id}`
                        );
                      }}
                    ></img>
                  </div>
                  <div className="Home_Product--Details">
                    <p
                      className="Home_Product--Name"
                      onClick={() => {
                        window.open(
                          `${window.location.origin}/products/product/${product.id}`
                        );
                      }}
                    >
                      {product.title}
                    </p>
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
