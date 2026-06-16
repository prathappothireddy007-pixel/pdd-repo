import { useNavigate } from "react-router-dom";

function Home({ products }) {

  const navigate = useNavigate();

  const soldItems =
    JSON.parse(
      localStorage.getItem("soldItems")
    ) || {};

  return (

    <div className="container">

      <h1>Latest Products</h1>

      <div className="grid">

        {products.length === 0 ? (

          <h2>No Products Added</h2>

        ) : (

          products.map(
            (item, index) => (

              <div
                className="card"
                key={index}
              >

                <img
                  src={item.image}
                  alt=""
                />

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

                <h2>
                  ₹ {item.price}
                </h2>

                <p>
                  Seller :
                  {item.seller}
                </p>

                {soldItems[index] ? (

                  <h2 className="sold-text">
                    SOLD OUT
                  </h2>

                ) : (

                  <button
                    onClick={() =>
                      navigate("/auction")
                    }
                  >
                    Buy Now
                  </button>

                )}

              </div>

            )
          )
        )}

      </div>

    </div>
  );
}

export default Home;