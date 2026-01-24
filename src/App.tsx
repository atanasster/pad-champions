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
      <Route path="screenings" element={<ScreeningLocator />} />
      <Route path="calendar" element={<EventCalendar />} />
      <Route path="quiz" element={<RiskAssessment />} />
      <Route path="ai-screening" element={<AIScreening />} />
      <Route path="learn" element={<LearnPAD />} />
      <Route path="volunteer" element={<Volunteer />} />
      <Route path="about" element={<About />} />
    </Route>,
  ),
);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
