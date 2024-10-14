import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/categories.css";
import axios from "axios";

function Categories() {
  const [Categories, setCategories] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  async function getCategories() {
    const response = await axios.get("http://localhost:3000/getallcategories");
    if (response.data.access) {
      const categoryData = response.data.data;
      setCategories(categoryData);
    } else {
      setError(true);
      setErrorMessage(response.data.errorMsg);
      setTimeout(() => {
        setError(false);
      }, 3500);
    }
  }

  useEffect(() => {
    getCategories();
  }, []);
  return (
    <div className="Categorues_Container">
      <div className="Categories_Main">
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
        {Categories.map((cat, index) => {
          return (
            <div key={index} className="Category_Card">
              <p>{cat.category}</p>
              <button
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
    </div>
  );
}

export default Categories;
