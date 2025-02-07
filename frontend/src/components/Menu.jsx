import { useState, useEffect } from "react";


const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/menu", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch menu");
        }

        const data = await response.json();
        const structuredData = structureMenu(data);
        setMenuItems(structuredData);
      } catch (error) {
        console.error("Menu fetch error:", error);
        alert(error.message);
      }
    };

    fetchMenu();
  }, []);

  const structureMenu = (items) => {
    const menuMap = {};
    const rootItems = [];

    items.forEach((item) => {
      menuMap[item._id] = { ...item, children: [] };
    });

    items.forEach((item) => {
      if (item.parent && menuMap[item.parent]) {
        menuMap[item.parent].children.push(menuMap[item._id]);
      } else if (!item.parent) {
        rootItems.push(menuMap[item._id]);
      } else {
        console.warn("Parent not found for:", item);
      }
    });

    return rootItems;
  };

  return (
    <div className="loginpage">
      <nav className="navbar">
        <ul className="nav-links">
          {menuItems.length === 0 ? (
            <p>No menu items available.</p>
          ) : (
            menuItems.map((item) => <MenuItem key={item._id} item={item} />)
          )}
        </ul>
      </nav>
    </div>
  );
};

const MenuItem = ({ item }) => {
  return (
    <li className="nav-item">
      <a href="#">{item.title}</a>
      {item.children.length > 0 && (
        <ul className="dropdown-content">
          {item.children.map((child) => (
            <MenuItem key={child._id} item={child} /> 
          ))}
        </ul>
      )}
    </li>
  );
};


export default Menu;
