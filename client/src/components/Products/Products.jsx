import { useState, useEffect } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import "../../styles/Products.css";

function Products() {
  const context = useOutletContext();
  // console.log(context);

  return (
    <>
      <Outlet context={context} />
    </>
  );
}

export default Products;
