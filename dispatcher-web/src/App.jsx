import { Link, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Emergencies from "./pages/Emergencies";
import Ambulances from "./pages/Ambulances";
import Hospitals from "./pages/Hospitals";
import Stations from "./pages/Stations";
import Users from "./pages/Users";
import Login from "./pages/Login";

export default function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: 12, padding: 12 }}>
        <Link to="/">Dashboard</Link>
        <Link to="/emergencies">Emergencies</Link>
        <Link to="/ambulances">Ambulances</Link>
        <Link to="/hospitals">Hospitals</Link>
        <Link to="/stations">Stations</Link>
        <Link to="/users">Users</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/emergencies" element={<Emergencies />} />
        <Route path="/ambulances" element={<Ambulances />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/stations" element={<Stations />} />
        <Route path="/users" element={<Users />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}
