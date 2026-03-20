import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MemberDashboard from "./pages/Member/MemberDashboard";
import ProjectDashboard from "./pages/Project/ProjectDashboard";
import MemberDetail from "./pages/Member/MemberDetail";
import ProjectDetail from "./pages/Project/ProjectDetail";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />

        {/* Protected Member Routes */}
        <Route
          path="/memberdashboard"
          element={
            <PrivateRoute>
              <MemberDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/members/:id"
          element={
            <PrivateRoute>
              <MemberDetail />
            </PrivateRoute>
          }
        />

        {/* Protected Project Routes */}
        <Route
          path="/projectdashboard"
          element={
            <PrivateRoute>
              <ProjectDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <ProjectDetail />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;