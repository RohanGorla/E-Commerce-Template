import { useState, useEffect } from "react";
import "../styles/Wishlist.css";
import axios from "axios";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [selectedWishlist, setSelectedWistlist] = useState("");
  const [addListShow, setAddListShow] = useState(false);
  const mailId = localStorage.getItem("mailId");

  async function getWishlists() {
    if (mailId) {
      const response = await axios.post("http://localhost:3000/getwishlists", {
        mailId: mailId,
      });
      console.log(response.data);
      setWishlists(response.data);
    }
  }

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
    getWishlists();
  }, []);

  useEffect(() => {
    getFromWish();
  }, []);

  return (
    <div className="Wishlist_Container">
      <div
        className={addListShow ? "Addlist_Window--Active" : "Addlist_Window"}
      ></div>
      <div className="Wishlist_Selector">
        {/* <select
          onChange={(e) => {
            setSelectedWistlist(e.target.value);
          }}
          // value={}
        >
          <option hidden>Select wishlist</option>
          {wishlists.map((list) => {
            return <option key={list.id}>{list.wishlistname}</option>;
          })}
        </select> */}
        <div className="Wishlist_Heading Wishlist_Heading--Lists">
          <h2 className="Wishlists_Selector_Heading">YOUR LISTS</h2>
        </div>
        {wishlists.map((list, index) => {
          return (
            <div className="Wishlist_Selector--List" key={index}>
              <p className="Wishlist_Name">{list.wishlistname}</p>
            </div>
          );
        })}
      </div>
      {wishlist.length ? (
        <div className="Wishlist_Main">
          <div className="Wishlist_Heading Wishlist_Heading--Items">
            <h2 className="Selected_Listname">LIST NAME</h2>
            <p
              className="Create_Wishlist"
              onClick={() => {
                setAddListShow(true);
              }}
            >
              Create list
            </p>
          </div>
          {wishlist.map((item, index) => {
            return (
              <div key={index} className="Wish_Item_Box">
                <div className="Wish_Item">
                  <div className="Wish_Item_Image">
                    <img
                      src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
                      style={{ width: "200px" }}
                    ></img>
                  </div>
                  <div>
                    <h2>{item.title}</h2>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "start",
                        marginTop: ".3em",
                      }}
                    >
                      <p style={{ fontSize: "18px" }}>₹</p>
                      <p style={{ fontSize: "20px" }}>
                        {(
                          item.price -
                          item.price * (item.discount / 100)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="Wishlist_Buttons">
                  <button
                    onClick={() => {
                      addToCart(item);
                    }}
                    style={{
                      backgroundColor: "gold",
                      borderStyle: "none",
                      padding: "7px 10px",
                      marginRight: "1em",
                      borderRadius: "7px",
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Add to cart
                  </button>
                  <button
                    onClick={() => {
                      removeFromWish(item.id);
                    }}
                    style={{
                      backgroundColor: "rgb(51, 50, 50)",
                      color: "white",
                      borderStyle: "none",
                      padding: "7px 10px",
                      borderRadius: "7px",
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: "pointer",
                      marginRight: "1em",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <h1 style={{ textAlign: "center" }}>Wishlist is empty!</h1>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
