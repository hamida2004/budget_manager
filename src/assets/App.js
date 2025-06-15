import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import { UserProvider } from "./context/userContext";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import { BudgetProvider } from "./context/budgetContext";
import ManageBudgets from "./pages/ManageBudgets";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <Router>
      <BudgetProvider>
        <UserProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Home />} />
            <Route path="/budget" element={<ManageBudgets />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </UserProvider>
      </BudgetProvider>
    </Router>
  );
}

export default App;
