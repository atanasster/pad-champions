import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Outlet,
  ScrollRestoration,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ScreeningLocator from './pages/ScreeningLocator';
import EventCalendar from './pages/EventCalendar';
import RiskAssessment from './pages/RiskAssessment';
import LearnPAD from './pages/LearnPAD';
import Volunteer from './pages/Volunteer';
import About from './pages/About';
import AIScreening from './pages/AIScreening';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
      <ScrollRestoration />
      <Navbar />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="login" element={<Login />} />
      <Route path="screenings" element={<ScreeningLocator />} />
      <Route path="calendar" element={<EventCalendar />} />
      <Route path="quiz" element={<RiskAssessment />} />
      <Route path="ai-screening" element={<AIScreening />} />
      <Route path="learn" element={<LearnPAD />} />
      <Route path="volunteer" element={<Volunteer />} />
      <Route path="about" element={<About />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Route>,
  ),
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
