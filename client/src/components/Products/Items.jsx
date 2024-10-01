import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import "../../styles/Items.css";

function Items() {
  const navigate = useNavigate();
  const { item } = useParams();
  console.log(item);
  const [products, setProducts] = useState([]);
  const [actualProducts, setActualProducts] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [wishProduct, setWishProduct] = useState({});
  const [selectedWishlist, setSelectedWistlist] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [lowerPrice, setLowerPrice] = useState("");
  const [upperPrice, setUpperPrice] = useState("");
  const [allCat, setAllCat] = useState([]);
  const [allCom, setAllCom] = useState([]);
  const [showSelectlist, setShowSelectlist] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const mailId = localStorage.getItem("mailId");
  console.log("products -> ", products);

  useEffect(() => {
    async function getProducts() {
      const response = await axios.post("http://localhost:3000/getproducts", {
        category: item,
      });
      const data = response.data;
      console.log(data);
      setProducts(data);
      setActualProducts(data);
    }
    async function getWishlists() {
      if (mailId) {
        const response = await axios.post(
          "http://localhost:3000/getwishlists",
          {
            mailId: mailId,
          }
        );
        console.log(response.data);
        setWishlists(response.data);
      }
    }
    getProducts();
    getWishlists();
  }, []);

  useEffect(() => {
    async function getCompany() {
      let response = await axios.post("http://localhost:3000/getcompany", {
        category: item,
      });
      console.log(response);
      setAllCom(response.data);
    }
    getCompany();
  }, []);

  useEffect(() => {
    let newData = actualProducts.filter((product) => {
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

  async function addToCart(id, title, price, discount) {
    console.log(id, title, price, discount);
    const mail = localStorage.getItem("mailId");
    if (mail) {
      const response = await axios.post("http://localhost:3000/addtocart", {
        id: id,
        title: title,
        price: price,
        discount: discount,
        mailId: mail,
      });
      console.log(response);
    }
  }

  async function addToWishlist(product, list) {
    const mail = localStorage.getItem("mailId");
    if (mail) {
      const response = await axios.post("http://localhost:3000/addtowish", {
        id: product.id,
        title: product.title,
        mailId: mail,
        price: product.price,
        discount: product.discount,
        wishlist: list,
      });
      console.log(response);
    }
  }

  return (
    <div className="Items_Main">
      <div
        className={
          showSelectlist
            ? "Items_Wishlist_Selector--Active"
            : "Items_Wishlist_Selector"
        }
      >
        <div className="Items_Wishlist_Selector--Tint"></div>
        <div className="Items_Wishlist_Selector--Container">
          <div className="Items_Wishlist_Selector--Subcontainer">
            <h2 className="Items_Wishlist_Selector--Heading">
              Select wishlist
            </h2>
            <div className="Items_Wishlist_Selector--Lists">
              {wishlists.map((list, index) => {
                return (
                  <div
                    className="Items_Wishlist_Selector--List"
                    key={index}
                    onClick={() => {
                      setSelectedWistlist(list.wishlistname);
                      setShowSelectlist(false);
                      addToWishlist(wishProduct, list.wishlistname);
                    }}
                  >
                    <p className="Items_Wishlist_Selector--Listname">
                      {list.wishlistname}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="Item_Wishlist_Selector--Cancel_Button">
            <button
              onClick={() => {
                setShowSelectlist(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      {/* add a category button to go back to selecting categories if needed. */}
      {/* <h1>Products List</h1>
      <button
        style={{ padding: ".2em .3em", margin: ".5em 0", cursor: "pointer" }}
        onClick={() => {
          navigate("/products");
        }}
      >
        Category
      </button> */}
      {/* <div className="Items_Container"> */}
      <div className="Items_Filters_Container">
        <div className="Items_Filters">
          <div className="Items_Filter_Container">
            <div
              className="Items_Filters_Label"
              onClick={() => {
                setShowCompany(!showCompany);
              }}
            >
              <p className="Items_Filters_Label--Name">Select Category</p>
            </div>
            <div
              className={
                showCompany
                  ? "Items_Filter_Company Items_Filter_Company--Active"
                  : "Items_Filter_Company Items_Filter_Company--Inactive"
              }
            >
              {allCom.map((com, index) => {
                return (
                  <div
                    className="Items_Filter_Company_Name_Container"
                    onClick={() => {
                      setSelectedCompany(com.company);
                    }}
                    key={index}
                  >
                    <p className="Items_Filter_Company_Name">{com.company}</p>
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
                  ? "Items_Filter_Price Items_Filter_Price--Active"
                  : "Items_Filter_Price Items_Filter_Price--Inactive"
              }
            >
              <div
                className="Items_Filter_Price_Container"
                onClick={() => {
                  setLowerPrice(0);
                  setUpperPrice(15000);
                }}
              >
                <p className="Items_Filter_Price">0 to 15,000</p>
              </div>
              <div
                className="Items_Filter_Price_Container"
                onClick={() => {
                  setLowerPrice(15001);
                  setUpperPrice(30000);
                }}
              >
                <p className="Items_Filter_Price">15,001 to 30,000</p>
              </div>
              <div
                className="Items_Filter_Price_Container"
                onClick={() => {
                  setLowerPrice(30000);
                  setUpperPrice(45000);
                }}
              >
                <p className="Items_Filter_Price">30,001 to 45,000</p>
              </div>
              <div
                className="Items_Filter_Price_Container"
                onClick={() => {
                  setLowerPrice(45000);
                  setUpperPrice(60000);
                }}
              >
                <p className="Items_Filter_Price">45,001 to 60,000</p>
              </div>
              <div
                className="Items_Filter_Price_Container"
                onClick={() => {
                  setLowerPrice(60000);
                  setUpperPrice(75000);
                }}
              >
                <p className="Items_Filter_Price">60,001 to 75,000</p>
              </div>
              <div
                className="Items_Filter_Price_Container"
                onClick={() => {
                  setLowerPrice(75000);
                  setUpperPrice(0);
                }}
              >
                <p className="Items_Filter_Price">75,001 and above</p>
              </div>
              {/* </div> */}
            </div>
          </div>
        </div>
        {/* <button>collapse</button> */}
      </div>
      <div className="Items_List_Container">
        <div className="Items_List">
          {products.map((product, index) => {
            let mrp = product.price;
            let offer_price = (
              product.price -
              product.price * (product.discount / 100)
            ).toFixed(2);
            let mrp_string = mrp.toString();
            let offer_price_string = offer_price.toString().split(".")[0];
            let offer_price_decimal = offer_price.toString().split(".")[1];
            let mrp_array = mrp_string.split("").reverse();
            let offer_price_array = offer_price_string.split("").reverse();
            let mrp_iterator = Math.floor(mrp_array.length / 2);
            let offer_price_iterator = Math.floor(offer_price_array.length / 2);
            let k = 3;
            for (let j = 0; j < mrp_iterator - 1; j++) {
              mrp_array.splice(k, 0, ",");
              k += 3;
            }
            k = 3;
            for (let j = 0; j < offer_price_iterator - 1; j++) {
              offer_price_array.splice(k, 0, ",");
              k += 3;
            }
            let mrp_actual = mrp_array.reverse().join("");
            let offer_price_actual =
              offer_price_array.reverse().join("") + "." + offer_price_decimal;
            console.log(offer_price_actual);
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
                  <h2 className="Item_Name">{product.title}</h2>
                  <p className="Item_Category">
                    {product.category} - {product.company}
                  </p>
                  <p className="Item_Price">
                    <span className="Item_Discount">-{product.discount}%</span>{" "}
                    {offer_price_actual}
                  </p>
                  <p className="Item_MRP">{mrp_actual}</p>
                  <div className="Item_Buttons">
                    <button
                      style={{ margin: "0 1em 0 0", cursor: "pointer" }}
                      onClick={() => {
                        // send all data about product needed for the cart along with user mail id.
                        addToCart(
                          product.id,
                          product.title,
                          product.price,
                          product.discount
                        );
                      }}
                    >
                      Add to cart
                    </button>
                    <button
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        // send all data about product needed for the cart along with user mail id.
                        // addToWishlist(product);
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
      {/* </div> */}
    </div>
  );
}

export default Items;
