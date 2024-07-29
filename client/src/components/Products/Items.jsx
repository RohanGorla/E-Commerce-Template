import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

function Items() {
  const navigate = useNavigate();
  const { item } = useParams();
  console.log(item);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function getProducts() {
      const response = await axios.post("http://localhost:3000/getproducts", {
        category: item,
      });
      const data = response.data;
      console.log(data);
      setProducts(data);
    }
    getProducts();
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

  async function addToWishlist(product) {
    // console.log(product);
    const mail = localStorage.getItem("mailId");
    if (mail) {
      const response = await axios.post("http://localhost:3000/addtowish", {
        id: product.id,
        title: product.title,
        mailId: mail,
      });
      console.log(response);
    }
  }

  return (
    <>
      {/* add a category button to go back to selecting categories if needed. */}
      <h1>Products List</h1>
      <button
        onClick={() => {
          navigate("/products");
        }}
      >
        Category
      </button>
      {products.map((product, index) => {
        return (
          <div
            key={index}
            style={{ padding: "2em 1em", margin: "1em 0", cursor: "pointer" }}
            onClick={() => {
              // navigate(`/products/product/${product.id}`);
              // console.log(window.location.origin);
              window.open(
                `${window.location.origin}/products/product/${product.id}`
              );
            }}
          >
            <img
              src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
              style={{ width: "300px" }}
            ></img>
            <h2>{product.title}</h2>
            <p>{product.category}</p>
            <p>{product.price}</p>
            <p>{product.discount}</p>
            <p>
              final price:{" "}
              {product.price - product.price * (product.discount / 100)}
            </p>
            <button
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
              onClick={() => {
                // send all data about product needed for the cart along with user mail id.
                addToWishlist(product);
              }}
            >
              Wish list
            </button>
          </div>
        );
      })}
    </>
  );
}

export default Items;
