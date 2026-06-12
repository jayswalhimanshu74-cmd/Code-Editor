import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import CreateRoom from './pages/CreateRoom/CreateRoom';
import JoinRoom from './pages/JoinRoom/JoinRoom';
import RoomLobby from './pages/RoomLobby/RoomLobby';
import EditorWorkspace from './pages/EditorWorkspace/EditorWorkspace';
import FileManager from './pages/FileManager/FileManager';
import History from './pages/History/History';
import NotFound from './pages/NotFound/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Settings from './pages/Settings/Settings';
import MobileGuard from './components/MobileGaurd';
import ActivityLog from './pages/ActivityLog/ActivityLog';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AuthSuccess from './pages/AuthSuccess/AuthSuccess';

function App() {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/success" element={<AuthSuccess />} />


        {/* Shared Dashboard Layout Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/files" element={<FileManager />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Editor & Lobby (No Layout) */}
        <Route path="/room-lobby/:roomId" element={<ProtectedRoute><RoomLobby /></ProtectedRoute>} />
        <Route path="/workspace/:roomId" element={<ProtectedRoute><MobileGuard><EditorWorkspace /></MobileGuard></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
