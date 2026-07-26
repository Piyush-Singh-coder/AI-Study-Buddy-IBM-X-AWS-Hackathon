import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ModelsPage from "./pages/ModelsPage";
import PricingPage from "./pages/PricingPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          {/* Public Home Page */}
          <Route path="/" element={<Home />} />

          {/* Pricing Page */}
          <Route path="/pricing" element={<PricingPage />} />

          {/* Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/models" element={<ModelsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
