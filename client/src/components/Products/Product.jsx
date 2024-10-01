import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/Products.css";

function Product() {
  const [productData, setProductData] = useState({});
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);
  const address = JSON.parse(localStorage.getItem("address"));
  console.log(address);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  console.log(userInfo);
  const { product } = useParams();
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
  console.log(product);

  async function addToCart() {
    const mail = localStorage.getItem("mailId");
    if (mail) {
      const response = await axios.post("http://localhost:3000/addtocart", {
        id: product,
        title: productData.title,
        price: productData.price,
        discount: productData.discount,
        mailId: mail,
      });
      console.log(response);
    }
  }

  async function addReview() {
    const mailId = localStorage.getItem("mailId");
    const username = userInfo.firstname + " " + userInfo.lastname;
    if (review) {
      let response = await axios.post("http://localhost:3000/addreview", {
        id: product,
        mail: mailId,
        user: username,
        review: review,
      });
      console.log(response);
      if (response.data.code) {
        setReviews(response.data.data);
      }
      setReview("");
    }
  }

  useEffect(() => {
    async function getProduct() {
      let response = await axios.post("http://localhost:3000/getproduct", {
        id: product,
      });
      console.log(response);
      let data = response.data[0];
      let mrp = data.price;
      let offer_price = (
        data.price -
        data.price * (data.discount / 100)
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
      data.mrp = mrp_actual;
      data.actualPrice = offer_price_actual;
      setProductData(data);
    }
    async function getReviews() {
      let response = await axios.post("http://localhost:3000/getreviews", {
        id: product,
      });
      if (response.data.code) {
        setReviews(response.data.data);
      }
    }
    getProduct();
    getReviews();
  }, []);

  return (
    <div className="Product_Container">
      <div className="Product_Main">
        <div className="Product_Image">
          <img
            src={currentUrl}
            style={{ width: "100%", height: "400px" }}
          ></img>
          <div className="More_Product_Images">
            {imageUrls.map((url) => {
              return (
                <div
                  className={
                    url.src == currentUrl
                      ? "More_Image_Box More_Image_Box--Active"
                      : "More_Image_Box"
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
          {/* <div className="Product_Review">
            <div className="Write_Review">
              <h3>Product Reviews</h3>
              <p>
                Reviewing as {userInfo.firstname} {userInfo.lastname}
              </p>
              <textarea
                placeholder="Write your review..."
                rows={5}
                cols={100}
                id="Review_Input"
              ></textarea>
            </div>
            <div className="Reviews"></div>
          </div> */}
        </div>
        <div className="Product_Details">
          <p className="Product_Title">{productData?.title}</p>
          <p className="Product_Category">
            {productData?.category} - {productData?.company}
          </p>
          <p className="Product_Price">
            <span className="Product_Discount">-{productData?.discount}%</span>{" "}
            ₹{productData?.actualPrice}
          </p>
          <p className="Product_MRP">
            M.R.P:{" "}
            <span className="Product_MRP_Strike">₹{productData?.mrp}</span>
          </p>
          <div className="Delivery_Address">
            {address ? (
              <>
                <p>
                  Delivering to {address?.username} - {address?.street}
                </p>
                <p>{address?.city}</p>
              </>
            ) : (
              <>
                <p>Select address to where the product should be shipped!</p>
              </>
            )}
          </div>
          <div className="Products_Buttons">
            <button
              className="Buy_Button"
              onClick={() => {
                window.open(`${window.location.origin}/buy/${product}`);
              }}
            >
              Buy now
            </button>
            <button
              className="Addtocart_Button"
              onClick={() => {
                // window.open(`${window.location.origin}/buy/${product}`);
                addToCart();
              }}
            >
              Add to cart
            </button>
          </div>
          <div className="About_Product">
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
        </div>
      </div>
      <div className="Product_Review">
        <div className="Write_Review">
          <h3>Product Reviews</h3>
          <p>
            Reviewing as {userInfo.firstname} {userInfo.lastname}
          </p>
          <textarea
            placeholder="Write your review..."
            rows={5}
            cols={100}
            id="Review_Input"
            value={review}
            onChange={(e) => {
              setReview(e.target.value);
            }}
          ></textarea>
          <div className="Review_Submit_Btn">
            <button onClick={addReview}>Submit</button>
          </div>
        </div>
        <div className="Reviews">
          {reviews?.map((review) => {
            return (
              <div key={review.id} className="Individual_Review">
                <h4>{review.username}</h4>
                <p>{review.review}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Product;
