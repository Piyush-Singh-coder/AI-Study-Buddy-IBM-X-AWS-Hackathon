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
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#050506] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
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
