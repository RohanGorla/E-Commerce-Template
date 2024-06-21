import { useState, useEffect } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import Categories from "./Categories";
import Items from "./Items";
import "../../styles/Products.css";

function Products() {
  const content = useOutletContext();
  const [show, setShow] = useState(false);
  // console.log(content);

  return (
    <>
      <Outlet context={content}/>
    </>
  );
}

export default Products;
