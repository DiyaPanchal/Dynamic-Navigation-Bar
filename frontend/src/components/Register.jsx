import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [accessibleMenus, setAccessibleMenus] = useState("");
  const navigate = useNavigate();

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
          accessibleMenus: accessibleMenus.split(","),
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
      setRole("");
      setAccessibleMenus("");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
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
      <input
        type="text"
        placeholder="Accessible Menus"
        value={accessibleMenus}
        onChange={(e) => setAccessibleMenus(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
