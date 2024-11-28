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
          <button>Shop now</button>
        </div>
        <div className="Home_BG--Image">
          <img src={`data:image/jpeg;base64,${bg}`}></img>
        </div>
      </div>
    </div>
  );
}
export default Home;
