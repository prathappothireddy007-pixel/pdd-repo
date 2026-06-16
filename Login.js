import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = (e) => {

    e.preventDefault();

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(
      (u) =>
        u.email === form.email &&
        u.password === form.password
    );

    if (foundUser) {

      localStorage.setItem(
        "user",
        JSON.stringify(foundUser)
      );

      alert("Login Successful");

      navigate("/");

    } else {

      alert("Invalid Credentials");

    }
  };

  return (

    <div className="form-container">

      <form onSubmit={handleSubmit}>

        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
        />

        <button>Login</button>

        <p className="register-text">

          Don't have account ?

          <Link to="/register">
            Register
          </Link>

        </p>

      </form>

    </div>
  );
}

export default Login;