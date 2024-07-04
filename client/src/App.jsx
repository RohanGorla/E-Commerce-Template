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

  useEffect(() => {
    getProducts();
  }, [category]);

  async function addToCart(id, title, price, discount) {
    console.log(id, title, price, discount);
    const response = await axios.post("http://localhost:3000/addtocart", {
      id: id,
      title: title,
      price: price,
      discount: discount,
    });
    const data = response.data;
    console.log(data);
    setCart(data);
    // for (let i = 0; i < products.length; i++) {
    //   if (products[i].id == id) {
    //     console.log(products[i].id);
    //     let product = {
    //       title: products[i].title,
    //       description: products[i].description,
    //       category: products[i].category,
    //     };
    //     setCart((prev) => {
    //       return [...prev, product];
    //     });
    //   }
    // }
  }

  return (
    <>
      <Navbar />
      <Outlet context={{ products, cart, category, addToCart, setCategory }} />
      <Footer />
    </>
  );
}

export default App;
