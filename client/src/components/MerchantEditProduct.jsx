import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/AddProduct.css";

function MerchantEditProduct() {
  const [productDetails, setProductDetails] = useState([]);
  const [file, setFile] = useState();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [priceCurrency, setPriceCurrency] = useState("");
  const [discount, setDiscount] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);
  const [finalPriceCurrency, setFinalPriceCurrency] = useState("0.00");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [categorySearchResult, setCategorySearchResult] = useState([]);
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [company, setCompany] = useState("");
  const [buyLimit, setBuyLimit] = useState(0);
  const [buyLimitString, setBuyLimitString] = useState("0");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockQuantityString, setStockQuantityString] = useState("0");
  const [stockAlert, setStockAlert] = useState(0);
  const [stockAlertString, setStockAlertString] = useState("0");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { productid } = useParams();
  const navigate = useNavigate();
  const merchantInfo = JSON.parse(localStorage.getItem("merchantInfo"));
  const merchantMail = merchantInfo.mailId;

  /* Get Product Details API */

  async function getProductDetails() {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getproduct`,
      { id: productid }
    );
    if (response.data.access) {
      const productDetails = response.data.data[0];
      setProductDetails(productDetails);
      setTitle(productDetails.title);
      setDescription(productDetails.description);
      setPrice(productDetails.price);
      setPriceCurrency(amountToCurrencyConvertor(productDetails.price));
      setDiscount(productDetails.discount);
      calculateFinalPrice(productDetails.price, productDetails.discount);
      setCategory(productDetails.category);
      setCategorySearch(productDetails.category);
      setCompany(productDetails.company);
      setBuyLimit(productDetails.buy_limit);
      setBuyLimitString(amountToCurrencyConvertor(productDetails.buy_limit));
      setStockQuantity(productDetails.stock_left);
      setStockQuantityString(
        amountToCurrencyConvertor(productDetails.stock_left)
      );
      setStockAlert(productDetails.stock_alert);
      setStockAlertString(
        amountToCurrencyConvertor(productDetails.stock_alert)
      );
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

  /* Get Categories API */

  async function getAllCategories() {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/getallcategories`
    );
    if (response.data.access) {
      setAllCategories(response.data.data);
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

  /* Add New Category API */

  async function addNewCategory(e) {
    e.preventDefault();
    if (newCategory.length) {
      let categoryExists = false;
      for (let i = 0; i < allCategories.length; i++) {
        if (
          allCategories[i].category.toLowerCase() === newCategory.toLowerCase()
        ) {
          categoryExists = true;
          break;
        }
      }
      if (!categoryExists) {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/addcategory`,
          {
            category: newCategory,
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
          setShowAddCategory(false);
          setCategory(newCategory);
          setCategorySearch(newCategory);
          setAllCategories(response.data.data);
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
        setSuccess(false);
        setSuccessMessage("");
        setError(true);
        setErrorMessage("This category already exists!");
        setTimeout(() => {
          setError(false);
        }, 3500);
      }
    } else {
      setSuccess(false);
      setSuccessMessage("");
      setError(true);
      setErrorMessage("Category cannot be an empty string!");
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  /* Submit Edited Product Details API */

  async function handleSubmitProductEdit(e) {
    e.preventDefault();
    const response = await axios.put(
      `${import.meta.env.VITE_BASE_URL}/updateproduct`,
      {
        id: productid,
        title: title,
        description: description,
        price: price,
        discount: discount,
        final: finalPrice,
        category: category,
        company: company,
        limit: buyLimit,
        quantity: stockQuantity,
        alert: stockAlert,
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
    }
  }

  function calculateFinalPrice(price, discount) {
    const finalPriceValue =
      Math.round(price * (1 - discount / 100) * 100) / 100;
    setFinalPrice(finalPriceValue);
    let finalPriceInteger;
    let finalPriceDecimal;
    if (finalPriceValue.toString().split(".").length !== 2) {
      finalPriceInteger = amountToCurrencyConvertor(
        finalPriceValue.toString().split(".")[0]
      );
      finalPriceDecimal = "00";
    } else {
      finalPriceInteger = amountToCurrencyConvertor(
        finalPriceValue.toString().split(".")[0]
      );
      finalPriceDecimal = finalPriceValue
        .toString()
        .split(".")[1]
        .padEnd(2, "0");
    }
    const finalPriceCurrencyString =
      finalPriceInteger + "." + finalPriceDecimal;
    setFinalPriceCurrency(finalPriceCurrencyString);
  }

  function currencyToAmountConvertor(currencyString) {
    let currencyArray = currencyString.split(",");
    let amountString = currencyArray.join("");
    let amountInteger = Number(amountString);
    return amountInteger;
  }

  function amountToCurrencyConvertor(amount) {
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
    if (merchantMail) {
      getProductDetails();
      getAllCategories();
    } else {
      navigate("/merchant/merchantlogin");
    }
  }, []);

  return (
    <div
      className="AddProduct_Page"
      onClick={() => {
        setShowCategories(false);
      }}
    >
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
      {/* Edit Product */}
      <div className="AddProduct_Container">
        {/* Edit Product Page Header */}
        <div className="AddProduct_Header">
          <h1 className="AddProduct_Header--Title">Edit Your Product</h1>
        </div>
        <div className="AddProduct_Main">
          {/* Edit Product Details Form */}
          <form
            className="AddProduct_Section"
            onSubmit={handleSubmitProductEdit}
          >
            {/* Edit Product Basic Details */}
            <h2>Product Basic Details</h2>
            <div className="AddProduct--Basic_Details">
              <div className="AddProduct--Basic_Details--Primary">
                {/* Edit Product Images Field */}
                <div className="AddProduct_Section--Field">
                  <label>Photo</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                    }}
                  ></input>
                </div>
                {/* Edit Product Title Field */}
                <div className="AddProduct_Section--Field">
                  <label>Title</label>
                  <textarea
                    placeholder="Product name..."
                    rows={2}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                  ></textarea>
                </div>
                {/* Edit Product Description Field */}
                <div className="AddProduct_Section--Field">
                  <label>Description</label>
                  <textarea
                    placeholder="Product description..."
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                    }}
                  ></textarea>
                </div>
              </div>
              <div className="AddProduct--Basic_Details--Secondary">
                {/* Edit Product Price Field */}
                <div className="AddProduct_Section--Field">
                  <label>Price</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      const priceInteger = currencyToAmountConvertor(
                        e.target.value
                      );
                      if (!isNaN(priceInteger)) {
                        const priceCurrencyString =
                          amountToCurrencyConvertor(priceInteger);
                        setPriceCurrency(priceCurrencyString);
                        setPrice(priceInteger);
                        calculateFinalPrice(priceInteger, discount);
                      }
                    }}
                    value={priceCurrency}
                    placeholder="Product price in INR"
                  ></input>
                </div>
                {/* Edit Product Discount Field */}
                <div className="AddProduct_Section--Field">
                  <label>Discount</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      const discountValue = Math.round(Number(e.target.value));
                      if (discountValue <= 100) {
                        setDiscount(discountValue);
                        calculateFinalPrice(price, discountValue);
                      }
                    }}
                    value={discount}
                    placeholder="Discount in %"
                  ></input>
                </div>
                {/* Edit Product Final Price Field */}
                <div className="AddProduct_Section--Field">
                  <label>Final Price</label>
                  <input
                    type="text"
                    value={finalPriceCurrency}
                    readOnly
                  ></input>
                </div>
                {/* Edit Product Category Field */}
                <div
                  className={
                    showAddCategory
                      ? "AddProduct_Category--Inactive"
                      : "AddProduct_Category"
                  }
                >
                  <div className="AddProduct_Section--Field">
                    <label htmlFor="AddProduct_Category--Search">
                      Category
                    </label>
                    {/* Category Search */}
                    <input
                      type="text"
                      id="AddProduct_Category--Search"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCategories(true);
                        let categorySearchResuts;
                        if (categorySearch.length) {
                          categorySearchResuts = allCategories.filter(
                            (category) => {
                              if (
                                category.category
                                  .toLowerCase()
                                  .startsWith(categorySearch.toLowerCase())
                              )
                                return category;
                            }
                          );
                        } else {
                          categorySearchResuts = allCategories;
                        }
                        setCategorySearchResult(categorySearchResuts);
                      }}
                      onChange={(e) => {
                        setCategorySearch(e.target.value);
                        let categorySearchResuts;
                        if (e.target.value.length) {
                          categorySearchResuts = allCategories.filter(
                            (category) => {
                              if (
                                category.category
                                  .toLowerCase()
                                  .startsWith(e.target.value.toLowerCase())
                              )
                                return category;
                            }
                          );
                        } else {
                          categorySearchResuts = allCategories;
                        }
                        setCategorySearchResult(categorySearchResuts);
                      }}
                      value={categorySearch}
                      placeholder="Set Product Category"
                    ></input>
                    {/* Category Options */}
                    <div
                      className={
                        showCategories
                          ? "AddProduct_Category_Select"
                          : "AddProduct_Category_Select--Inactive"
                      }
                    >
                      <div
                        className="AddProduct_Category_Option"
                        onClick={() => {
                          setShowAddCategory(true);
                        }}
                      >
                        <p>
                          Add New Category{" "}
                          <span className="AddProduct_Category_Option--Plus_Symbol">
                            +
                          </span>
                        </p>
                      </div>
                      {categorySearchResult.length ? (
                        categorySearchResult.map((category, index) => {
                          return (
                            <div
                              key={index}
                              className="AddProduct_Category_Option"
                              onClick={() => {
                                setCategory(category.category);
                                setCategorySearch(category.category);
                              }}
                            >
                              <p>{category.category}</p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="AddProduct_Category_Option">
                          <p>No Search Results</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Add New Category Field */}
                <div
                  className={
                    showAddCategory
                      ? "AddProduct_AddNewCategory"
                      : "AddProduct_AddNewCategory--Inactive"
                  }
                >
                  <div className="AddProduct_Section--Field">
                    <label>Add New Category</label>
                    <input
                      type="text"
                      onChange={(e) => {
                        setNewCategory(e.target.value);
                      }}
                      value={newCategory}
                      placeholder="Enter New Category..."
                    ></input>
                    <div className="AddProduct_AddNewCategory--Button">
                      <button onClick={addNewCategory}>Add</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Edit Product Stock Details */}
            <h2>Product Stock Details</h2>
            <div className="AddProduct--Stock_Details">
              {/* Edit Product Buy Limit Field */}
              <div className="AddProduct_Section--Field">
                <label>Buy Limit Per Customer</label>
                <input
                  type="text"
                  onChange={(e) => {
                    const buyLimitInteger = currencyToAmountConvertor(
                      e.target.value
                    );
                    if (!isNaN(buyLimitInteger)) {
                      const buyLimitString =
                        amountToCurrencyConvertor(buyLimitInteger);
                      setBuyLimitString(buyLimitString);
                      setBuyLimit(buyLimitInteger);
                    }
                  }}
                  value={buyLimitString}
                ></input>
              </div>
              {/* Edit Product Initial Stock Field */}
              <div className="AddProduct_Section--Field">
                <label>Stock Quantity</label>
                <input
                  type="text"
                  onChange={(e) => {
                    const initialStockInteger = currencyToAmountConvertor(
                      e.target.value
                    );
                    if (!isNaN(initialStockInteger)) {
                      const initialStockString =
                        amountToCurrencyConvertor(initialStockInteger);
                      setStockQuantityString(initialStockString);
                      setStockQuantity(initialStockInteger);
                    }
                  }}
                  value={stockQuantityString}
                ></input>
              </div>
              {/* Edit Product Stock Alert */}
              <div className="AddProduct_Section--Field">
                <label>Low Stock Alert</label>
                <input
                  type="text"
                  onChange={(e) => {
                    const stockAlertInteger = currencyToAmountConvertor(
                      e.target.value
                    );
                    if (!isNaN(stockAlertInteger)) {
                      const stockAlertString =
                        amountToCurrencyConvertor(stockAlertInteger);
                      setStockAlertString(stockAlertString);
                      setStockAlert(stockAlertInteger);
                    }
                  }}
                  value={stockAlertString}
                ></input>
              </div>
            </div>
            {/* Edit Product Submit Button */}
            <div className="AddProduct_Section--Submit">
              <input type="submit" value="Edit Product"></input>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MerchantEditProduct;
