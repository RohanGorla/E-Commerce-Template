import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";

function Categories({ setShow }) {
  const content = useOutletContext();
  const [Categories, setCategories] = useState([]);
  //   console.log(content);

  async function getCategories() {
    let response = await fetch("https://dummyjson.com/products/category-list");
    let data = await response.json();
    setCategories(data);
  }

  useEffect(() => {
    getCategories();
  }, []);
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {Categories.map((cat, index) => {
          return (
            <div key={index} style={{ margin: "1em 0", padding: "1em 2em" }}>
              <h2>{cat}</h2>
              <button style={{padding:'.2em .3em', margin:'.5em 0'}}>
                <Link
                  to="Items"
                  onClick={() => {
                    content.setCategory(cat);
                  }}
                  style={{textDecoration:'none'}}
                >
                  Select
                </Link>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Categories;
