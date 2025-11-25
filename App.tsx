import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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

// Helper component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/screenings" element={<ScreeningLocator />} />
            <Route path="/calendar" element={<EventCalendar />} />
            <Route path="/quiz" element={<RiskAssessment />} />
            <Route path="/ai-screening" element={<AIScreening />} />
            <Route path="/learn" element={<LearnPAD />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;