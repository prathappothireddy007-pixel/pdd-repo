import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSubmit = (e) => {

    e.preventDefault();

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    users.push(form);

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );

    alert("Registered Successfully");

    navigate("/login");
  };

  return (

    <div className="form-container">

      <form onSubmit={handleSubmit}>

        <h2>Register</h2>

        <input
          type="text"
          placeholder="Name"
          required
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value
            })
          }
        />

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

        <button>Register</button>

        <p className="register-text">

          Already have account ?

          <Link to="/login">
            Login
          </Link>

        </p>

      </form>

    </div>
  );
}

export default Register;