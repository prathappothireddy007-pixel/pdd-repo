import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Auction() {

  const navigate = useNavigate();

  const [products, setProducts] =
    useState([]);

  const [bids, setBids] =
    useState({});

  const [bidInputs, setBidInputs] =
    useState({});

  const [timers, setTimers] =
    useState({});

  const [soldItems, setSoldItems] =
    useState(
      JSON.parse(
        localStorage.getItem(
          "soldItems"
        )
      ) || {}
    );

  /* LOAD PRODUCTS */

  useEffect(() => {

    const savedProducts =
      JSON.parse(
        localStorage.getItem(
          "products"
        )
      ) || [];

    setProducts(savedProducts);

  }, []);

  /* SAVE SOLD ITEMS */

  useEffect(() => {

    localStorage.setItem(
      "soldItems",
      JSON.stringify(soldItems)
    );

  }, [soldItems]);

  /* PLACE BID */

  const handleBid = (
    index,
    item
  ) => {

    if (soldItems[index]) return;

    const currentBid =
      bids[index]
        ? bids[index]
        : Number(item.price);

    const minRaise =
      Number(
        item.minimumBid || 100
      );

    const enteredBid =
      Number(
        bidInputs[index]
      );

    /* VALIDATION */

    if (
      enteredBid <
      currentBid + minRaise
    ) {

      alert(
        `Minimum Bid Should Be ₹${
          currentBid + minRaise
        }`
      );

      return;
    }

    /* SAVE BID */

    setBids((prev) => ({
      ...prev,
      [index]: enteredBid
    }));

    alert(
      "Bid Placed Successfully"
    );

    /* TIMER */

    let timeLeft = 30;

    setTimers((prev) => ({
      ...prev,
      [index]: timeLeft
    }));

    const countdown =
      setInterval(() => {

        timeLeft--;

        setTimers((prev) => ({
          ...prev,
          [index]: timeLeft
        }));

        if (timeLeft <= 0) {

          clearInterval(
            countdown
          );

          setSoldItems((prev) => {

            const updatedSold =
              {
                ...prev,
                [index]: true
              };

            localStorage.setItem(
              "soldItems",
              JSON.stringify(
                updatedSold
              )
            );

            return updatedSold;
          });

          alert(
            "Item Sold Out"
          );

          navigate("/payment");
        }

      }, 1000);
  };

  return (

    <div className="container">

      <h1>
        Live Auction Items
      </h1>

      <div className="grid">

        {products.length === 0 ? (

          <h2>
            No Auction Items
          </h2>

        ) : (

          products.map(
            (item, index) => (

              <div
                className="card"
                key={index}
              >

                {/* IMAGE */}

                <img
                  src={item.image}
                  alt=""
                />

                {/* TITLE */}

                <h3>
                  {item.title}
                </h3>

                {/* DESCRIPTION */}

                <p>
                  {item.description}
                </p>

                {/* VIDEO */}

                {item.video && (

                  <video
                    width="100%"
                    controls
                    className="video"
                  >

                    <source
                      src={item.video}
                    />

                  </video>

                )}

                {/* CURRENT BID */}

                <h2>

                  Current Bid :

                  ₹

                  {bids[index]
                    ? bids[index]
                    : item.price}

                </h2>

                {/* MINIMUM RAISE */}

                <p>

                  Minimum Raise :

                  ₹

                  {item.minimumBid ||
                    100}

                </p>

                {/* NEXT MINIMUM BID */}

                <p>

                  Next Minimum Bid :

                  ₹

                  {(bids[index]
                    ? bids[index]
                    : Number(
                        item.price
                      )) +
                    Number(
                      item.minimumBid ||
                        100
                    )}

                </p>

                {/* SELLER */}

                <p>

                  Seller :

                  {item.seller}

                </p>

                {/* SOLD */}

                {soldItems[index] ? (

                  <h2 className="sold-text">

                    SOLD OUT

                  </h2>

                ) : (

                  <>

                    {/* BID INPUT */}

                    <input
                      type="number"
                      placeholder="Enter Your Bid"
                      className="bid-input"
                      onChange={(e) =>
                        setBidInputs({
                          ...bidInputs,
                          [index]:
                            e.target.value
                        })
                      }
                    />

                    {/* BID BUTTON */}

                    <button
                      onClick={() =>
                        handleBid(
                          index,
                          item
                        )
                      }
                    >

                      Place Bid

                    </button>

                    {/* TIMER */}

                    {timers[index] >
                      0 && (

                      <p className="timer">

                        Time Left :

                        {
                          timers[
                            index
                          ]
                        }{" "}

                        sec

                      </p>

                    )}

                  </>

                )}

              </div>

            )
          )
        )}

      </div>

    </div>
  );
}

export default Auction;