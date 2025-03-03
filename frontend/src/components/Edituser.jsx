import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "./Menu";

const EditUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [preview, setPreview] = useState(null);
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
      if (data.menus) {
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

  // const selectUser = (user) => {
  //   setSelectedUser(user);

  //   if (user.accessibleMenus) {
  //     // console.log("User menus :", user.accessibleMenus)
  //     const menuIds = user.accessibleMenus.map((menu) =>
  //       typeof menu === "string" ? menu : menu.menuId
  //     );
  //     // console.log("Menus:", menuIds);

  //     setSelectedMenus(menuIds);
  //   } else {
  //     setSelectedMenus([]);
  //   }
  // };
  const selectUser = (user) => {
    setSelectedUser(user);

    if (user.accessibleMenus) {
      const normalizedMenus = user.accessibleMenus.map(
        (menu) =>
          typeof menu === "string"
            ? { menuId: menu, expiryDate: null } 
            : { menuId: menu.menuId, expiryDate: menu.expiryDate || null }
      );
      setSelectedMenus(normalizedMenus);
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

  // const handleMenuSelect = (menuId) => {
  //   if (!selectedMenus.includes(menuId)) {
  //     setSelectedMenus([...selectedMenus, menuId]);
  //   }
  // };
const handleMenuSelect = (menuId) => {
  if (menuId && !selectedMenus.some((menu) => menu.menuId === menuId)) {
    setSelectedMenus([
      ...selectedMenus,
      { menuId, expiryDate: null },
    ]);
  }
};

  // const removeMenu = (menuId) => {
  //   setSelectedMenus(selectedMenus.filter((id) => id !== menuId));
  // };

  const removeMenu = (menuId) => {
    setSelectedMenus((prevMenus) =>
      prevMenus.filter((menu) => menu.menuId !== menuId)
    );
  };


  const updateUserBack = async () => {
    await updateUser();
    navigate("/dashboard");
  };
  
const handlePreviewAccess = () => {
  if (!selectedUser) return;

  const proposedAccessFormatted = selectedMenus.map((menu) => ({
    menuId: menu.menuId,
    expiryDate: menu.expiryDate || "2025-12-31T23:59:59.000Z",
    _id: menu.menuId,
  }));

  setPreview({
    currentAccess: [...(selectedUser.accessibleMenus || [])],
    proposedAccess: proposedAccessFormatted,
  });

  setShowPopup(true);
};


// console.log("preview.current", preview.currentAccess);
// console.log("preview.proposed", preview.proposedAccess);

const handleExpiryChange = (menuId, newExpiryDate) => {
  setSelectedMenus((prevMenus) =>
    prevMenus.map((menu) =>
      menu.menuId === menuId ? { ...menu, expiryDate: newExpiryDate } : menu
    )
  );
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
      accessibleMenus: selectedMenus.map((menu) => ({
        menuId: menu.menuId,
        expiryDate: menu.expiryDate || "2025-12-31",
      })),
    };

    // console.log("Final Payload Sent:", updatedData);

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
    console.error("Update Error:", err);
  }
  setLoading(false);
};

  return (
    <div className="edit-table-container">
      <h2 className="login-title">User Management</h2>
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
                  <div className="form-buttons">
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
          <h3 className="login-title">Edit User</h3>
          <input type="email" value={selectedUser.email} disabled />
          <input
            type="text"
            value={selectedUser.username}
            onChange={(e) =>
              setSelectedUser({ ...selectedUser, username: e.target.value })
            }
          />

          <label>Role</label>
          <select
            className="register-role"
            value={selectedUser.role}
            onChange={(e) =>
              setSelectedUser({ ...selectedUser, role: e.target.value })
            }
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div className="edit-section">
            <label>Selected Menus</label>
            {selectedMenus.map((menu) => {
              const menuData = menus.find((m) => m._id === menu.menuId);
              // console.log("Selected menus", selectedMenus);
              // console.log("menuData", menuData);
              // console.log("menus", menus);

              return (
                menuData && (
                  <p key={menu.menuId} className="edit-menu">
                    {menuData.title}{" "}
                    <input
                      className="date-input"
                      type="date"
                      value={
                        menu.expiryDate ? menu.expiryDate.split("T")[0] : ""
                      }
                      onChange={(e) =>
                        handleExpiryChange(menu.menuId, e.target.value)
                      }
                    />
                    <span
                      className="cross-button"
                      onClick={() => removeMenu(menu.menuId)}
                    >
                      x
                    </span>
                  </p>
                )
              );
            })}
          </div>

          <label>Select Accessible Menus</label>
          <select
            className="register-role"
            onChange={(e) => handleMenuSelect(e.target.value)}
            value=""
          >
            <option value="" disabled>
              Select Menu
            </option>
            {menus
              .filter(
                (menu) => !selectedMenus.some((sm) => sm.menuId === menu._id)
              )
              .map((menu) => (
                <option key={menu._id} value={menu._id}>
                  {menu.title}
                </option>
              ))}
          </select>

          {showPopup && preview && (
            <div className="popup">
              <h3>Are you sure you want to update the access?</h3>

              <h4>Current Menu Access:</h4>
              <Menu menuData={preview.currentAccess} />
              <h4>New Menu Access:</h4>
              <Menu menuData={preview.proposedAccess} />

              <button onClick={updateUser}>Confirm</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          )}

          <div className="form-buttons">
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
