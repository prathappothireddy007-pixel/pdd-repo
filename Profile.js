import { useNavigate } from "react-router-dom";

function Profile() {

  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {

    localStorage.removeItem("user");

    alert("Logged Out");

    navigate("/login");
  };

  return (

    <div className="profile-container">

      <div className="profile-card">

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt=""
        />

        <h2>{user?.email}</h2>

        <p>Online Auction User</p>

        <button onClick={handleLogout}>
          Logout
        </button>

      </div>

    </div>
  );
}

export default Profile;