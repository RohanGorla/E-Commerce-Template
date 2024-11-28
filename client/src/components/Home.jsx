import { useState, useEffect } from "react";
import axios from "axios";
import BGImg from "../assets/lady_bg_2.jpg";
import "../styles/Home.css";

function Home() {
  const [products, setProducts] = useState([]);

  async function getProducts() {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/gethomeproducts`
    );
    if (response.data.access) {
      setProducts(response.data.data);
    }
  }
  return (
    <div className="Home_Page">
      <div className="Home_Header">
        <div className="Home_Title">
          <h1>E-Commerce Store</h1>
          <p>For all your needs and more!</p>
          <button>Shop now</button>
        </div>
        <div className="Home_BG--Image">
          <img src={BGImg}></img>
        </div>
      </div>
      <div className="Home_Main">
        <button onClick={getProducts}>get products</button>
      </div>
    </div>
  );
}
export default Home;
