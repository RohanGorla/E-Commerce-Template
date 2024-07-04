import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";
import { Outlet } from "react-router-dom";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState();
  // console.log(cart);

  async function getProducts() {
    if (category) {
      // let response = await fetch(
      //   `https://dummyjson.com/products/category/${category}`
      // );
      // let data = await response.json();
      const response = await axios.post("http://localhost:3000/getproducts", {
        category: category,
      });
      const data = response.data;
      console.log(data);
      setProducts(data);
    }
  }

  async function getFromCart() {
    console.log("cart");
    const response = await axios.post("http://localhost:3000/getcartitems");
    const data = response.data;
    console.log(data);
    setCart(data);
  }

  useEffect(() => {
    getProducts();
  }, [category]);

  return (
    <>
      <Navbar getCart={getFromCart}/>
      <Outlet context={{ products, cart, category, setCategory }} />
      <Footer />
    </>
  );
}

export default App;
