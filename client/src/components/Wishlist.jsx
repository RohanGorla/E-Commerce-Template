import { useState, useEffect } from "react";
import "../styles/Wishlist.css";
import axios from "axios";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  async function getFromWish() {
    const response = await axios.post("http://localhost:3000/getfromwish");
    console.log(response);
    const data = response.data;
    setWishlist(data);
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
    <>
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
            <button>Add to cart</button>
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
    </>
  );
}

export default Wishlist;
