import { useState, useEffect } from "react";
import { Outlet, useOutletContext, useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/Products.css";

function Product() {
  const [productData, setProductData] = useState({});
  const address = JSON.parse(localStorage.getItem("address"));
  console.log(address);
  const [userName, setUserName] = useState("");
  const { product } = useParams();
  console.log(product);
  useEffect(() => {
    async function getProduct() {
      let response = await axios.post("http://localhost:3000/getproduct", {
        id: product,
      });
      console.log(response);
      setProductData(response.data[0]);
    }
    getProduct();
  }, []);

  return (
    <div className="Product_Container">
      <div className="Product_Main">
        <div className="Product_Image">
          <img
            src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
            style={{ width: "700px" }}
          ></img>
        </div>
        <div className="Product_Details">
          <p className="Product_Title">{productData?.title}</p>
          <p className="Product_Category">{productData.category}</p>
          <span className="Product_Discount">-{productData.discount}% </span>
          <span className="Product_Final">
            ₹
            {productData.price -
              productData.price * (productData.discount / 100)}
          </span>
          <p className="Product_Price">
            M.R.P: <span className="MRP">₹{productData?.price}</span>
          </p>
          <div className="Delivery_Address">
            <p>
              Delivering to {address.username} - {address.street}
            </p>
            <p>{address.city}</p>
          </div>
          <div>
            <button
              style={{
                backgroundColor: "gold",
                borderStyle: "none",
                padding: "10px 15px",
                borderRadius: "10px",
                fontSize: "20px",
                fontWeight: "700",
                cursor: "pointer",
              }}
              id="Buy_Button"
              onClick={() => {
                window.open(`${window.location.origin}/buy/${product}`);
              }}
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
      <div className="Product_Review">
        <div className="Write_Review">
          <h3>Reviews</h3>
          <textarea
            placeholder="Write your review..."
            rows={5}
            cols={100}
            id="Review_Input"
          ></textarea>
        </div>
        <div className="Reviews"></div>
      </div>
    </div>
  );
}

export default Product;
