import { useOutletContext } from "react-router-dom";

function Items() {
  const context = useOutletContext();
//   console.log(context);
  return (
    <>
      {/* add a category button to go back to selecting categories if needed. */}
      <h1>Products List</h1>
      {context.products.map((product, index) => {
        return (
          <div key={index} style={{ padding: "2em 1em", margin: "1em 0" }}>
            <h2>{product.title}</h2>
            <p>{product.category}</p>
            <p>{product.description}</p>
            <p>{product.id}</p>
            <button
              onClick={() => {
                // send all data about product needed for the cart along with user mail id.
                context.addToCart(product.id);
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
