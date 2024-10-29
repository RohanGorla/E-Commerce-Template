import React, { useEffect, useState } from "react";
import axios from "axios";

function AddProduct() {
  const [file, setFile] = useState();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [productCat, setProductCat] = useState("");
  const [productCom, setProductCom] = useState("");
  const [actCat, setActCat] = useState("");
  const [allCat, setAllCat] = useState([]);
  const [newCompany, setNewCompany] = useState("");
  const [allCom, setAllCom] = useState([]);
  const [fetch, setFetch] = useState(true);

  async function handleSubmit(e) {
    e.preventDefault();
    // console.log(file.name, file.type);
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/addproduct`, {
      title: title,
      price: price,
      discount: discount,
      category: productCat,
      company: productCom,
      // type: file.type,
    });
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
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/addcategory`, {
      category: actCat,
    });
    console.log(response);
    setActCat("");
    setFetch(!fetch);
  }

  async function handleCompany(e) {
    e.preventDefault();
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/addcompany`, {
      company: newCompany,
    });
    console.log(response);
    setNewCompany("");
    setFetch(!fetch);
  }

  useEffect(() => {
    async function getCatAndCom() {
      let response = await axios.get(`${import.meta.env.VITE_BASE_URL}/getcatandcom`);
      console.log(response);
      setAllCat(response.data.cat);
      setAllCom(response.data.com);
    }
    getCatAndCom();
  }, [fetch]);

  return (
    <>
      <p style={{ textAlign: "center" }}>Add Product</p>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onSubmit={handleSubmit}
      >
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Photo</label>
          <input
            type="file"
            onChange={(e) => {
              setFile(e.target.files[0]);
            }}
          ></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Title</label>
          <input
            type="text"
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            value={title}
          ></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Price</label>
          <input
            type="text"
            onChange={(e) => {
              setPrice(e.target.value);
            }}
            value={price}
          ></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Disc</label>
          <input
            type="text"
            onChange={(e) => {
              setDiscount(e.target.value);
            }}
            value={discount}
          ></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Category</label>
          {/* <input
            type="text"
            onChange={(e) => {
              setProductCat(e.target.value);
            }}
            value={productCat}
          ></input> */}
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
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Company</label>
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
        <div>
          <input type="submit"></input>
        </div>
      </form>
      <p style={{ textAlign: "center", marginTop: "3em" }}>Add Category</p>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onSubmit={handleCategory}
      >
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Category</label>
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
      <p style={{ textAlign: "center", marginTop: "3em" }}>Add Company</p>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onSubmit={handleCompany}
      >
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Company</label>
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
    </>
  );
}

export default AddProduct;
