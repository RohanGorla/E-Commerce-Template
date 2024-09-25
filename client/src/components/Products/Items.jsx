import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import "../../styles/Items.css";

function Items() {
  const navigate = useNavigate();
  const { item } = useParams();
  console.log(item);
  const [products, setProducts] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [wishProduct, setWishProduct] = useState({});
  const [selectedWishlist, setSelectedWistlist] = useState("");
  const [showSelectlist, setShowSelectlist] = useState(false);
  const mailId = localStorage.getItem("mailId");

  useEffect(() => {
    async function getProducts() {
      const response = await axios.post("http://localhost:3000/getproducts", {
        category: item,
      });
      const data = response.data;
      console.log(data);
      setProducts(data);
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
  //   console.log(context);
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
      <div className="Items">
        {products.map((product, index) => {
          return (
            <div key={index} style={{ padding: "2em 1em", margin: "1em 0" }}>
              <img
                src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
                style={{ width: "300px", cursor: "pointer" }}
                onClick={() => {
                  window.open(
                    `${window.location.origin}/products/product/${product.id}`
                  );
                }}
              ></img>
              <h2>{product.title}</h2>
              <p>{product.category}</p>
              <p>{product.price}</p>
              <p>{product.discount}</p>
              <p>
                final price:{" "}
                {product.price - product.price * (product.discount / 100)}
              </p>
              <div className="Items_Buttons">
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
          );
        })}
      </div>
    </div>
  );
}

export default Items;
