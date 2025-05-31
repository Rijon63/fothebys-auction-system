import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import CreateAuction from "./pages/CreateAuction"; // ✅ Add this line
import './assets/App.css';
import EditAuction from "./pages/EditAuction";
import AuctionDetails from "./pages/AuctionDetails";
import CreateLot from "./pages/CreateLot";
import EditLot from "./pages/EditLot";
import Clients from "./pages/Clients";
import CommissionBids from "./pages/CommissionBids";
import ClientPortal from "./pages/ClientPortal";
import EditClient from "./pages/EditClient";
import Reports from "./pages/Reports";
import AdvancedSearch from "./pages/AdvancedSearch";
import LotsDashboard from "./pages/LotsDashboard";
import Favorites from "./pages/Favorites";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/edit-auction/:id" element={<EditAuction />} />
          <Route path="/auction/:id" element={<AuctionDetails />} />
          <Route path="/create-lot" element={<CreateLot />} />
          <Route path="/edit-lot/:id" element={<EditLot />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/edit-client/:id" element={<EditClient />} />
<Route path="/commission-bids" element={<CommissionBids />} />
<Route path="/client-portal" element={<ClientPortal />} />
<Route path="/advanced-search" element={<AdvancedSearch />} />
<Route path="/lots-dashboard" element={<LotsDashboard />} />
<Route path="/favorites" element={<Favorites />} />
<Route path="/reports" element={<ProtectedRoute allowedRoles={["admin"]}><Reports /></ProtectedRoute>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "seller", "buyer"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-auction"
            element={
              <ProtectedRoute allowedRoles={["admin", "seller"]}>
                <CreateAuction />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
