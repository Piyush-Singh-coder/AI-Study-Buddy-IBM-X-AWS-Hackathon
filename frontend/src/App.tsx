import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react";
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

          {/* Auth Routes */}
          <Route
            path="/sign-in/*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
                <SignIn
                  routing="path"
                  path="/sign-in"
                  signUpUrl="/sign-up"
                  afterSignInUrl="/dashboard"
                />
              </div>
            }
          />
          <Route
            path="/sign-up/*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
                <SignUp
                  routing="path"
                  path="/sign-up"
                  signInUrl="/sign-in"
                  afterSignUpUrl="/dashboard"
                />
              </div>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/models"
            element={
              <>
                <SignedIn>
                  <ModelsPage />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
