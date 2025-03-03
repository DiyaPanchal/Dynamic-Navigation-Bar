import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [menuOptions, setMenuOptions] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/menus");
      if (!response.ok) throw new Error("Failed to fetch menus");
      const data = await response.json();
      if (!data.menus || !Array.isArray(data.menus)) {
        throw new Error("Invalid menu data format");
      }
      setMenuOptions(data.menus);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMenuOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSelection = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const selectedMenu = menuOptions.find((menu) => menu._id === selectedId);
    if (selectedMenu) {
      setSelectedMenus([
        ...selectedMenus,
        { menuId: selectedMenu._id, title: selectedMenu.title, expiryDate: "" },
      ]);
      setMenuOptions(menuOptions.filter((menu) => menu._id !== selectedId));
    }
  };

  const handleExpiryChange = (menuId, expiryDate) => {
    setSelectedMenus(
      selectedMenus.map((menu) =>
        menu.menuId === menuId ? { ...menu, expiryDate } : menu
      )
    );
  };

  const handleRemoveMenu = (menuId) => {
    const removedMenu = selectedMenus.find((menu) => menu.menuId === menuId);
    if (removedMenu) {
      setMenuOptions([
        ...menuOptions,
        { _id: removedMenu.menuId, title: removedMenu.title },
      ]);
      setSelectedMenus(selectedMenus.filter((menu) => menu.menuId !== menuId));
    }
  };

  const handleRegister = async () => {
    try {
      const adminToken = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
          accessibleMenus: selectedMenus.map(({ menuId, expiryDate }) => ({
            menuId,
            expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("User registered successfully!");
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("user");
      setSelectedMenus([]);
      fetchMenus();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBackRegister = async () => {
    await handleRegister();
    navigate("/dashboard");
  };

  const handleCancel = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("user");
    setSelectedMenus([]);
  };

  return (
    <div className="register-container">
      <h2 className="login-title">Register</h2>
      <div className="register-details">
        <div className="register-input">
          <label>Username</label>
          <input
            type="text"
            placeholder="Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Role</label>
          <select className="register-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="menu-select">
          <label>Select Accessible Menus:</label>
          {loading ? (
            <p>Loading menu options...</p> 
          ) : (
            <>
              <select className="register-role" onChange={handleMenuSelection}>
                <option value="">Select Menu</option>
                {menuOptions.map((menu) => (
                  <option key={menu._id} value={menu._id}>
                    {menu.title}
                  </option>
                ))}
              </select>
              <div className="selected-menu">
                <label>Selected Menus:</label>
                {selectedMenus.length > 0 ? (
                  <ul>
                    {selectedMenus.map((menu) => (
                      <li key={menu.menuId}>
                        {menu.title}
                        <input
                          className="date-input"
                          type="date"
                          value={menu.expiryDate}
                          onChange={(e) =>
                            handleExpiryChange(menu.menuId, e.target.value)
                          }
                        />
                        <span
                          className="cross-button"
                          onClick={() => handleRemoveMenu(menu.menuId)}
                        >
                          x
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No menus selected</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="form-buttons">
        <button onClick={handleBackRegister}>Save & Back</button>
        <button onClick={handleRegister}>Save & Add Another</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default Register;
