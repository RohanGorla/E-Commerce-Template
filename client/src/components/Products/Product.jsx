import { useState, useEffect, act } from "react";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import "../../styles/Product.css";

function Product() {
  const { product } = useParams();
  const [productData, setProductData] = useState({});
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
  const address = JSON.parse(localStorage.getItem("address"));
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
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

  async function repeater(response) {
    const mail = userInfo?.mailId;
    if (response.data.code) {
      let totalRating = 0;
      let totalRatings = 0;
      let actualProductRating = 0;
      let averageRatingRounded = 0;
      let otherUserReviews = response.data.data.filter((review) => {
        if (review.mailid !== mail) {
          totalRating += review.rating;
          if (review.rating) {
            totalRatings += 1;
          }
          return review;
        }
      });
      setReviews(otherUserReviews);
      let currentUserReview = response.data.data.filter((review) => {
        if (review.mailid === mail) {
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
  }

  async function addReview() {
    const username = userInfo.firstname + " " + userInfo.lastname;
    const mail = userInfo.mailId;
    if (review.length || starSetIndex >= 0) {
      if (hasReview) {
        let response = await axios.put("http://localhost:3000/editreview", {
          id: product,
          mail: mail,
          review: review,
          rating: starSetIndex + 1,
        });
        console.log(response);
        repeater(response);
      } else {
        let response = await axios.post("http://localhost:3000/addreview", {
          id: product,
          mail: mail,
          user: username,
          review: review,
          rating: starSetIndex + 1,
        });
        repeater(response);
      }
      setShowReview(true);
    }
  }

  async function deleteReview() {
    let response = await axios.delete("http://localhost:3000/deletereview", {
      data: { id: product, mail: userInfo.mailId },
    });
    console.log(response);
    repeater(response);
    setShowReview(true);
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

  useEffect(() => {
    async function getProduct() {
      let response = await axios.post("http://localhost:3000/getproduct", {
        id: product,
      });
      console.log(response);
      let data = response.data[0];
      let mrp = currencyConvert(data.price);
      let offer_price = (
        data.price -
        data.price * (data.discount / 100)
      ).toFixed(2);
      let offerPriceInt = offer_price.split(".")[0];
      let offerPriceDecimal = offer_price.toString().split(".")[1];
      let actualPrice =
        currencyConvert(offerPriceInt) + "." + offerPriceDecimal;
      data.mrp = mrp;
      data.actualPrice = actualPrice;
      setProductData(data);
    }
    async function getReviews() {
      let response = await axios.post("http://localhost:3000/getreviews", {
        id: product,
      });
      repeater(response);
    }
    getProduct();
    getReviews();
  }, []);

  return (
    <div className="Product_Main_Container">
      <div className="Product_Main">
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
              <div
                className="Product_Details--Stars"
                onMouseLeave={() => {
                  setStarHoverIndex(-1);
                }}
              >
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
              <button
                className="Product_Details--Buttons_Buy"
                onClick={() => {
                  window.open(`${window.location.origin}/buy/${product}`);
                }}
              >
                Buy now
              </button>
              <button
                className="Product_Details--Buttons_Cart"
                onClick={() => {
                  // window.open(`${window.location.origin}/buy/${product}`);
                  addToCart();
                }}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
        <div className="Product_Main--About">
          <h4>About the product</h4>
          <p>
            Introducing our latest electronic product, the ProSound Wireless
            Earbuds—your perfect companion for an immersive audio experience.
            With sleek design and cutting-edge technology, these earbuds deliver
            crystal-clear sound and deep bass, ensuring you never miss a beat.
          </p>
          <p>
            When you purchase the ProSound Wireless Earbuds, you'll receive
            everything you need to get started. Inside the box, you'll find the
            earbuds themselves, along with a compact charging case that provides
            up to 20 hours of additional playtime.
          </p>
          <p>
            We've also added a few extras to enhance your experience with the
            ProSound Wireless Earbuds. Included in the package is a quick start
            guide to help you set up your earbuds in minutes, along with a
            warranty card that provides coverage for any manufacturing defects
            for up to one year.
          </p>
          <p>
            Lastly, the ProSound Wireless Earbuds come with access to our
            dedicated customer support team, available 24/7 to assist you with
            any questions or issues.
          </p>
        </div>
        <div className="Product_Main--Reviews">
          <div className="Product_Reviews--Header">
            <h4 className="Product_Reviews--Header_Heading">Product Reviews</h4>
          </div>
          <div className="Product_Reviews--Main">
            {/* Product Rating Container */}
            <div className="Product_Reviews--Rating">
              {/* Product Average Star Rating Container */}
              <div className="Product_Reviews--Stars_Container">
                <div
                  className="Product_Reviews--Stars"
                  onMouseLeave={() => {
                    setStarHoverIndex(-1);
                  }}
                >
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
                  // cols={50}
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
