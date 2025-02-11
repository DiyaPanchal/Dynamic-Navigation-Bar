import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        setUserId(decoded.user_id);
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

  const addUser = () => {
    navigate("/register");
  };

  const addMenu = () => {
    navigate("/menu/add");
  };
  const editUser = () => {
    navigate("/edit");
  };
  // const deleteUser = (id) => {
  //   navigate(`/delete/${id}`);
  // };

  return (
    <div className="loginpage">
      <h2 className="loginheading">Dashboard</h2>
      <button onClick={() => navigate("/menu")}>View Menu</button>
      <button onClick={logout}>Logout</button>
      {userRole === "admin" && <button onClick={addUser}>Add User</button>}
      {userRole === "admin" && <button onClick={addMenu}>Add Menu</button>}
      {userRole === "admin" && <button onClick={editUser}>Edit User</button>}
    </div>
  );
};

export default Dashboard;
