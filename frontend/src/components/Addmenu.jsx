import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AddMenu() {
  const [title, setTitle] = useState("");
  const [parent, setParent] = useState("");
  const [priority, setPriority] = useState(0);
  const [menuList, setMenuList] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(`http://localhost:3000/menus`);
        const data = await response.json();
        if (response.ok) {
          setMenuList(data.menus); 
        } else {
          console.error("Failed to fetch menus");
        }
      } catch (error) {
        console.error("Error fetching menus:", error);
      }
    };

    fetchMenus();
  }, []);

  const handleCancel = () => {
    setTitle("");
    setParent("");
    setPriority(0);
  };

  const handleAddMenuItem = async () => {
    await handleAddAnother();
    navigate("/dashboard");
  };

  const handleAddAnother = async () => {
    const newMenuItem = {
      title,
      parent: parent || null, 
      priority,
    };

    try {
      const adminToken = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/menu/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newMenuItem),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Menu item added successfully!");
        setTitle("");
        setParent("");
        setPriority(0);
        setMenuList([...menuList, data]);
      } else {
        alert("Failed to add menu item");
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      alert("Error connecting to the server");
    }
  };

  return (
    <div className="loginpage">
      <h2 className="loginheading">Add Menu Item</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="menu-parent">
      <label> Select Parent Heading:</label>
      <select value={parent} onChange={(e) => setParent(e.target.value)}>
        <option value="">Parent Heading</option>
        {menuList.map((menu) => (
          <option key={menu._id} value={menu._id}>
            {menu.title}
          </option>
        ))}
      </select>
      </div>

      <input
        type="number"
        placeholder="Priority"
        value={priority}
        onChange={(e) => setPriority(Math.max(0, Number(e.target.value)))}
      />

      <div className="menu-buttons">
        <button onClick={handleAddMenuItem}>Save & Back</button>
        <button onClick={handleAddAnother}>Save & Add Another</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default AddMenu;
