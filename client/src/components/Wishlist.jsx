import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Wishlist.css";
import axios from "axios";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [allWishitems, setAllWishitems] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [selectedWishlist, setSelectedWistlist] = useState("");
  const [addListShow, setAddListShow] = useState(false);
  const [newlist, setNewlist] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const mailId = userInfo?.mailId;
  const navigate = useNavigate();

  async function getWishlists() {
    if (mailId) {
      const response = await axios.post("http://localhost:3000/getwishlists", {
        mailId: mailId,
      });
      setWishlists(response.data);
      console.log("First list name is -> ", response.data[0].wishlistname);
      setSelectedWistlist(response.data[0].wishlistname);
    } else {
      navigate("/account");
    }
  }

  async function getFromWish() {
    if (mailId) {
      const response = await axios.post("http://localhost:3000/getfromwish", {
        mailId: mailId,
      });
      console.log(response);
      const data = response.data;
      setAllWishitems(data);
    } else {
      navigate("/account");
    }
  }

  async function addwishlist() {
    if (mailId) {
      let addListAccess;
      if (newlist.length) {
        if (wishlists.length) {
          for (let i = 0; i < wishlists.length; i++) {
            if (
              newlist.toLowerCase() == wishlists[i].wishlistname.toLowerCase()
            ) {
              setError(true);
              setErrorMsg("You have another list with the same name!");
              addListAccess = false;
              break;
            } else {
              addListAccess = true;
            }
          }
        } else {
          addListAccess = true;
        }
        if (addListAccess) {
          const response = await axios.post(
            "http://localhost:3000/addwishlist",
            {
              mailId: mailId,
              wishlistname: newlist,
            }
          );
          setWishlists(response.data);
          setAddListShow(false);
        }
      } else {
        setError(true);
        setErrorMsg("Wishlist name cannot be empty!");
      }
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

  async function changeWishlist() {
    const newData = allWishitems.filter((item) => {
      if (item.wishlistname == selectedWishlist) {
        return item;
      }
    });
    setWishlist(newData);
  }

  useEffect(() => {
    getWishlists();
    getFromWish();
  }, []);

  useEffect(() => {
    changeWishlist();
  }, [selectedWishlist, allWishitems]);

  return (
    <div className="Wish_Container">
      {/* Add New List Display */}
      <div
        className={
          addListShow
            ? "Wish_AddNewList_Container"
            : "Wish_AddNewList_Container--Inactive"
        }
      >
        <div className="Wish_AddNewList--Tint"></div>
        <div className="Wish_AddNewList">
          <div className="Wish_AddNewList--Header">
            <p className="Wish_AddNewList--Header_Heading">Add new list</p>
            <p className="Wish_AddNewList--Header_Note">
              Create a new wish list to save your favourite items!
            </p>
          </div>
          <div
            className={
              error
                ? "Wish_AddNewList--Error"
                : "Wish_AddNewList--Error--Inactive"
            }
          >
            <p className="Wish_AddNewList--Error_Heading">Error!</p>
            <p className="Wish_AddNewList--Error_Note">{errorMsg}</p>
          </div>
          <div className="Wish_AddNewList--Input">
            <label>Wishlist name</label>
            <input
              type="text"
              value={newlist}
              onChange={(e) => {
                setNewlist(e.target.value);
              }}
              placeholder="Enter list name"
            ></input>
            <div className="Wish_AddNewList--Input_Buttons">
              <button
                className="Wish_AddNewList--Buttons_Cancel"
                onClick={() => {
                  setAddListShow(false);
                }}
              >
                Cancel
              </button>
              <button
                className="Wish_AddNewList--Buttons_Create"
                onClick={addwishlist}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="Wish_Subcontainer">
        {/* All Wishlists Dislay */}
        <div className="">
          <div className="">
            <h2 className="">YOUR LISTS</h2>
          </div>
          {wishlists.map((list, index) => {
            return (
              <div
                className=""
                key={index}
                onClick={() => {
                  setSelectedWistlist(list.wishlistname);
                }}
              >
                <p className="">{list.wishlistname}</p>
              </div>
            );
          })}
        </div>
        {wishlist.length ? (
          <div className="">
            <div className="">
              <h2 className="">{selectedWishlist}</h2>
              <p
                className=""
                onClick={() => {
                  setAddListShow(true);
                }}
              >
                Create list
              </p>
            </div>
            {wishlist.map((item, index) => {
              return (
                <div key={index} className="">
                  <div className="">
                    <div className="">
                      <img
                        src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
                        style={{ width: "200px" }}
                      ></img>
                    </div>
                    <div>
                      <h2>{item.title}</h2>
                      <div>
                        <p>₹</p>
                        <p>
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="">
            <div className="">
              <h2 className="">{selectedWishlist}</h2>
              <p
                className=""
                onClick={() => {
                  setAddListShow(true);
                }}
              >
                Create list
              </p>
            </div>
            <div className="">
              <h1>No items present!</h1>
              <p>
                No items to show. Add new items into wishlist or select another
                wishlist.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
