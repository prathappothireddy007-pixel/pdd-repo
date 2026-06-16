import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function EditItem() {

  const navigate = useNavigate();

  const [products, setProducts] =
    useState([]);

  useEffect(() => {

    const savedProducts =
      JSON.parse(
        localStorage.getItem("products")
      ) || [];

    setProducts(savedProducts);

  }, []);

  const handleChange = (
    index,
    field,
    value
  ) => {

    const updatedProducts =
      [...products];

    updatedProducts[index][field] =
      value;

    setProducts(updatedProducts);
  };

  const saveChanges = () => {

    localStorage.setItem(
      "products",
      JSON.stringify(products)
    );

    alert(
      "Item Updated Successfully"
    );

    navigate("/");
  };

  const deleteItem = (index) => {

    const updatedProducts =
      products.filter(
        (_, i) => i !== index
      );

    setProducts(updatedProducts);

    localStorage.setItem(
      "products",
      JSON.stringify(
        updatedProducts
      )
    );

    alert(
      "Item Deleted Successfully"
    );
  };

  return (

    <div className="container">

      <h1>Edit Auction Items</h1>

      {products.length === 0 ? (

        <h2>No Products Found</h2>

      ) : (

        products.map(
          (item, index) => (

            <div
              className="edit-card"
              key={index}
            >

              <img
                src={item.image}
                alt=""
                className="edit-image"
              />

              {/* TITLE */}

              <input
                type="text"
                value={item.title}
                onChange={(e) =>
                  handleChange(
                    index,
                    "title",
                    e.target.value
                  )
                }
              />

              {/* DESCRIPTION */}

              <textarea
                value={
                  item.description
                }
                onChange={(e) =>
                  handleChange(
                    index,
                    "description",
                    e.target.value
                  )
                }
              />

              {/* PRICE */}

              <input
                type="number"
                value={item.price}
                onChange={(e) =>
                  handleChange(
                    index,
                    "price",
                    e.target.value
                  )
                }
              />

              {/* MINIMUM BID */}

              <input
                type="number"
                value={
                  item.minimumBid
                }
                onChange={(e) =>
                  handleChange(
                    index,
                    "minimumBid",
                    e.target.value
                  )
                }
              />

              {/* IMAGE */}

              <input
                type="text"
                value={item.image}
                onChange={(e) =>
                  handleChange(
                    index,
                    "image",
                    e.target.value
                  )
                }
              />

              {/* VIDEO */}

              <input
                type="text"
                value={item.video}
                onChange={(e) =>
                  handleChange(
                    index,
                    "video",
                    e.target.value
                  )
                }
              />

              <div className="edit-buttons">

                <button
                  onClick={
                    saveChanges
                  }
                >
                  Save Changes
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteItem(index)
                  }
                >
                  Delete Item
                </button>

              </div>

            </div>

          )
        )
      )}

    </div>
  );
}

export default EditItem;