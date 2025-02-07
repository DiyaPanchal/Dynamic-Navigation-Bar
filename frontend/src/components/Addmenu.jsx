import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddMenu() {
  const [title, setTitle] = useState("");
  const [parent, setParent] = useState("");
  const [priority, setPriority] = useState(0);
  const navigate = useNavigate();


  const handleAddMenuItem = async () => {
    const newMenuItem = {
      title,
      parent: parent ? parent : null,
      priority,
    };

    try {
        const adminToken = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/menu/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newMenuItem),
      });

      if (response.ok) {
        alert("Menu item added successfully!");
        setTitle("");
        setParent("");
        setPriority(0);
        navigate("/dashboard");
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

      <input
        type="text"
        placeholder="Parent Menu Item"
        value={parent}
        onChange={(e) => setParent(e.target.value)}
      />

      <input
        type="number"
        placeholder="Priority"
        value={priority}
        onChange={(e) => setPriority(Number(e.target.value))}
      />

      <button onClick={handleAddMenuItem}>Add Menu Item</button>
    </div>
  );
}

export default AddMenu;
