import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SellItem({ products, setProducts }) {

  const navigate = useNavigate();

  const currentUser =
    JSON.parse(
      localStorage.getItem("user")
    );

  const [item, setItem] =
    useState({
      title: "",
      description: "",
      price: "",
      minimumBid: "",
      image: "",
      video: ""
    });

  const handleSubmit = (e) => {

    e.preventDefault();

    const newItem = {

      ...item,

      seller:
        currentUser?.email ||

        "Unknown Seller"
    };

    const updatedProducts = [
      ...products,
      newItem
    ];

    setProducts(updatedProducts);

    localStorage.setItem(
      "products",
      JSON.stringify(
        updatedProducts
      )
    );

    alert(
      "Product Added Successfully"
    );

    navigate("/");
  };

  return (

    <div className="form-container">

      <form onSubmit={handleSubmit}>

        <h2>Sell Product</h2>

        {/* PRODUCT NAME */}

        <input
          type="text"
          placeholder="Product Name"
          required
          onChange={(e) =>
            setItem({
              ...item,
              title: e.target.value
            })
          }
        />

        {/* DESCRIPTION */}

        <textarea
          placeholder="Description"
          required
          onChange={(e) =>
            setItem({
              ...item,
              description:
                e.target.value
            })
          }
        />

        {/* PRICE */}

        <input
          type="number"
          placeholder="Starting Price"
          required
          onChange={(e) =>
            setItem({
              ...item,
              price:
                e.target.value
            })
          }
        />

        {/* MINIMUM BID */}

        <input
          type="number"
          placeholder="Minimum Bid Increase"
          required
          onChange={(e) =>
            setItem({
              ...item,
              minimumBid:
                e.target.value
            })
          }
        />

        {/* IMAGE URL */}

        <input
          type="text"
          placeholder="Image URL"
          required
          onChange={(e) =>
            setItem({
              ...item,
              image:
                e.target.value
            })
          }
        />

        {/* VIDEO URL */}

        <input
          type="text"
          placeholder="Video URL"
          onChange={(e) =>
            setItem({
              ...item,
              video:
                e.target.value
            })
          }
        />

        <button>
          Add Product
        </button>

      </form>

    </div>
  );
}

export default SellItem;