import React, { useState } from "react";
import axios from "axios";

function AddProduct() {
  const [file, setFile] = useState();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [productCat, setProductCat] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(file.name, file.type);
    const response = await axios.post("http://localhost:3000/addproduct", {
      title: title,
      price: price,
      discount: discount,
      category: productCat,
      type: file.type,
    });
    const putURL = response.data;
    await axios.put(putURL, file, { headers: { "Content-Type": file.type } });
  }

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
          <input
            type="text"
            onChange={(e) => {
              setProductCat(e.target.value);
            }}
            value={productCat}
          ></input>
        </div>
        <div>
          <input type="submit"></input>
        </div>
      </form>
    </>
  );
}

export default AddProduct;
