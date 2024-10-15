import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import "../styles/Wishlist.css";
import axios from "axios";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [allWishitems, setAllWishitems] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [selectedWishlist, setSelectedWistlist] = useState("");
  const [addListShow, setAddListShow] = useState(false);
  const [newlist, setNewlist] = useState("");
  const [reviews, setReviews] = useState([]);
  const [addListError, setAddListError] = useState(false);
  const [addListErrorMsg, setAddListErrorMsg] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const mailId = userInfo?.mailId;
  const navigate = useNavigate();

  async function getWishlists() {
    if (mailId) {
      const response = await axios.post("http://localhost:3000/getwishlists", {
        mailId: mailId,
      });
      if (response.data.access) {
        setWishlists(response.data.data);
        setSelectedWistlist(response.data.data[0]?.wishlistname);
      } else {
        console.log(response.data.errorMsg);
      }
    } else {
      navigate("/account");
    }
  }

  async function getFromWish() {
    if (mailId) {
      const response = await axios.post("http://localhost:3000/getfromwish", {
        mailId: mailId,
      });
      if (response.data.access) {
        const data = response.data.data;
        let productsId = [];
        data?.map((product) => {
          productsId.push(product.productid);
        });
        async function getReviews() {
          let response = await axios.post(
            "http://localhost:3000/getallreviews",
            {
              id: productsId,
            }
          );
          if (response.data.access) {
            setReviews(response.data.data);
          }
          setAllWishitems(data);
        }
        getReviews();
      } else {
        console.log(response.data.errorMsg);
      }
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
              setAddListError(true);
              setAddListErrorMsg("You have another list with the same name!");
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
          setAddListError(false);
          setAddListErrorMsg("");
          if (wishlists.length == 0) {
            setSelectedWistlist(newlist);
          }
        }
      } else {
        setAddListError(true);
        setAddListErrorMsg("Wishlist name cannot be empty!");
      }
    }
  }

  async function deleteWishlist() {
    let response = await axios.delete("http://localhost:3000/deletewishlist", {
      data: { list: selectedWishlist, mail: mailId },
    });
    if (response.data.access) {
      getWishlists();
      getFromWish();
    }
    // console.log(response);
  }

  async function addToCart(product) {
    let response = await axios.post("http://localhost:3000/addtocart", {
      id: product.productid,
      title: product.title,
      price: product.price,
      discount: product.discount,
      mailId: mailId,
      count: 1,
    });
    if (response.data.access) {
      setSuccess(true);
      setSuccessMessage(response.data.successMsg);
      setTimeout(() => {
        setSuccess(false);
      }, 3500);
      setError(false);
      setErrorMessage("");
    } else {
      setSuccess(false);
      setSuccessMessage("");
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
    // console.log(response);
  }

  async function removeFromWish(id) {
    let response = await axios.delete("http://localhost:3000/removefromwish", {
      data: { productId: id, list: selectedWishlist, mail: mailId },
    });
    if (response.data.access) {
      setSuccess(true);
      setSuccessMessage(response.data.successMsg);
      setTimeout(() => {
        setSuccess(false);
      }, 3500);
      setError(false);
      setErrorMessage("");
    } else {
      setSuccess(false);
      setSuccessMessage("");
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
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

  function currencyConvert(amount) {
    let amountString = amount.toString();
    let amountArray = amountString.split("").reverse();
    let iterator = Math.floor(amountArray.length / 2);
    let k = 3;
    for (let j = 0; j < iterator - 1; j++) {
      amountArray.splice(k, 0, ",");
      k += 3;
    }
    let finalAmount = amountArray.reverse().join("");
    return finalAmount;
  }

  function getProductRatingData(id) {
    let totalRating = 0;
    let totalRatings = 0;
    let averageRatingRounded = -1;
    let actualProductRating = 0;
    if (reviews.length) {
      reviews.forEach((review) => {
        if (review.productid == id) {
          totalRating += review.rating;
          if (review.rating) {
            totalRatings += 1;
          }
        }
      });
      if (totalRatings) {
        actualProductRating = totalRating / totalRatings;
        averageRatingRounded = Math.round(actualProductRating) - 1;
      }
    }
    return {
      ratings: totalRatings,
      averageStarRating: averageRatingRounded,
      actualRating: actualProductRating.toFixed(1),
    };
  }

  useEffect(() => {
    getWishlists();
    getFromWish();
  }, []);

  useEffect(() => {
    changeWishlist();
  }, [selectedWishlist, allWishitems]);

  return (
    <div className="Wish_Page">
      {/* Error Message Box */}
      <div
        className={
          error
            ? "Error_Message_Box Error_Message_Box--Active"
            : "Error_Message_Box Error_Message_Box--Inactive"
        }
      >
        <div className="Error_Message_Box--Container">
          <p className="Error_Message_Box--Heading">Error!</p>
          <p className="Error_Message_Box--Message">{errorMessage}</p>
        </div>
      </div>
      {/* Success Message Box */}
      <div
        className={
          success
            ? "Success_Message_Box Success_Message_Box--Active"
            : "Success_Message_Box Success_Message_Box--Inactive"
        }
      >
        <div className="Success_Message_Box--Container">
          <p className="Success_Message_Box--Heading">Success!</p>
          <p className="Success_Message_Box--Message">{successMessage}</p>
        </div>
      </div>
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
                addListError
                  ? "Wish_AddNewList--Error"
                  : "Wish_AddNewList--Error--Inactive"
              }
            >
              <p className="Wish_AddNewList--Error_Heading">Error!</p>
              <p className="Wish_AddNewList--Error_Note">{addListErrorMsg}</p>
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
                    setAddListError(false);
                    setAddListErrorMsg("");
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
          <div className="Wish_Lists_Container">
            <div className="Wish_Lists_Subcontainer">
              <div className="Wish_Lists_Innercontainer">
                {/* Wish Lists Header */}
                <div className="Wish_Lists--Header">
                  <h2>Your Wishlists</h2>
                  <button
                    onClick={() => {
                      setAddListShow(true);
                    }}
                  >
                    Create new list
                  </button>
                </div>
                {wishlists.length ? (
                  /* Show All Of User's Wishlists */
                  <div className="Wish_Lists--Main">
                    {wishlists.map((list, index) => {
                      return (
                        <div
                          className={
                            selectedWishlist == list.wishlistname
                              ? "Wish_Lists--List Wish_Lists--List--Selected"
                              : "Wish_Lists--List"
                          }
                          key={index}
                          onClick={() => {
                            setSelectedWistlist(list.wishlistname);
                          }}
                        >
                          <p>{list.wishlistname}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* If There Are No Wishlists */
                  <div className="Wish_Lists--Empty">
                    <p className="Wish_Lists--Empty_Heading">
                      No wishlists found!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* All Wishitems Display */}
          <div className="Wish_Items_Container">
            <div className="Wish_Items_Subcontainer">
              <div className="Wish_Items_Innercontainer">
                {/* Wish Items Header */}
                <div className="Wish_Items--Header">
                  <h2>Your Wish items</h2>
                  <div className="Wish_Items--Header_Selectedlist_And_Delete">
                    <p>
                      {wishlists.length
                        ? selectedWishlist
                        : "No wishlist selected"}
                    </p>
                    <button
                      className={
                        wishlists.length
                          ? "Wish_Items--Header_Buttons--Delete"
                          : "Wish_Items--Header_Buttons--Delete Wish_Items--Header_Buttons--Delete--Hidden"
                      }
                      onClick={deleteWishlist}
                    >
                      Delete this list
                    </button>
                  </div>
                </div>
                {wishlist.length ? (
                  <div className="Wish_Items--Main">
                    {wishlist.map((item, index) => {
                      let convertedMrp = currencyConvert(item.price);
                      let priceInt, priceDecimal;
                      let price =
                        item.price - (item.price * item.discount) / 100;
                      if (price.toString().split(".").length === 1) {
                        priceInt = price;
                        priceDecimal = ".00";
                      } else {
                        priceInt = (Math.round(price * 100) / 100)
                          .toString()
                          .split(".")[0];
                        priceDecimal = (Math.round(price * 100) / 100)
                          .toString()
                          .split(".")[1]
                          .padEnd(2, "0");
                      }
                      let convertedPrice =
                        currencyConvert(priceInt) + "." + priceDecimal;
                      let productRatingData = getProductRatingData(
                        item.productid
                      );
                      return (
                        <div key={index} className="Wish_Items--Item">
                          <div className="Wish_Item--Image">
                            <img
                              src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
                              onClick={() => {
                                window.open(
                                  `${window.location.origin}/products/product/${item.productid}`
                                );
                              }}
                            ></img>
                          </div>
                          <div className="Wish_Item--Details">
                            <p
                              className="Wish_Item_Details--Name"
                              onClick={() => {
                                window.open(
                                  `${window.location.origin}/products/product/${item.productid}`
                                );
                              }}
                            >
                              {item.title}
                            </p>
                            <div className="Wish_Items_Details--Rating">
                              <span className="Wish_Items_Rating--Average_Rating">
                                {productRatingData.actualRating}
                              </span>
                              <div className="Wish_Items_Rating--Star_Container">
                                {Array(5)
                                  .fill(0)
                                  .map((_, index) => {
                                    return (
                                      <FaStar
                                        className="Wish_Items_Rating--Star"
                                        key={index}
                                        size={15}
                                        color={
                                          index <=
                                          productRatingData.averageStarRating
                                            ? "orange"
                                            : "white"
                                        }
                                      />
                                    );
                                  })}
                              </div>
                              <span className="Wish_Items_Rating--Total_Ratings">
                                {productRatingData.ratings}{" "}
                                {productRatingData.ratings == 1
                                  ? "rating"
                                  : "ratings"}
                              </span>
                            </div>
                            <p className="Wish_Item_Details--Price">
                              <span className="Wish_Item_Details--Discount">
                                -{item.discount}%
                              </span>{" "}
                              ₹{convertedPrice}
                            </p>
                            <p className="Wish_Item_Details--Mrp">
                              M.R.P:{" "}
                              <span className="Wish_Item_Details--Mrp--Strike">
                                ₹{convertedMrp}
                              </span>
                            </p>
                            <div className="Wish_Item--Buttons">
                              <button
                                className="Wish_Item_Buttons--Add"
                                onClick={() => {
                                  addToCart(item);
                                }}
                              >
                                Add to cart
                              </button>
                              <button
                                className="Wish_Item_Buttons--Remove"
                                onClick={() => {
                                  removeFromWish(item.productid);
                                }}
                              >
                                Remove from list
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="Wish_Items--Empty">
                    <p className="Wish_Items--Empty_Heading">
                      {wishlists.length
                        ? "Wishlist is empty!"
                        : "No wishlists found!"}
                    </p>
                    <p className="Wish_Items--Empty_Note">
                      {wishlists.length
                        ? "You do not have any products in this wishlist. Shop for more products and add them to this wishlist to show them here."
                        : "You do not have any wishlists. Create a wishlist and add your favourite items into the list to show them here."}
                    </p>
                    <div className="Wish_Items--Empty_Button">
                      {wishlists.length ? (
                        <button
                          onClick={() => {
                            navigate("/products");
                          }}
                        >
                          Go shopping
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setAddListShow(true);
                          }}
                        >
                          Create new list
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
