import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AddProduct.css";

function AddProduct() {
  const [file, setFile] = useState();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [priceCurrency, setPriceCurrency] = useState("");
  const [discount, setDiscount] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);
  const [finalPriceCurrency, setFinalPriceCurrency] = useState("0.00");
  const [category, setCategory] = useState("");
  const [productCom, setProductCom] = useState("");
  const [actCat, setActCat] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [categorySearchResult, setCategorySearchResult] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [allCompanies, setAllCompanies] = useState([]);
  const [fetch, setFetch] = useState(true);
  const [buyLimit, setBuyLimit] = useState(0);
  const [buyLimitString, setBuyLimitString] = useState("0");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockQuantityString, setStockQuantityString] = useState("0");
  const [stockAlert, setStockAlert] = useState(0);
  const [stockAlertString, setStockAlertString] = useState("0");

  async function handleSubmitProduct(e) {
    e.preventDefault();
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/addproduct`,
      {
        title: title,
        price: price,
        discount: discount,
        category: category,
        company: productCom,
        limit: buyLimit,
        quantity: stockQuantity,
        alert: stockAlert,
        // type: file.type,
      }
    );
    console.log(response);
    // const putURL = response.data;
    // await axios.put(putURL, file, { headers: { "Content-Type": file.type } });
    setFile("");
    setTitle("");
    setPrice("");
    setDiscount("");
    setCategory("");
  }

  async function handleCategory(e) {
    e.preventDefault();
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/addcategory`,
      {
        category: actCat,
      }
    );
    console.log(response);
    setActCat("");
    setFetch(!fetch);
  }

  async function handleCompany(e) {
    e.preventDefault();
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/addcompany`,
      {
        company: newCompany,
      }
    );
    console.log(response);
    setNewCompany("");
    setFetch(!fetch);
  }

  /* Final Price Calculator */

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

  /* Currency - Amount Convertor Functions */

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
    async function getCatAndCom() {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/getcatandcom`
      );
      if (response.data.access) {
        setAllCategories(response.data.categoryData);
        setAllCompanies(response.data.companyData);
      }
    }
    getCatAndCom();
  }, [fetch]);

  return (
    <div
      className="AddProduct_Page"
      onClick={() => {
        setShowCategories(false);
      }}
    >
      <div className="AddProduct_Container">
        <div className="AddProduct_Header">
          <h1 className="AddProduct_Header--Title">Add Your Product</h1>
        </div>
        <div className="AddProduct_Main">
          {/* Product Details Form */}
          <form className="AddProduct_Section" onSubmit={handleSubmitProduct}>
            {/* Product Basic Details */}
            <h2>Product Basic Details</h2>
            <div className="AddProduct--Basic_Details">
              <div className="AddProduct--Basic_Details--Primary">
                {/* Product Images Field */}
                <div className="AddProduct_Section--Field">
                  <label>Photo</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                    }}
                  ></input>
                </div>
                {/* Product Title Field */}
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
                {/* Product Description Field */}
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
                {/* Product Price Field */}
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
                {/* Product Discount Field */}
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
                {/* Product Final Price Field */}
                <div className="AddProduct_Section--Field">
                  <label>Final Price</label>
                  <input
                    type="text"
                    value={finalPriceCurrency}
                    readOnly
                  ></input>
                </div>
                {/* Product Category Field */}
                <div
                  className={
                    showAddCategory
                      ? "AddProduct_Category--Inactive"
                      : "AddProduct_Category"
                  }
                >
                  <div className="AddProduct_Section--Field">
                    <label>Category</label>
                    {/* Category Search */}
                    <input
                      type="text"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCategories(true);
                        let categorySearchResuts;
                        if (categorySearch.length) {
                          categorySearchResuts = allCategories.filter(
                            (category) => {
                              if (category.category.includes(categorySearch))
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
                              if (category.category.includes(e.target.value))
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
                      <button
                        onClick={() => {
                          setShowAddCategory(false);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Product Stock Details */}
            <h2>Product Stock Details</h2>
            <div className="AddProduct--Stock_Details">
              {/* Product Buy Limit Field */}
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
              {/* Product Initial Stock Field */}
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
              {/* Product Stock Alert */}
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
            {/* Product Submit Button */}
            <div className="AddProduct_Section--Submit">
              <input type="submit" value="Add Product"></input>
            </div>
          </form>
          <p>Add Category</p>
          <form onSubmit={handleCategory}>
            <div>
              <label>Category</label>
              <input
                type="text"
                onChange={(e) => {
                  setActCat(e.target.value);
                }}
                value={actCat}
              ></input>
            </div>
            <input type="submit"></input>
          </form>
          <p>Add Company</p>
          <form onSubmit={handleCompany}>
            <div>
              <label>Company</label>
              <input
                type="text"
                onChange={(e) => {
                  setNewCompany(e.target.value);
                }}
                value={newCompany}
              ></input>
            </div>
            <input type="submit"></input>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
