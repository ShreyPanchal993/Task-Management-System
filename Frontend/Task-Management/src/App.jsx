import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import LandingPage from "./pages/Public/LandingPage";
import Dashboard from "./pages/Admin/Dashboard";
import ManageTasks from "./pages/Admin/ManageTasks";
import CreateTask from "./pages/Admin/CreateTask";
import ManageUsers from "./pages/Admin/ManageUsers";

import UserDashboard from "./pages/User/UserDashboard";
import MyTasks from "./pages/User/MyTasks";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";

import PrivateRoute from "./routes/PrivateRoute";
import UserProvider, { UserContext } from "./context/userContext";

const App = () => {
  return(
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/signUp" element={<SignUp/>} />
            <Route path="/app" element={<Root/>} />

            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={["admin", "super_admin"]} />}>
              <Route path="/admin/dashboard" element={<Dashboard/>} />
              <Route path="/admin/tasks" element={<ManageTasks/>} />
              <Route path="/admin/create-task" element={<CreateTask/>} />
              <Route path="/admin/users" element={<ManageUsers/>} />
            </Route>

            {/* User Routes */}
            <Route element={<PrivateRoute allowedRoles={["member", "admin", "super_admin"]} />}>
              <Route path="/user/dashboard" element={<UserDashboard/>} />
              <Route path="/user/tasks" element={<MyTasks/>} />
              <Route path="/user/task-details/:id" element={<ViewTaskDetails/>} />
            </Route>

            {/* Default Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </div>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          }
        }}
      />
    </UserProvider>
  )
}

export default App;

const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <Outlet />

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={user.role === "admin" || user.role === "super_admin" ? "/admin/dashboard" : "/user/dashboard"} />;
}
