import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";
import { Outlet } from "react-router-dom";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState();

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

  useEffect(() => {
    getProducts();
  }, [category]);

  return (
    <>
      <Navbar />
      <Outlet context={{ products, category, setCategory }} />
      <Footer />
    </>
  );
}

export default App;
