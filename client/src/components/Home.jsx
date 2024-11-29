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
              return (
                <div key={index} className="Home_Product">
                  <div className="Home_Product--Image">
                    <img src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"></img>
                  </div>
                  <div className="Home_Product--Details">
                    <p className="Home_Product--Name">{product.title}</p>
                    <p className="Home_Product--Price">
                      ₹{product.final_price}
                    </p>
                    <div>
                      <span className="Home_Product--Discount">
                        -{product.discount}%
                      </span>
                      <span className="Home_Product--MRP">
                        M.R.P: ₹{product.price}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="Home_Products_Section"></div>
      </div>
    </div>
  );
}
export default Home;
