import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { FiUsers } from "react-icons/fi";
import { RiMenuAddFill } from "react-icons/ri";



const Dashboard = () => {
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        setUserId(decoded.user_id);
        setUsername(decoded.username || "Admin");

        // Corrected profile picture assignment
        const profileImage =
          decoded.role === "admin" ? "/admin.png" : "/user.png";
        setProfilePic(profileImage);
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="profile-sidebar">
        <div className="profile-section">
          <img src={profilePic} alt="Profile" className="profile-pic" />
          <h3>{username}</h3>
          <p>ID: {userId}</p>
          <p>Role: {userRole}</p>
        </div>
        <nav className="sidebar-nav">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/menu")}>View Menu</button>
          {userRole === "admin" && (
            <>
              <button onClick={() => navigate("/register")}>
                Manage Users
              </button>
              <button onClick={() => navigate("/menu/add")}>
                Add Menu Item
              </button>
              <button onClick={() => navigate("/edit")}>Edit User</button>
            </>
          )}
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </nav>
      </div>
      <div className="dashboard-content">
        <h2>Welcome, {username}!</h2>
        <h2>
          {userRole === "admin"
            ? "Manage users and menu items easily."
            : "Access your features effortlessly."}
        </h2>

        <div className="dashboard-section">
          <RiMenuAddFill />

          <h3>Customize Navigation</h3>
          <p>
            Customize the navigation bar by adding menu items for
            different users.
          </p>
          <ul>
            <li>
              <strong>View Menu:</strong> Browse available options.
            </li>
            {userRole === "admin" && (
              <li>
                <strong>Add Menu Item:</strong> Customize the navigation bar.
              </li>
            )}
          </ul>
          
        </div>
        {userRole === "admin" && (
          <div className="dashboard-section">
            <FiUsers />
            <h3>Manage Users</h3>
            <p>
              Easily manage access for your users by searching and modifying
              their permissions.
            </p>
            <ul>
              <li>
                <strong>Add Users:</strong> Register new users.
              </li>
              <li>
                <strong>Edit User:</strong> Modify or remove existing users.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
