import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AddProduct.css";

function AddProduct() {
  const [file, setFile] = useState();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [priceCurrency, setPriceCurrency] = useState("0");
  const [discount, setDiscount] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);
  const [finalPriceCurrency, setFinalPriceCurrency] = useState("0.00");
  const [productCat, setProductCat] = useState("");
  const [productCom, setProductCom] = useState("");
  const [actCat, setActCat] = useState("");
  const [allCat, setAllCat] = useState([]);
  const [newCompany, setNewCompany] = useState("");
  const [allCom, setAllCom] = useState([]);
  const [fetch, setFetch] = useState(true);
  const [buyLimit, setBuyLimit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stockAlert, setStockAlert] = useState("");

  async function handleSubmitProduct(e) {
    e.preventDefault();
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/addproduct`,
      {
        title: title,
        price: price,
        discount: discount,
        category: productCat,
        company: productCom,
        limit: buyLimit,
        quantity: quantity,
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
    setProductCat("");
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
    async function getCatAndCom() {
      let response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/getcatandcom`
      );
      console.log(response);
      setAllCat(response.data.cat);
      setAllCom(response.data.com);
    }
    getCatAndCom();
  }, [fetch]);

  return (
    <div className="AddProduct_Page">
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
                      if (Number(priceInteger)) {
                        const priceCurrencyString =
                          amountToCurrencyConvertor(priceInteger);
                        setPriceCurrency(priceCurrencyString);
                        setPrice(priceInteger);
                        calculateFinalPrice(priceInteger, discount);
                      }
                    }}
                    value={priceCurrency}
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
                {/* Product Category And Company Field */}
                <div className="AddProduct_Category_And_Company">
                  <div className="AddProduct_Section--Field">
                    <label>Category</label>
                    <select
                      onChange={(e) => {
                        setProductCat(e.target.value);
                      }}
                    >
                      <option value="Select category" hidden>
                        Select category
                      </option>
                      {allCat.map((cat, index) => {
                        return (
                          <option value={cat.ctegory} key={index}>
                            {cat.category}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="AddProduct_Section--Field">
                    <label>Company</label>
                    <select
                      onChange={(e) => {
                        setProductCom(e.target.value);
                      }}
                    >
                      <option value="Select company" hidden>
                        Select company
                      </option>
                      {allCom.map((com, index) => {
                        return (
                          <option value={com.company} key={index}>
                            {com.company}
                          </option>
                        );
                      })}
                    </select>
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
                  type="number"
                  value={buyLimit}
                  onChange={(e) => {
                    setBuyLimit(e.target.value);
                  }}
                ></input>
              </div>
              {/* Product Initial Stock Field */}
              <div className="AddProduct_Section--Field">
                <label>Initial Stock Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                  }}
                ></input>
              </div>
              {/* Product Stock Alert */}
              <div className="AddProduct_Section--Field">
                <label>Stock alert</label>
                <input
                  type="number"
                  value={stockAlert}
                  onChange={(e) => {
                    setStockAlert(e.target.value);
                  }}
                ></input>
              </div>
            </div>
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
