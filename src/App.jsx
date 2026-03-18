import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MemberDashboard from "./pages/Member/MemberDashboard";
import ProjectDashboard from "./pages/Project/ProjectDashboard";
import MemberDetail from "./pages/Member/MemberDetail";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

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

        <Route
          path="/projectdashboard"
          element={
            <PrivateRoute>
              <ProjectDashboard />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;