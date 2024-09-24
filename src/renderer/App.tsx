import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import Login from '../pages/Login';
import Signup from '../pages/SignUp';
import SummaryPage from '../pages/SummaryPage';
import SettingPage from '../pages/SettingPage';
import GoogleButton from '../components/Login/GoogleButton';
import useAuth from '../hooks/useAuth';
import useCheckCookies from '../hooks/useCheckCookies';

const App: React.FC = () => {
  const { loading } = useAuth();
  const { checkLoginStatus } = useCheckCookies(); // Renamed for clarity

  // Run checkLoginStatus only once when the app starts
  useEffect(() => {
    checkLoginStatus(); // Check the login state via the server
  }, [checkLoginStatus]);

  if (loading) {
    return <div>Loading...</div>; // Replace with a proper loading spinner or component
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/summary" element={<SummaryPage />} />
      <Route path="/setting" element={<SettingPage />} />
      <Route path="/gglogin" element={<GoogleButton />} />
    </Routes>
  );
};

export default App;
