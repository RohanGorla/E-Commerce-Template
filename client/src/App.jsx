import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";
import { Outlet } from "react-router-dom";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  // console.log(cart);

  async function getProducts() {
    let response = await fetch("https://dummyjson.com/products?limit=200");
    let data = await response.json();
    setProducts(data.products);
  }

  useEffect(() => {
    getProducts();
  }, []);

  function addToCart(id) {
    console.log(id);
    for (let i = 0; i < products.length; i++) {
      if (products[i].id == id) {
        console.log(products[i].id);
        let product = {
          title: products[i].title,
          description: products[i].description,
          category: products[i].category,
        };
        setCart((prev) => {
          return [...prev, product];
        });
      }
    }
  }

  return (
    <>
      <Navbar />
      <Outlet context={{ products, addToCart, cart }} />
      <Footer />
    </>
  );
}

export default App;
