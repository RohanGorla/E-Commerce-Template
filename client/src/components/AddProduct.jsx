import React from "react";

function AddProduct() {
  async function handleSubmit(e) {
    e.preventDefault();
    
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
          <input type="file"></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Title</label>
          <input type="text"></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Price</label>
          <input></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Disc</label>
          <input></input>
        </div>
        <div style={{ margin: "1em 0" }}>
          <label style={{ margin: "0 1em" }}>Category</label>
          <input></input>
        </div>
        <div>
          <input type="submit"></input>
        </div>
      </form>
    </>
  );
}

export default AddProduct;
