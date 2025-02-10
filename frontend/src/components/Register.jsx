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
    const fetchMenus = async () => {
      try {
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

    fetchMenus();
  }, []);

  const handleMenuSelection = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const selectedMenu = menuOptions.find((menu) => menu._id === selectedId);
    if (selectedMenu) {
      setSelectedMenus([...selectedMenus, selectedMenu]);
      setMenuOptions(menuOptions.filter((menu) => menu._id !== selectedId));
    }
  };

  const handleRemoveMenu = (menuId) => {
    const removedMenu = selectedMenus.find((menu) => menu._id === menuId);
    if (removedMenu) {
      setMenuOptions([...menuOptions, removedMenu]);
      setSelectedMenus(selectedMenus.filter((menu) => menu._id !== menuId));
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
          accessibleMenus: selectedMenus.map((menu) => menu._id),
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
    } catch (error) {
      alert(error.message);
    }
  };
  const handleBackRegister = async () => {
    await handleRegister();
    navigate("/dashboard");
  };
  const handleCancel = async () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("user");
    setSelectedMenus([]);
  };

  return (
    <div className="loginpage">
      <h2 className="loginheading">Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="text"
        placeholder="Role (admin/user)"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      <div className="menu-select">
        <label>Select Accessible Menus:</label>
        {loading ? (
          <p>Loading menu options</p>
        ) : (
          <>
            <select onChange={handleMenuSelection}>
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
                    <li key={menu._id}>
                      {menu.title}
                      <p
                        className="cross-button"
                        onClick={() => handleRemoveMenu(menu._id)}
                      >
                        x
                      </p>
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
      <div className="menu-buttons">
        <button onClick={handleBackRegister}>Save & Back</button>
        <button onClick={handleRegister}>Save & Add Another</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default Register;
