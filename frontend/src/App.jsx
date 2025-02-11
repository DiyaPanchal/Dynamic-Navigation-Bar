import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/DashBoard";
import Menu from "./components/Menu";
import Addmenu from "./components/Addmenu";
import Edituser from "./components/EditUser";
// import Viewmenu from "./components/Viewmenu";
import "./index.css";
// import dotenv from "dotenv";
// dotenv.config();


function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<App />} /> */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/add" element={<Addmenu />} />
        <Route path="/edit" element={<Edituser />} />
        {/* <Route path="/menu/view" element={<Viewmenu />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
