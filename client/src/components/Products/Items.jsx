import { useOutletContext } from "react-router-dom";

function Items({ setShow }) {
  const content = useOutletContext();
//   console.log(content);
  return (
    <>
      <h1>Products List</h1>
      {content.products.map((product, index) => {
        return (
          <div key={index} style={{ padding: "2em 1em", margin: "1em 0" }}>
            <h2>{product.title}</h2>
            <p>{product.category}</p>
            <p>{product.description}</p>
            <p>{product.id}</p>
            <button
              onClick={() => {
                content.addToCart(product.id);
              }}
            >
              Add to cart
            </button>
          </div>
        );
      })}
    </>
  );
}

export default Items;
