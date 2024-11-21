import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import "../../styles/Items.css";

function Items() {
  const navigate = useNavigate();
  const { item } = useParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [wishProduct, setWishProduct] = useState({});
  const [addListShow, setAddListShow] = useState(false);
  const [newlist, setNewlist] = useState("");
  const [selectedWishlist, setSelectedWistlist] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [lowerPrice, setLowerPrice] = useState("");
  const [upperPrice, setUpperPrice] = useState("");
  const [allCat, setAllCat] = useState([]);
  const [allCom, setAllCom] = useState([]);
  const [showSelectlist, setShowSelectlist] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [addlistError, setAddlistError] = useState(false);
  const [addListErrorMessage, setaddListErrorMessage] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const mailId = userInfo?.mailId;

  /* Wishlist APIs */

  async function getWishlists() {
    if (mailId) {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/getwishlists`,
        {
          mailId: mailId,
        }
      );
      if (response.data.access) {
        setWishlists(response.data.data);
      } else {
        setError(true);
        setErrorMessage(response.data.errorMsg);
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
              setAddlistError(true);
              setaddListErrorMessage(
                "You have another wishlist with the same name!"
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
            `${import.meta.env.VITE_BASE_URL}/addwishlist`,
            {
              mailId: mailId,
              wishlistname: newlist,
            }
          );
          setWishlists(response.data.data);
          setAddListShow(false);
          setAddlistError(false);
          setaddListErrorMessage("");
          addToWishlist(wishProduct, newlist);
          if (wishlists.length == 0) {
            setSelectedWistlist(newlist);
          }
        }
      } else {
        setAddlistError(true);
        setaddListErrorMessage("Wishlist name cannot be empty!");
      }
    } else {
      navigate("/account");
    }
  }

  async function addToWishlist(product, list) {
    if (mailId) {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/addtowish`,
        {
          id: product.id,
          title: product.title,
          mailId: mailId,
          price: product.price,
          discount: product.discount,
          company: product.company,
          category: product.category,
          wishlist: list,
        }
      );
      if (response.data.access) {
        setError(false);
        setErrorMessage("");
        setSuccess(true);
        setSuccessMessage(response.data.successMsg);
        setShowSelectlist(false);
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

  /* Cart API */

  async function addToCart(product) {
    if (mailId) {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/addtocart`,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          discount: product.discount,
          company: product.company,
          category: product.category,
          mailId: mailId,
          count: 1,
        }
      );
      if (response.data.access) {
        setError(false);
        setErrorMessage("");
        setSuccess(true);
        setSuccessMessage(response.data.successMsg);
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

  /* Product APIs */

  async function getProducts() {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getproducts`,
      {
        category: item,
      }
    );
    if (response.data.access) {
      const data = response.data.data;
      let productsId = [];
      data.map((product) => {
        productsId.push(product.id);
      });
      async function getReviews() {
        let response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/getallreviews`,
          {
            id: productsId,
          }
        );
        if (response.data.access) {
          setReviews(response.data.data);
        } else {
          setError(true);
          setErrorMessage(response.data.errorMsg);
          setTimeout(() => {
            setError(false);
          }, 3500);
        }
        setProducts(data);
        setAllProducts(data);
      }
      getReviews();
      setError(false);
    } else {
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  /* Get Filters APIs */

  async function getCompany() {
    let response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getcompany`,
      {
        category: item,
      }
    );
    if (response.data.access) {
      setAllCom(response.data.data);
      setError(false);
    } else {
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
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

  /* Filtering Function */

  useEffect(() => {
    let newData = allProducts.filter((product) => {
      if (selectedCompany) {
        if (lowerPrice || upperPrice) {
          let price = product.price - product.price * (product.discount / 100);
          if (upperPrice == 0) {
            if (lowerPrice <= price && product.company == selectedCompany) {
              return product;
            }
          } else {
            if (
              lowerPrice <= price &&
              upperPrice >= price &&
              product.company == selectedCompany
            ) {
              return product;
            }
          }
        } else {
          if (product.company == selectedCompany) {
            return product;
          }
        }
      } else {
        if (lowerPrice || upperPrice) {
          let price = product.price - product.price * (product.discount / 100);
          if (upperPrice == 0) {
            if (lowerPrice <= price) {
              return product;
            }
          } else {
            if (lowerPrice <= price && upperPrice >= price) {
              return product;
            }
          }
        }
      }
    });
    setProducts(newData);
  }, [lowerPrice, upperPrice, selectedCompany]);

  useEffect(() => {
    getProducts();
    getWishlists();
    getCompany();
  }, []);

  return (
    <div className="Items_Page">
      {/* Add Wishlist Box */}
      <div
        className={
          addListShow
            ? "Items_AddNewList_Container"
            : "Items_AddNewList_Container--Inactive"
        }
      >
        <div className="Items_AddNewList--Tint"></div>
        <div className="Items_AddNewList">
          <div className="Items_AddNewList--Header">
            <p className="Items_AddNewList--Header_Heading">Add new list</p>
            <p className="Items_AddNewList--Header_Note">
              Create a new wish list to save your favourite items!
            </p>
          </div>
          <div
            className={
              addlistError
                ? "Items_AddNewList--Error"
                : "Items_AddNewList--Error--Inactive"
            }
          >
            <p className="Items_AddNewList--Error_Heading">Error!</p>
            <p className="Items_AddNewList--Error_Note">
              {addListErrorMessage}
            </p>
          </div>
          <div className="Items_AddNewList--Input">
            <label>Wishlist name</label>
            <input
              type="text"
              value={newlist}
              onChange={(e) => {
                setNewlist(e.target.value);
              }}
              placeholder="Enter list name"
            ></input>
            <div className="Items_AddNewList--Input_Buttons">
              <button
                className="Items_AddNewList--Buttons_Cancel"
                onClick={() => {
                  setAddListShow(false);
                  setAddlistError(false);
                  setaddListErrorMessage("");
                  setNewlist("");
                }}
              >
                Cancel
              </button>
              <button
                className="Items_AddNewList--Buttons_Create"
                onClick={addwishlist}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Select Wishlist Box */}
      <div
        className={
          showSelectlist
            ? "Items_Wishlist_Selector--Active"
            : "Items_Wishlist_Selector"
        }
      >
        <div className="Items_Wishlist_Selector--Tint"></div>
        <div className="Items_Wishlist_Selector--Container">
          <div className="Items_Wishlist_Selector--Header_Container">
            <div className="Items_Wishlist_Selector--Header">
              <h2 className="Items_Wishlist_Selector--Header_Heading">
                Select wishlist
              </h2>
              <button
                className="Items_Wishlist_Selector--Header_Button"
                onClick={() => {
                  setAddListShow(true);
                  setShowSelectlist(false);
                }}
              >
                Create new list
              </button>
            </div>
          </div>
          <div className="Items_Wishlist_Selector--Lists">
            {wishlists.length ? (
              wishlists.map((list, index) => {
                return (
                  <div
                    className="Items_Wishlist_Selector--List"
                    key={index}
                    onClick={() => {
                      setSelectedWistlist(list.wishlistname);
                      addToWishlist(wishProduct, list.wishlistname);
                    }}
                  >
                    <p className="Items_Wishlist_Selector--Listname">
                      {list.wishlistname}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="Items_Wishlist_Selector--Lists_Error">
                No lists to show!
              </p>
            )}
          </div>
          <div className="Items_Wishlist_Selector--Buttons">
            {/* <button className="Items_Wishlist_Selector--Buttons_Create">
                Create new list
              </button> */}
            <button
              className="Items_Wishlist_Selector--Buttons_Cancel"
              onClick={() => {
                setShowSelectlist(false);
              }}
            >
              Cancel
            </button>
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
      {/* Items Container */}
      <div className="Items_Container">
        <div className="Items_Main">
          {/* Items Filters */}
          <div className="Items_Filters_Container">
            <div className="Items_Filters">
              <div className="Items_Filter_Container">
                <div
                  className="Items_Filters_Label"
                  onClick={() => {
                    setShowCompany(!showCompany);
                  }}
                >
                  <p className="Items_Filters_Label--Name">Select Company</p>
                </div>
                <div
                  className={
                    showCompany
                      ? "Items_Filter--Filter Items_Filter--Filter--Active"
                      : "Items_Filter--Filter Items_Filter--Filter--Inactive"
                  }
                >
                  {allCom.map((com, index) => {
                    return (
                      <div
                        className="Items_Filter--Filter_Name_Container"
                        onClick={() => {
                          setSelectedCompany(com.company);
                        }}
                        key={index}
                      >
                        <p className="Items_Filter--Filter_Name">
                          {com.company}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="Items_Filter_Container">
                <div
                  className="Items_Filters_Label"
                  onClick={() => {
                    setShowPrice(!showPrice);
                  }}
                >
                  <p className="Items_Filters_Label--Name">Select Price</p>
                </div>
                <div
                  className={
                    showPrice
                      ? "Items_Filter--Filter Items_Filter--Filter--Active"
                      : "Items_Filter--Filter Items_Filter--Filter--Inactive"
                  }
                >
                  <div
                    className="Items_Filter--Filter_Name_Container"
                    onClick={() => {
                      setLowerPrice(0);
                      setUpperPrice(15000);
                    }}
                  >
                    <p className="Items_Filter_Price">0 to 15,000</p>
                  </div>
                  <div
                    className="Items_Filter--Filter_Name_Container"
                    onClick={() => {
                      setLowerPrice(15001);
                      setUpperPrice(30000);
                    }}
                  >
                    <p className="Items_Filter_Price">15,001 to 30,000</p>
                  </div>
                  <div
                    className="Items_Filter--Filter_Name_Container"
                    onClick={() => {
                      setLowerPrice(30000);
                      setUpperPrice(45000);
                    }}
                  >
                    <p className="Items_Filter_Price">30,001 to 45,000</p>
                  </div>
                  <div
                    className="Items_Filter--Filter_Name_Container"
                    onClick={() => {
                      setLowerPrice(45000);
                      setUpperPrice(60000);
                    }}
                  >
                    <p className="Items_Filter_Price">45,001 to 60,000</p>
                  </div>
                  <div
                    className="Items_Filter--Filter_Name_Container"
                    onClick={() => {
                      setLowerPrice(60000);
                      setUpperPrice(75000);
                    }}
                  >
                    <p className="Items_Filter_Price">60,001 to 75,000</p>
                  </div>
                  <div
                    className="Items_Filter--Filter_Name_Container"
                    onClick={() => {
                      setLowerPrice(75000);
                      setUpperPrice(0);
                    }}
                  >
                    <p className="Items_Filter_Price">75,001 and above</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Actual Items */}
          <div className="Items_List_Container">
            <div className="Items_List">
              {products.map((product, index) => {
                let mrp = currencyConvert(product.price);
                let offer_price;
                if (product.final_price.toString().split(".").length < 2) {
                  offer_price = currencyConvert(product.final_price) + ".00";
                } else {
                  offer_price =
                    currencyConvert(
                      product.final_price.toString().split(".")[0]
                    ) +
                    "." +
                    product.final_price.toString().split(".")[1].padEnd(2, "0");
                }
                let data = getProductRatingData(product.id);
                return (
                  <div key={index} className="Item_Container">
                    <div className="Item_Image">
                      <img
                        src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
                        onClick={() => {
                          window.open(
                            `${window.location.origin}/products/product/${product.id}`
                          );
                        }}
                      ></img>
                    </div>
                    <div className="Item_Details">
                      <p
                        className="Item_Name"
                        onClick={() => {
                          window.open(
                            `${window.location.origin}/products/product/${product.id}`
                          );
                        }}
                      >
                        {product.title}
                      </p>
                      <p className="Item_Category">
                        {product.category} - {product.company}
                      </p>
                      <div className="Item_Rating_Top_Star_Container">
                        <span className="Item_Rating_Top">
                          {data.actualRating}
                        </span>
                        <div className="Item_Rating_Top_Star_Container--Box">
                          {Array(5)
                            .fill(0)
                            .map((_, index) => {
                              return (
                                <FaStar
                                  className="Actual_Top_Star_Rating"
                                  key={index}
                                  size={15}
                                  color={
                                    index <= data.averageStarRating
                                      ? "orange"
                                      : "white"
                                  }
                                />
                              );
                            })}
                        </div>
                        <span className="Item_Rating_Top">
                          {data.ratings}{" "}
                          {data.ratings == 1 ? "rating" : "ratings"}
                        </span>
                      </div>
                      <p className="Item_Price">
                        <span className="Item_Discount">
                          -{product.discount}%
                        </span>{" "}
                        ₹{offer_price}
                      </p>
                      <p className="Item_MRP">
                        M.R.P: <span className="Item_MRP_Strike">₹{mrp}</span>
                      </p>
                      <div className="Item_Buttons">
                        <button
                          className="Item_Addtocart_Btn"
                          onClick={() => {
                            addToCart(product);
                          }}
                        >
                          Add to cart
                        </button>
                        <button
                          className="Item_Wishlist_Btn"
                          onClick={() => {
                            setShowSelectlist(true);
                            setWishProduct(product);
                          }}
                        >
                          Wish list
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Items;
