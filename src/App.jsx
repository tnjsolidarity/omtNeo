import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MemberDashboard from "./pages/Member/MemberDashboard";
import ProjectDashboard from "./pages/Project/ProjectDashboard";
import MemberDetail from "./pages/Member/MemberDetail";
import ProjectDetail from "./pages/Project/ProjectDetail";
import PrivateRoute from "./components/PrivateRoute";
import ActivityDetail from "./pages/Activity/ActivityDetail";
import EventDetail from "./pages/Event/EventDetail";
import AttendanceDashboard from "./pages/Attendance/AttendanceDashboard";
import AccountsDashboard from "./pages/Accounts/AccountsDashboard";

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
        <Route 
          path="/projects/:projectId/activities/:activityId"
          element={
            <PrivateRoute>
              <ActivityDetail />
            </PrivateRoute>
          } 
        />
        
        <Route 
        path="/projects/:projectId/activities/:activityId/events/:eventId" 
        element={
          <PrivateRoute>
            <EventDetail />
          </PrivateRoute>
        }        
        />

        {/* Protected Attendance Routes */}
        <Route
          path="/attendancedashboard"
          element={
            <PrivateRoute>
              <AttendanceDashboard />
            </PrivateRoute>
          }
        />

        {/* Protected Accounts Routes */}
        <Route
          path="/accounts"
          element={
            <PrivateRoute>
              <AccountsDashboard />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;