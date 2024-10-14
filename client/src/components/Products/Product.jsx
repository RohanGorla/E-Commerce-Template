import { useState, useEffect, act } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaHeart } from "react-icons/fa";
import axios from "axios";
import "../../styles/Product.css";

function Product() {
  const { product } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState({});
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryDateDisplay, setDeliveryDateDisplay] = useState("");
  const [review, setReview] = useState("");
  const [yourReview, setYourReview] = useState({});
  const [reviews, setReviews] = useState([]);
  const [showReview, setShowReview] = useState(true);
  const [hasReview, setHasReview] = useState(false);
  const [starHoverIndex, setStarHoverIndex] = useState(-1);
  const [starSetIndex, setStarSetIndex] = useState(-1);
  const [averageStarRating, setAverageStarRating] = useState(-1);
  const [actualRating, setActualRating] = useState(0);
  const [ratings, setRatings] = useState(0);
  const [count, setCount] = useState(1);
  const [wishlists, setWishlists] = useState([]);
  const [wished, setWished] = useState(false);
  const [wishedLists, setWishedLists] = useState([]);
  const [addressData, setAddressData] = useState([]);
  const [showSelectAddress, setShowSelectAddress] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressFullName, setAddressFullName] = useState("");
  const [addressHouse, setAddressHouse] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [showSelectlist, setShowSelectlist] = useState(false);
  const [showAddlist, setShowAddlist] = useState(false);
  const [newlist, setNewlist] = useState("");
  const [addlistError, setAddlistError] = useState(false);
  const [addlistErrorMessage, setAddlistErrorMessage] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const address = JSON.parse(localStorage.getItem("address"));
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const mailId = userInfo?.mailId;
  const imageUrls = [
    {
      src: "https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg",
    },
    {
      src: "https://cdn.thewirecutter.com/wp-content/media/2023/06/bestlaptops-2048px-9765.jpg?auto=webp&quality=75&width=1024",
    },
    {
      src: "https://www.itaf.eu/wp-content/uploads/2021/01/Best-laptops-in-2021-7-things-to-consider-when-buying-a-laptop.jpg",
    },
    {
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlygWcz51gyDexlstejSgZZ2LSxqF4rBz3wQ&s",
    },
    {
      src: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGxhcHRvcHxlbnwwfHwwfHx8MA%3D%3D",
    },
  ];
  const [currentUrl, setCurrentUrl] = useState(imageUrls[0].src);

  /* Product APIs */

  async function getProduct() {
    let response = await axios.post("http://localhost:3000/getproduct", {
      id: product,
    });
    if (response.data.access) {
      let data = response.data.data[0];
      let mrp = currencyConvert(data.price);
      let offer_price = data.price - data.price * (data.discount / 100);
      let offer_price_rounded = Math.round(offer_price * 100) / 100;
      let offerPriceInt = offer_price_rounded.toString().split(".")[0];
      let offerPriceDecimal = offer_price_rounded.toString().split(".")[1];
      let offerPriceActual;
      if (offerPriceDecimal === undefined) {
        offerPriceActual = currencyConvert(offerPriceInt) + ".00";
      } else {
        offerPriceActual =
          currencyConvert(offerPriceInt) + "." + offerPriceDecimal;
      }
      data.mrp = mrp;
      data.actualPrice = offerPriceActual;
      setProductData(data);
    } else {
      setSuccess(false);
      setSuccessMessage("");
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  /* Wishlist and Cart APIs */

  async function getWishlists() {
    if (mailId) {
      const listsResponse = await axios.post(
        "http://localhost:3000/getwishlists",
        {
          mailId: mailId,
        }
      );
      if (listsResponse.data.access) {
        setWishlists(listsResponse.data.data);
      } else {
        setSuccess(false);
        setSuccessMessage("");
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
    }
  }

  async function addWishlist() {
    if (mailId) {
      let addListAccess;
      if (newlist.length) {
        if (wishlists.length) {
          for (let i = 0; i < wishlists.length; i++) {
            if (
              newlist.toLowerCase() == wishlists[i].wishlistname.toLowerCase()
            ) {
              setAddlistError(true);
              setAddlistErrorMessage(
                "You have another list with the same name!"
              );
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
          if (response.data.access) {
            setWishlists(response.data.data);
            setShowAddlist(false);
            setAddlistError(false);
            setAddlistErrorMessage("");
            addToWishlist(newlist);
          }
        } else {
          setSuccess(false);
          setSuccessMessage("");
          setError(true);
          setErrorMessage(response.data.errorMsg);
          setTimeout(() => {
            setError(false);
          }, 3500);
        }
      } else {
        setAddlistError(true);
        setAddlistErrorMessage("Wishlist name cannot be empty!");
      }
    } else {
      navigate("/account");
    }
  }

  async function getWishedInfo() {
    if (mailId) {
      const response = await axios.post("http://localhost:3000/checkwished", {
        mailId: mailId,
        productId: product,
      });
      if (response.data.access) {
        setWished(true);
        let wishedlists = response.data.data.map((list) => {
          return list.wishlistname;
        });
        setWishedLists(wishedlists);
      } else {
        setWished(false);
        setWishedLists([]);
      }
    }
  }

  async function addToWishlist(list) {
    if (mailId) {
      const response = await axios.post("http://localhost:3000/addtowish", {
        id: productData.id,
        title: productData.title,
        mailId: mailId,
        price: productData.price,
        discount: productData.discount,
        wishlist: list,
      });
      if (response.data.access) {
        setShowSelectlist(false);
        setError(false);
        setErrorMessage("");
        setSuccess(true);
        setSuccessMessage(response.data.successMsg);
        getWishedInfo();
        setTimeout(() => {
          setSuccess(false);
        }, 3500);
      } else {
        setSuccess(false);
        setSuccessMessage("");
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
    } else {
      navigate("/account");
    }
  }

  async function removeFromWishlist(list) {
    if (mailId) {
      let response = await axios.delete(
        "http://localhost:3000/removefromwish",
        {
          data: { productId: productData.id, list: list, mail: mailId },
        }
      );
      if (response.data.access) {
        setSuccess(true);
        setSuccessMessage(response.data.successMsg);
        setError(false);
        setErrorMessage("");
        setShowSelectlist(false);
        setTimeout(() => {
          setSuccess(false);
        }, 3500);
        getWishedInfo();
      } else {
        setSuccess(false);
        setSuccessMessage("");
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
    } else {
      navigate("/account");
    }
  }

  async function addToCart() {
    if (mailId) {
      const response = await axios.post("http://localhost:3000/addtocart", {
        id: product,
        title: productData.title,
        price: productData.price,
        discount: productData.discount,
        count: count,
        mailId: mailId,
      });
      if (response.data.access) {
        setSuccess(true);
        setSuccessMessage(response.data.successMsg);
        setError(false);
        setErrorMessage("");
        setTimeout(() => {
          setSuccess(false);
        }, 3500);
      } else {
        setSuccess(false);
        setSuccessMessage("");
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
    } else {
      navigate("/account");
    }
  }

  /* Address APIs */

  async function getAddress() {
    let response = await axios.post("http://localhost:3000/getaddress", {
      mail: mailId,
    });
    if (response.data.access) {
      setAddressData(response.data.data);
    } else {
      console.log(response.data.errorMsg);
    }
  }

  async function addDeliveryAddress() {
    if (mailId) {
      let response = await axios.post("http://localhost:3000/addaddress", {
        mail: mailId,
        name: addressFullName,
        house: addressHouse,
        street: addressStreet,
        landmark: addressLandmark,
        city: addressCity,
        state: addressState,
        country: addressCountry,
      });
      if (response.data.access) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...userInfo, base_address: addressFullName })
        );
        localStorage.setItem(
          "address",
          JSON.stringify({
            addressname: addressFullName,
            house: addressHouse,
            street: addressStreet,
            landmark: addressLandmark,
            city: addressCity,
            state: addressState,
            country: addressCountry,
          })
        );
        setShowAddAddress(false);
        setAddressData(response.data.data);
        setSuccess(true);
        setSuccessMessage(response.data.successMsg);
        setError(false);
        setErrorMessage("");
        setTimeout(() => {
          setSuccess(false);
        }, 3500);
      } else {
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
    } else {
      navigate("/account");
    }
  }

  async function changeBaseAddress(current) {
    if (mailId) {
      let response = await axios.put(
        "http://localhost:3000/updatebaseaddress",
        {
          address: current,
          mailId: mailId,
        }
      );
      if (response.data.access) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...userInfo, base_address: current.addressname })
        );
        localStorage.setItem("address", JSON.stringify(current));
        setSuccess(true);
        setSuccessMessage(response.data.successMsg);
        setError(false);
        setErrorMessage("");
        setTimeout(() => {
          setSuccess(false);
        }, 3500);
      } else {
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setSuccess(false);
        setSuccessMessage("");
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
      setShowSelectAddress(false);
    } else {
      navigate("/account");
    }
  }

  /* Reviews APIs */

  async function getReviews() {
    let response = await axios.post("http://localhost:3000/getreviews", {
      id: product,
    });
    if (response.data.access) {
      repeater(response);
    }
  }

  async function addReview() {
    const username = userInfo?.firstname + " " + userInfo?.lastname;
    if (mailId) {
      if (review.length || starSetIndex >= 0) {
        if (hasReview) {
          let response = await axios.put("http://localhost:3000/editreview", {
            id: product,
            mail: mailId,
            review: review,
            rating: starSetIndex + 1,
          });
          if (response.data.access) {
            repeater(response);
            setSuccess(true);
            setSuccessMessage(response.data.successMsg);
            setError(false);
            setErrorMessage("");
            setTimeout(() => {
              setSuccess(false);
            }, 3500);
          } else {
            setError(true);
            setErrorMessage(response.data.errorMsg);
            setSuccess(false);
            setSuccessMessage("");
            setTimeout(() => {
              setError(false);
            }, 3500);
          }
        } else {
          let response = await axios.post("http://localhost:3000/addreview", {
            id: product,
            mail: mailId,
            user: username,
            review: review,
            rating: starSetIndex + 1,
          });
          if (response.data.access) {
            repeater(response);
            setSuccess(true);
            setSuccessMessage(response.data.successMsg);
            setError(false);
            setErrorMessage("");
            setTimeout(() => {
              setSuccess(false);
            }, 3500);
          } else {
            setError(true);
            setErrorMessage(response.data.errorMsg);
            setSuccess(false);
            setSuccessMessage("");
            setTimeout(() => {
              setError(false);
            }, 3500);
          }
        }
        setShowReview(true);
      }
    } else {
      navigate("/account");
    }
  }

  async function deleteReview() {
    if (mailId) {
      let response = await axios.delete("http://localhost:3000/deletereview", {
        data: { id: product, mail: mailId },
      });
      if (response.data.access) {
        repeater(response);
        setSuccess(true);
        setSuccessMessage(response.data.successMsg);
        setError(false);
        setErrorMessage("");
        setTimeout(() => {
          setSuccess(false);
        }, 3500);
      } else {
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setSuccess(false);
        setSuccessMessage("");
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
      setShowReview(true);
    } else {
      navigate("/account");
    }
  }

  /* Buy APIs */

  async function buyProduct() {
    if (mailId) {
      let response = await axios.post("http://localhost:3000/buyproduct", {
        product: productData,
        count: count,
        mail: userInfo?.mailId,
      });
      if (response.data.access) {
        window.open(`${window.location.origin}/buy`);
      } else {
        setError(true);
        setErrorMessage(response.data.errorMsg);
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
    } else {
      navigate("/account");
    }
  }

  /* Useful Functions */

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

  function getTotalRatings(value) {
    let ratingsNumber = 0;
    if (reviews.length) {
      reviews.forEach((review) => {
        if (review.rating == value) {
          ratingsNumber += 1;
        }
      });
    }
    if (yourReview) {
      if (yourReview.rating == value) {
        ratingsNumber += 1;
      }
    }
    return ratingsNumber;
  }

  function repeater(response) {
    let totalRating = 0;
    let totalRatings = 0;
    let actualProductRating = 0;
    let averageRatingRounded = 0;
    let otherUserReviews = response.data.data.filter((review) => {
      if (review.mailid !== mailId) {
        totalRating += review.rating;
        if (review.rating) {
          totalRatings += 1;
        }
        return review;
      }
    });
    setReviews(otherUserReviews);
    let currentUserReview = response.data.data.filter((review) => {
      if (review.mailid === mailId) {
        totalRating += review.rating;
        if (review.rating) {
          totalRatings += 1;
        }
        return review;
      }
    });
    setRatings(totalRatings);
    if (currentUserReview.length) {
      setHasReview(true);
      setReview(currentUserReview[0].review);
      setYourReview(currentUserReview[0]);
      setStarSetIndex(currentUserReview[0].rating - 1);
    } else {
      setHasReview(false);
      setReview("");
      setYourReview({});
      setStarSetIndex(-1);
    }
    if (response.data.data.length != 0) {
      if (totalRatings) {
        actualProductRating = totalRating / totalRatings;
      }
      setActualRating(actualProductRating.toFixed(1));
      averageRatingRounded = Math.round(actualProductRating) - 1;
      setAverageStarRating(averageRatingRounded);
    } else {
      setActualRating(0);
      setAverageStarRating(-1);
    }
  }

  function deliveryDateCalculator() {
    let todayDate = new Date();
    let deliveryDate = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate() + 7
    );
    let delDtStr = deliveryDate.toDateString();
    let delDtDisplay = `${delDtStr.split(" ")[0]}, ${delDtStr.split(" ")[1]} ${
      delDtStr.split(" ")[2]
    }, ${delDtStr.split(" ")[3]}`;
    setDeliveryDate(deliveryDate);
    setDeliveryDateDisplay(delDtDisplay);
  }

  useEffect(() => {
    getProduct();
    getReviews();
    getWishlists();
    getWishedInfo();
    getAddress();
    deliveryDateCalculator();
  }, []);

  return (
    <div className="Product_Main_Container">
      {/* Select Wishlist Box */}
      <div
        className={
          showSelectlist
            ? "Product_Wishlist_Selector--Active"
            : "Product_Wishlist_Selector"
        }
      >
        <div className="Product_Wishlist_Selector--Tint"></div>
        <div className="Product_Wishlist_Selector--Container">
          <div className="Product_Wishlist_Selector--Header_Container">
            <div className="Product_Wishlist_Selector--Header">
              <h2 className="Product_Wishlist_Selector--Header_Heading">
                Select wishlist
              </h2>
              <button
                className="Product_Wishlist_Selector--Header_Button"
                onClick={() => {
                  setShowAddlist(true);
                  setShowSelectlist(false);
                }}
              >
                Create new list
              </button>
            </div>
          </div>
          <div className="Product_Wishlist_Selector--Lists">
            {wishlists.length ? (
              wishlists.map((list, index) => {
                return (
                  <div className="Product_Wishlist_Selector--List" key={index}>
                    <p
                      className="Product_Wishlist_Selector--Listname"
                      onClick={() => {
                        addToWishlist(list.wishlistname);
                      }}
                    >
                      {list.wishlistname}
                    </p>
                    <FaHeart
                      className={
                        wishedLists.includes(list.wishlistname)
                          ? "Product_Wishlist_Selector--Heart--Wished"
                          : "Product_Wishlist_Selector--Heart--Notwished"
                      }
                      size={20}
                      onClick={() => {
                        removeFromWishlist(list.wishlistname);
                      }}
                    />
                  </div>
                );
              })
            ) : (
              <p className="Product_Wishlist_Selector--Lists_Error">
                No lists to show!
              </p>
            )}
          </div>
          <div className="Product_Wishlist_Selector--Buttons">
            {/* <button className="Product_Wishlist_Selector--Buttons_Create">
              Create new list
            </button> */}
            <button
              className="Product_Wishlist_Selector--Buttons_Cancel"
              onClick={() => {
                setShowSelectlist(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      {/* Add Wishlist Box */}
      <div
        className={
          showAddlist
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
              addlistError
                ? "Wish_AddNewList--Error"
                : "Wish_AddNewList--Error--Inactive"
            }
          >
            <p className="Wish_AddNewList--Error_Heading">Error!</p>
            <p className="Wish_AddNewList--Error_Note">{addlistErrorMessage}</p>
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
                  setShowAddlist(false);
                  setAddlistError(false);
                  setAddlistErrorMessage("");
                }}
              >
                Cancel
              </button>
              <button
                className="Wish_AddNewList--Buttons_Create"
                onClick={addWishlist}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Add Address Box */}
      <div
        className={
          showAddAddress
            ? "Product_Add_Address"
            : "Product_Add_Address--Inactive"
        }
      >
        <div className="Product_Add_Address--Tint"></div>
        <div className="Product_Add_Address--Container">
          <div className="Product_Add_Address--Subcontainer">
            <div
              className="Close--Product_Add_Address"
              onClick={() => {
                setShowAddAddress(false);
              }}
            >
              <span className="Close--Product_Add_Address--Cross"></span>
            </div>
            <div className="Product_Add_Address--Header">
              <h3>Add Delivery Address</h3>
            </div>
            <div className="Product_Add_Address--Address">
              <div className="Product_Add_Address--Portion Product_Add_Address--Name">
                <label>Address name</label>
                <input
                  value={addressFullName}
                  onChange={(e) => {
                    setAddressFullName(e.target.value);
                  }}
                  required
                ></input>
              </div>
              <div className="Product_Add_Address--Portion Product_Add_Address--House">
                <label>House/Flat</label>
                <input
                  value={addressHouse}
                  onChange={(e) => {
                    setAddressHouse(e.target.value);
                  }}
                  required
                ></input>
              </div>
              <div className="Product_Add_Address--Portion Product_Add_Address--Street">
                <label>Street</label>
                <input
                  value={addressStreet}
                  onChange={(e) => {
                    setAddressStreet(e.target.value);
                  }}
                  required
                ></input>
              </div>
              <div className="Product_Add_Address--Portion Product_Add_Address--Landmark">
                <label>Landmark</label>
                <input
                  value={addressLandmark}
                  onChange={(e) => {
                    setAddressLandmark(e.target.value);
                  }}
                  required
                ></input>
              </div>
              <div className="Product_Add_Address--Portion Product_Add_Address--City">
                <label>City</label>
                <input
                  value={addressCity}
                  onChange={(e) => {
                    setAddressCity(e.target.value);
                  }}
                  required
                ></input>
              </div>
              <div className="Product_Add_Address--Portion Product_Add_Address--State">
                <label>State</label>
                <input
                  value={addressState}
                  onChange={(e) => {
                    setAddressState(e.target.value);
                  }}
                  required
                ></input>
              </div>
              <div className="Product_Add_Address--Portion Product_Add_Address--Country">
                <label>Country</label>
                <input
                  value={addressCountry}
                  onChange={(e) => {
                    setAddressCountry(e.target.value);
                  }}
                  required
                ></input>
              </div>
              <div className="Product_Add_Address--Portion Product_Add_Address--Button">
                <button onClick={addDeliveryAddress}>
                  Add Delivery Address
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Select Address Box */}
      <div
        className={
          showSelectAddress
            ? "Product_Select_Address"
            : "Product_Select_Address--Inactive"
        }
      >
        <div className="Product_Select_Address--Tint"></div>
        <div className="Product_Select_Address--Address_Container">
          <div className="Product_Select_Address--Address_Subcontainer">
            <div
              className="Close--Product_Select_Address"
              onClick={() => {
                setShowSelectAddress(false);
              }}
            >
              <span className="Close--Product_Select_Address--Cross"></span>
            </div>
            <div className="Product_Select_Address--Header">
              <h3>Select Delivery Address</h3>
              <button
                onClick={() => {
                  setShowAddAddress(true);
                  setShowSelectAddress(false);
                }}
              >
                Add New Address
              </button>
            </div>
            {addressData.length ? (
              addressData.map((address, index) => {
                return (
                  <div key={index} className="Product_Select_Address--Address">
                    <p className="Product_Select_Address--Name">
                      {address.addressname}
                    </p>
                    <p className="Product_Select_Address--House">
                      {address.house}
                    </p>
                    <p className="Product_Select_Address--Street">
                      {address.street}
                    </p>
                    <p className="Product_Select_Address--Landmark">
                      Near {address.landmark}
                    </p>
                    <p className="Product_Select_Address--City_State">
                      {address.city}, {address.state}
                    </p>
                    <p className="Product_Select_Address--Country">
                      {address.country}
                    </p>
                    <div className="Product_Select_Address--Button">
                      <button
                        onClick={() => {
                          changeBaseAddress(address);
                        }}
                      >
                        Deliver to this address
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="Product_Select_Address--Empty">
                <p className="Product_Select_Address--Empty--Note">
                  You have not added any delivery address. Add an address to
                  ship your order!
                </p>
                <button
                  className="Product_Select_Address--Empty--Button"
                  onClick={() => {
                    setShowAddAddress(true);
                    setShowSelectAddress(false);
                  }}
                >
                  Add Delivery Address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
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
      {/* Product Main */}
      <div className="Product_Main">
        {/* Product Details Section */}
        <div className="Product_Main--Product">
          <div className="Product_Main--Product_Images">
            <div className="Product_Images--Main_Image">
              <img src={currentUrl}></img>
            </div>
            <div className="Product_Images--More_Images">
              {imageUrls.map((url, index) => {
                return (
                  <div
                    key={index}
                    className={
                      url.src == currentUrl
                        ? "Product_More_Images--Image Product_More_Images--Image--Active"
                        : "Product_More_Images--Image"
                    }
                    onClick={() => {
                      setCurrentUrl(url.src);
                    }}
                  >
                    <img src={url.src} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="Product_Main--Product_Details">
            <p className="Product_Details--Name">{productData?.title}</p>
            <p className="Product_Details--Category">
              {productData?.category} - {productData?.company}
            </p>
            <div className="Product_Details--Rating">
              <span className="Product_Details--Actualrating">
                {actualRating}
              </span>
              <div className="Product_Details--Stars">
                {Array(5)
                  .fill(0)
                  .map((_, index) => {
                    return (
                      <FaStar
                        className="Product_Details--Star"
                        key={index}
                        size={20}
                        color={index <= averageStarRating ? "orange" : "white"}
                      />
                    );
                  })}
              </div>
              <span className="Product_Details--Ratingscount">
                {ratings} ratings
              </span>
              <FaHeart
                size={20}
                className={
                  wished
                    ? "Product_Details--Heart Product_Details--Heart--Wished"
                    : "Product_Details--Heart"
                }
                onClick={() => {
                  setShowSelectlist(true);
                }}
              />
            </div>
            <p className="Product_Details--Price">
              <span className="Product_Details--Discount">
                -{productData?.discount}%
              </span>{" "}
              ₹{productData?.actualPrice}
            </p>
            <p className="Product_Details--MRP">
              M.R.P:{" "}
              <span className="Product_Details--MRP_Strike">
                ₹{productData?.mrp}
              </span>
            </p>
            <div className="Product_Details--Address">
              {address ? (
                <>
                  <p>
                    Delivering to {address?.addressname} - {address?.street}
                  </p>
                  <p>{address?.city}</p>
                </>
              ) : (
                <>
                  <p>No delivery address selected!</p>
                </>
              )}
            </div>
            <div className="Product_Details--Buttons">
              <div className="Product_Details--Counter">
                <span className="Product_Details--Counter--Note">Qty: </span>
                <button
                  className="Product_Details_Counter--Decrement"
                  onClick={() => {
                    setCount((prev) => {
                      return prev - 1;
                    });
                  }}
                >
                  -
                </button>
                <input
                  className="Product_Details_Counter--Input"
                  type="input"
                  value={count}
                  onChange={(e) => {
                    setCount(e.target.value);
                  }}
                ></input>
                <button
                  className="Product_Details_Counter--Increment"
                  onClick={() => {
                    setCount((prev) => {
                      return prev + 1;
                    });
                  }}
                >
                  +
                </button>
              </div>
              <button
                className="Product_Detail--Button Product_Details--Buttons_Buy"
                onClick={buyProduct}
              >
                Buy now
              </button>
              <button
                className="Product_Detail--Button Product_Details--Buttons_Cart"
                onClick={() => {
                  // window.open(`${window.location.origin}/buy/${product}`);
                  addToCart();
                }}
              >
                Add to cart
              </button>
              {/* <FaHeart size={22} className="Product_Details--Heart" /> */}
            </div>
          </div>
        </div>
        {/* Product About Section */}
        <div className="Product_Main--About_And_Delivery">
          <div className="Product_Main--About">
            <h4>About the product</h4>
            <p>
              Introducing our latest electronic product, the ProSound Wireless
              Earbuds—your perfect companion for an immersive audio experience.
              With sleek design and cutting-edge technology, these earbuds
              deliver crystal-clear sound and deep bass, ensuring you never miss
              a beat.
            </p>
            <p>
              When you purchase the ProSound Wireless Earbuds, you'll receive
              everything you need to get started. Inside the box, you'll find
              the earbuds themselves, along with a compact charging case that
              provides up to 20 hours of additional playtime.
            </p>
            <p>
              We've also added a few extras to enhance your experience with the
              ProSound Wireless Earbuds. Included in the package is a quick
              start guide to help you set up your earbuds in minutes, along with
              a warranty card that provides coverage for any manufacturing
              defects for up to one year.
            </p>
            <p>
              Lastly, the ProSound Wireless Earbuds come with access to our
              dedicated customer support team, available 24/7 to assist you with
              any questions or issues.
            </p>
          </div>
          <div className="Product_Main--Delivery">
            <h4>Shipping details</h4>
            <h5>Delivery address</h5>
            {address ? (
              <div className="Product_Main--Delivery_Address">
                <p className="Product_Main--Delivery_Address--Info Product_Main--Delivery_Address--Addressname">
                  {address.addressname}
                </p>
                <p className="Product_Main--Delivery_Address--Info">
                  {address.house}
                </p>
                <p className="Product_Main--Delivery_Address--Info">
                  {address.landmark}
                </p>
                <p className="Product_Main--Delivery_Address--Info">
                  {address.street}
                </p>
                <p className="Product_Main--Delivery_Address--Info">
                  {address.city}, {address.state}
                </p>
                <p className="Product_Main--Delivery_Address--Info">
                  {address.country}
                </p>
                <button
                  onClick={() => {
                    setShowSelectAddress(true);
                  }}
                >
                  Change Delivery Address
                </button>
              </div>
            ) : (
              <div className="Product_Main--Delivery_Address--Empty">
                <p>
                  No delivery address selected. Please select a delivery
                  address!
                </p>
                <button
                  onClick={() => {
                    setShowSelectAddress(true);
                  }}
                >
                  Select Delivery Address
                </button>
              </div>
            )}
            <h5>Delivery date</h5>
            <p>{deliveryDateDisplay}</p>
          </div>
        </div>
        {/* Product Reviews And Ratings */}
        <div className="Product_Main--Reviews">
          <div className="Product_Reviews--Header">
            <h4 className="Product_Reviews--Header_Heading">Product Reviews</h4>
          </div>
          <div className="Product_Reviews--Main">
            {/* Product Rating Container */}
            <div className="Product_Reviews--Rating">
              {/* Product Average Star Rating Container */}
              <div className="Product_Reviews--Stars_Container">
                <div className="Product_Reviews--Stars">
                  {Array(5)
                    .fill(0)
                    .map((_, index) => {
                      return (
                        <FaStar
                          className="Product_Reviews--Star"
                          key={index}
                          size={20}
                          color={
                            index <= averageStarRating ? "orange" : "white"
                          }
                        />
                      );
                    })}
                </div>
                <p className="Product_Reviews--Actualrating">
                  {actualRating} out of 5
                </p>
              </div>
              {/* Number Of Ratings */}
              <p className="Product_Reviews--Ratingscount">
                {ratings} ratings.
              </p>
              {/* Rating Distribution */}
              <div className="Product_Reviews--Rating_Distribution_Container">
                {Array(5)
                  .fill(0)
                  .map((_, index) => {
                    let ratingsCount = getTotalRatings(5 - index);
                    let ratingsPercentage = 0;
                    if (ratings != 0) {
                      ratingsPercentage = Math.floor(
                        (ratingsCount / ratings) * 100
                      );
                    }
                    return (
                      <div
                        key={index}
                        className="Product_Reviews--Rating_Distribution--Stars"
                      >
                        <div>
                          {Array(5 - index)
                            .fill(0)
                            .map((_, index) => {
                              return (
                                <FaStar
                                  key={index}
                                  className="Product_Reviews--Rating_Distribution--Star"
                                  color="orange"
                                />
                              );
                            })}
                        </div>
                        <p className="Product_Reviews--Rating_Distribution--Percentage">
                          {ratingsPercentage}%
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
            {/* Product Review Container */}
            <div className="Product_Reviews--Reviews_Container">
              {/* Your Own Review Container */}
              <div
                className={
                  showReview
                    ? "Product_Reviews--Your_Review_Container"
                    : "Product_Reviews--Your_Review_Container--Inactive"
                }
              >
                {/* If You Donot Have Own Review */}
                <p
                  className={
                    hasReview
                      ? "Product_Reviews--Your_Review--Note--Inactive"
                      : "Product_Reviews--Your_Review--Note"
                  }
                >
                  Add your review about this product.
                </p>
                {/* If You Have Own Review */}
                <div
                  className={
                    showReview && hasReview
                      ? "Product_Reviews--Your_Review_Main"
                      : "Product_Reviews--Your_Review_Main--Inactive"
                  }
                >
                  <p className="Product_Reviews--Your_Name">
                    {userInfo?.firstname} {userInfo?.lastname}
                  </p>
                  <div className="Product_Reviews--Your_Rating--Stars">
                    {Array(5)
                      .fill(0)
                      .map((_, index) => {
                        return (
                          <FaStar
                            key={index}
                            className="Product_Reviews--Your_Rating--Star"
                            color={
                              index <= yourReview.rating - 1
                                ? "orange"
                                : "white"
                            }
                          />
                        );
                      })}
                  </div>
                  <p className="Product_Reviews--Your_Review">{review}</p>
                </div>
                {/* Add/Edit Your Own Review Buttons Container */}
                <div
                  className={
                    showReview
                      ? "Product_Reviews--Your_Review--Add_Edit_Button"
                      : "Product_Reviews--Your_Review--Add_Edit_Button--Inactive"
                  }
                >
                  <button
                    onClick={() => {
                      setShowReview(false);
                    }}
                  >
                    {hasReview ? "Edit review" : "Add review"}
                  </button>
                </div>
              </div>
              {/* Write or Edit Your Own Review Container */}
              <div
                className={
                  showReview
                    ? "Product_Reviews--Write_Review Product_Reviews--Write_Review--Inactive"
                    : "Product_Reviews--Write_Review"
                }
              >
                <p className="Product_Reviews--Write_Review--Your_Name">
                  Reviewing as {userInfo?.firstname} {userInfo?.lastname}
                </p>
                {/* Give Your Star Rating Container */}
                <div className="Product_Reviews--Write_Review--Rating">
                  <div
                    className="Product_Reviews--Write_Review--Stars"
                    onMouseLeave={() => {
                      setStarHoverIndex(-1);
                    }}
                  >
                    {Array(5)
                      .fill(0)
                      .map((_, index) => {
                        return (
                          <FaStar
                            className="Product_Reviews--Write_Review--Star"
                            key={index}
                            size={20}
                            color={
                              index <= starHoverIndex || index <= starSetIndex
                                ? "orange"
                                : "white"
                            }
                            onMouseOver={() => {
                              setStarHoverIndex(index);
                            }}
                            onClick={() => {
                              setStarSetIndex(index);
                            }}
                          />
                        );
                      })}
                  </div>
                </div>
                {/* Give Your Review Textarea */}
                <textarea
                  placeholder="Write your review..."
                  rows={5}
                  className="Product_Reviews--Write_Review--Review_Input"
                  value={review}
                  onChange={(e) => {
                    setReview(e.target.value);
                  }}
                ></textarea>
                {/* Add-Edit-Delete Your Review Buttons */}
                <div className="Product_Reviews--Write_Review--Buttons">
                  <div className="Product_Reviews--Write_Review--Submit_Cancel_Buttons">
                    <button
                      className="Product_Reviews--Write_Review--Buttons--Submit"
                      onClick={addReview}
                    >
                      Submit
                    </button>
                    <button
                      className="Product_Reviews--Write_Review--Buttons--Cancel"
                      onClick={() => {
                        setShowReview(true);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  <div
                    className={
                      hasReview
                        ? "Product_Reviews--Write_Review--Delete_Buttons"
                        : "Product_Reviews--Write_Review--Delete_Buttons Product_Reviews--Write_Review--Delete_Buttons--Inactive"
                    }
                  >
                    <button
                      className="Product_Reviews--Write_Review--Buttons--Delete"
                      onClick={deleteReview}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              {/* Other People Reviews Container */}
              <div className="Product_Reviews--Others_Reviews_Container">
                {reviews.length == 0 ? (
                  <div className="Product_Reviews--No_Reviews">
                    <p>
                      {hasReview
                        ? "Your's is the first review on this product!"
                        : "This porduct has no user reviews. Be the first person to review this product!"}
                    </p>
                  </div>
                ) : (
                  reviews.map((review) => {
                    return (
                      <div
                        key={review.id}
                        className="Product_Reviews--Others_Review_Container"
                      >
                        <p className="Product_Reviews--Others_Review--Name">
                          {review.username}
                        </p>
                        <div className="Product_Reviews--Others_Review--Rating">
                          <div className="Product_Reviews--Others_Review--Stars">
                            {Array(5)
                              .fill(0)
                              .map((_, index) => {
                                return (
                                  <FaStar
                                    key={index}
                                    className="Product_Reviews--Others_Review--Star"
                                    color={
                                      index <= review.rating - 1
                                        ? "orange"
                                        : "white"
                                    }
                                  />
                                );
                              })}
                          </div>
                        </div>
                        <p className="Product_Reviews--Others_Review">
                          {review.review}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
