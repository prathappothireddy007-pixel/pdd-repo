import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import {
  useState,
  useEffect
} from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SellItem from "./pages/SellItem";
import Auction from "./pages/Auction";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import EditItem from "./pages/EditItem";

import "./styles/style.css";

/* PROTECTED ROUTE */

function ProtectedRoute({
  children
}) {

  const user =
    localStorage.getItem("user");

  if (!user) {

    alert(
      "Please Login First"
    );

    return (
      <Navigate to="/login" />
    );
  }

  return children;
}

function App() {

  const [products, setProducts] =
    useState([]);

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

  return (

    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={
            <Home
              products={products}
            />
          }
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* SELL ITEM */}

        <Route
          path="/sell"
          element={
            <ProtectedRoute>

              <SellItem
                products={products}
                setProducts={
                  setProducts
                }
              />

            </ProtectedRoute>
          }
        />

        {/* AUCTION */}

        <Route
          path="/auction"
          element={
            <ProtectedRoute>

              <Auction />

            </ProtectedRoute>
          }
        />

        {/* PAYMENT */}

        <Route
          path="/payment"
          element={
            <ProtectedRoute>

              <Payment />

            </ProtectedRoute>
          }
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>

              <Profile />

            </ProtectedRoute>
          }
        />

        {/* EDIT ITEM */}

        <Route
          path="/edit"
          element={
            <ProtectedRoute>

              <EditItem />

            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;