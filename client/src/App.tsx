import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AssessmentWizard from './components/AssessmentWizard';
import ChatWidget from './components/ChatWidget';
import MyHistory from './pages/MyHistory';
import TrendView from './pages/TrendView';
import ResultPage from './pages/ResultPage';
import ReportPage from './pages/ReportPage';
import HelpPage from './pages/HelpPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/assess" element={<ProtectedRoute><AssessmentWizard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><MyHistory /></ProtectedRoute>} />
        <Route path="/trend" element={<ProtectedRoute><TrendView /></ProtectedRoute>} />
        <Route path="/result/:id" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
        <Route path="/report/:id" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
      </Routes>
      <ChatWidget />
    </>
  );
}
