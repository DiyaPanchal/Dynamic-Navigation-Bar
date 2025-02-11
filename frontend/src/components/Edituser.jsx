import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EditUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchMenus();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/allusers");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users.");
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await fetch("http://localhost:3000/menus");
      if (!response.ok) throw new Error("Failed to fetch menus");

      const data = await response.json();
      if (data.menus && Array.isArray(data.menus)) {
        setMenus(data.menus);
      } else {
        throw new Error("Menus data is not an array");
      }
    } catch (err) {
      console.error(err);
      setMenus([]);
    }
  };
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);
  };

  const selectUser = (user) => {
    setSelectedUser(user);

    if (user.accessibleMenus) {
      const menuIds = user.accessibleMenus.map((menu) =>
        typeof menu === "string" ? menu : menu._id
      );
      // console.log("Menus:", menuIds);

      setSelectedMenus(menuIds);
    } else {
      setSelectedMenus([]);
    }
  };

const deleteUser = async (userId) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized: No token found");
      return;
    }

    const response = await fetch(`http://localhost:3000/delete/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete user");

    alert("User deleted successfully!");
    fetchUsers(); 
  } catch (err) {
    setError("Error deleting user");
  }
};

  const handleMenuSelect = (menuId) => {
    if (!selectedMenus.includes(menuId)) {
      setSelectedMenus([...selectedMenus, menuId]);
    }
  };

  const removeMenu = (menuId) => {
    setSelectedMenus(selectedMenus.filter((id) => id !== menuId));
  };
  const updateUserBack = async () => {
    await updateUser();
    navigate("/dashboard");
  };

  const updateUser = async () => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: No token found");
        setLoading(false);
        return;
      }

      const updatedData = {
        ...selectedUser,
        accessibleMenus: selectedMenus,
      };

      const response = await fetch(
        `http://localhost:3000/update/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error("Error updating user");
      alert("User updated successfully!");
      fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      setError("Error updating user");
    }
    setLoading(false);
  };

  return (
    <div className="loginpage editpage">
      <h2 className="loginheading">User Management</h2>
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-bar"
      />
      <table className="edit-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(searchQuery ? filteredUsers : users).map((user) => (
            <tr key={user._id}>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                {user.role !== "admin" && (
                  <div className="action-buttons">
                    <button onClick={() => selectUser(user)}>Edit</button>
                    <button onClick={() => deleteUser(user._id)}>Remove</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && (
        <div>
          <h3>Edit User</h3>
          <input type="email" value={selectedUser.email} disabled />
          <input
            type="text"
            value={selectedUser.username}
            onChange={(e) =>
              setSelectedUser({ ...selectedUser, username: e.target.value })
            }
          />

          <label>Role:</label>
          <select
            className="edit-role"
            value={selectedUser.role}
            onChange={(e) =>
              setSelectedUser({ ...selectedUser, role: e.target.value })
            }
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <div className="edit-section">
            <label>Selected Menus:</label>
            {selectedMenus.map((menuId) => {
              const menu = menus.find((m) => m._id === menuId);
              return (
                menu && (
                  <p key={menu._id} className="edit-menu">
                    {menu.title}{" "}
                    <p
                      className="cross-button"
                      onClick={() => removeMenu(menu._id)}
                    >
                      x
                    </p>
                  </p>
                )
              );
            })}
          </div>

          <label>Select Accessible Menus:</label>
          <select onChange={(e) => handleMenuSelect(e.target.value)} value="">
            <option value="" disabled>
              Select Menu
            </option>
            {menus
              .filter((menu) => !selectedMenus.includes(menu._id))
              .map((menu) => (
                <option key={menu._id} value={menu._id}>
                  {menu.title}
                </option>
              ))}
          </select>
          <div className="menu-buttons">
            <button onClick={updateUser} disabled={loading}>
              Save
            </button>
            <button onClick={updateUserBack} disabled={loading}>
              Save & Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditUser;
