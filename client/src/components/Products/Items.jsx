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
  const [allCat, setAllCat] = useState([]);
  const [allCom, setAllCom] = useState([]);
  const [showSelectlist, setShowSelectlist] = useState(false);
  const [showCompany, setShowCompany] = useState(true);
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
    async function getCatAndCom() {
      let response = await axios.get("http://localhost:3000/getcatandcom");
      console.log(response);
      setAllCat(response.data.cat);
      setAllCom(response.data.com);
    }
    getCatAndCom();
  }, []);

  useEffect(() => {
    let newData = actualProducts.filter((product) => {
      if (product.company == selectedCompany) {
        return product;
      }
    });
    setProducts(newData);
  }, [selectedCompany]);

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
  }

  async function addToWishlist(product, list) {
    // console.log(product);
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
      <h1>Products List</h1>
      <button
        style={{ padding: ".2em .3em", margin: ".5em 0", cursor: "pointer" }}
        onClick={() => {
          navigate("/products");
        }}
      >
        Category
      </button>
      <div className="Items_Container">
        <div className="Items_Filters">
          {/* <div
            className={
              showCompany
                ? "Items_Filter_Company Items_Filter_Company--Active"
                : "Items_Filter_Company Items_Filter_Company--Inactive"
            }
          >
            {allCat.map((cat) => {
              return (
                <div className="Items_Filter_Company_Name_Container">
                  <p className="Items_Filter_Company_Name">{cat.category}</p>
                </div>
              );
            })}
          </div> */}
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
          <button
            onClick={() => {
              setShowCompany(!showCompany);
            }}
          >
            collapse
          </button>
        </div>
        <div className="Items">
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
    </div>
  );
}

export default Items;
