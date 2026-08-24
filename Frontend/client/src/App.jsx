import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ArenaPage from './pages/ArenaPage.jsx';
import LanguageSelectionPage from './pages/LanguageSelectionPage.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';

function Wrap({children}) {
  return <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-14}} transition={{duration:.25}}>{children}</motion.div>;
}
function AnimatedRoutes() {
  const location=useLocation();
  return <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Wrap><LandingPage/></Wrap>}/>
      <Route path="/register" element={<Wrap><RegisterPage/></Wrap>}/>
      <Route path="/language" element={<Wrap><LanguageSelectionPage/></Wrap>}/>
      <Route path="/arena" element={<Wrap><ArenaPage/></Wrap>}/>
      <Route path="/leaderboard" element={<Wrap><LeaderboardPage/></Wrap>}/>
      <Route path="/admin/login" element={<Wrap><AdminLogin/></Wrap>}/>
      <Route path="/admin/dashboard" element={<Wrap><AdminDashboard/></Wrap>}/>
    </Routes>
  </AnimatePresence>;
}
export default function App(){
  return <BrowserRouter>
    <Toaster position="top-center"/>
    <AnimatedRoutes/>
  </BrowserRouter>;
}
