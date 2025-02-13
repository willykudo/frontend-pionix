import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProductList from './components/Stok/ProductList';
import NavigationMenu from './components/NavigationMenu';
import RentalList from './components/Rental/RentalList';
import AttendanceList from './components/Attendance/AttendanceList';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/pages/Profile';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ShiftList from './components/Shift/ShiftList';
import ForgotPassword from './components/Auth/ForgotPassword';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sinkronisasi state isAuthenticated dengan token di localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  // const handleLogout = () => {
  //   localStorage.removeItem('token');
  //   setIsAuthenticated(false);
  // };

  if (isLoading) {
    // Render layar loading sementara saat aplikasi memeriksa status autentikasi
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {isAuthenticated && <NavigationMenu setIsAuthenticated={setIsAuthenticated} />}

      <Routes>
        {/* Redirect ke "/stok" jika login, atau ke "/login" jika belum */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/stok" : "/login"} replace />}
        />

        {/* Route Login dan Register */}
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/stok"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shifting"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ShiftList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/presensi"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AttendanceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/penyewaan"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <RentalList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Profile setIsAuthenticated={setIsAuthenticated} />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
