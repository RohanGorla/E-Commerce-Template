import { useState, useEffect } from "react";
import "../styles/Wishlist.css";
import axios from "axios";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const mailId = localStorage.getItem("mailId");

  async function getFromWish() {
    if (mailId) {
      const response = await axios.post("http://localhost:3000/getfromwish", {
        mailId: mailId,
      });
      console.log(response);
      const data = response.data;
      setWishlist(data);
    }
  }

  async function addToCart(product) {
    let response = await axios.post("http://localhost:3000/addtocart", {
      id: product.productid,
      title: product.title,
      price: product.price,
      discount: product.discount,
      mailId: mailId,
    });
    console.log(response);
  }

  async function removeFromWish(id) {
    let response = await axios.delete("http://localhost:3000/removefromwish", {
      data: { id },
    });
    console.log(response);
    getFromWish();
  }

  useEffect(() => {
    getFromWish();
  }, []);

  return (
    <div className="Wishlist_Main">
      Wishlist
      {/* add same features from cart */}
      {wishlist.map((item, index) => {
        return (
          <div key={index}>
            <img
              src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
              style={{ width: "300px" }}
            ></img>
            <h2>{item.title}</h2>
            <p>
              {(item.price - item.price * (item.discount / 100)).toFixed(2)}
            </p>
            <button
              onClick={() => {
                addToCart(item);
              }}
            >
              Add to cart
            </button>
            <button
              onClick={() => {
                removeFromWish(item.id);
              }}
            >
              Remove
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Wishlist;
