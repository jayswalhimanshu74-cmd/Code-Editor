import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/create-room" element={<ProtectedRoute><CreateRoom /></ProtectedRoute>} />
        <Route path="/join-room" element={<ProtectedRoute><JoinRoom /></ProtectedRoute>} />
        <Route path="/room-lobby/:roomId" element={<ProtectedRoute><RoomLobby /></ProtectedRoute>} />
        <Route path="/workspace/:roomId" element={<ProtectedRoute><MobileGuard><EditorWorkspace /></MobileGuard></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute><FileManager /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />


        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
