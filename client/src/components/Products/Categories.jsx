import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/categories.css";

function Categories() {
  const [Categories, setCategories] = useState([]);
  const navigate = useNavigate();

  async function getCategories() {
    const response = await axios.get("http://localhost:3000/getallcategories");
    console.log(response.data);
    const data = response.data;
    setCategories(data);
  }

  useEffect(() => {
    getCategories();
  }, []);
  return (
    <>
      {/* <div className="one"></div> */}
      <div
        // style={{ display: "flex", flexWrap: "wrap" }}
        className="categories_main"
      >
        {Categories.map((cat, index) => {
          return (
            <div
              key={index}
              // style={{ margin: "1em 0", padding: "1em 2em" }}
              className="category_card"
            >
              <h2>{cat.category}</h2>
              <button
                style={{ padding: ".2em .3em", margin: ".5em 0", cursor:'pointer' }}
                onClick={() => {
                  navigate(`items/${cat.category}`);
                }}
              >
                Select
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Categories;
