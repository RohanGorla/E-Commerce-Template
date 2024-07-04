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
            <img
              src="https://cdn.thewirecutter.com/wp-content/media/2023/06/businesslaptops-2048px-0943.jpg"
              style={{ width: "300px" }}
            ></img>
            <h2>{product.title}</h2>
            <p>{product.category}</p>
            <p>{product.price}</p>
            <p>{product.discount}</p>
            <p>
              final price:{" "}
              {product.price - product.price * (product.discount / 100)}
            </p>
            <button
              onClick={() => {
                // send all data about product needed for the cart along with user mail id.
                context.addToCart(product.id, product.title, product.price, product.discount);
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
