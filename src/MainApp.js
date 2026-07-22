import React, { lazy, useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { MultiBackend, createTransition } from 'react-dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import Mascot from './components/Mascot';
import './index.css';

// Lazy-loaded routes — each section's code only downloads when the user navigates to it.
// This significantly reduces the initial bundle size, especially for mobile users.
const Qaida    = lazy(() => import('./components/Qaida'));
const Ginti    = lazy(() => import('./components/Ginti'));
const Rung     = lazy(() => import('./components/Rung'));
const Khel     = lazy(() => import('./components/Khel'));
const Maloomat = lazy(() => import('./components/Maloomat'));
const Kahaniyan = lazy(() => import('./components/Kahaniyan'));
const Nazmain  = lazy(() => import('./components/Nazmain'));
const Kitabain = lazy(() => import('./components/Kitabain'));

const DND_MULTI_BACKEND = {
  backends: [
    { backend: HTML5Backend },
    {
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      transition: createTransition('touchstart', (e) => e.touches != null),
    },
  ],
};

const components = [
  { name: 'qaida',     label: 'قاعدہ' },
  { name: 'ginti',     label: 'گنتی' },
  { name: 'rung',      label: 'رنگ' },
  { name: 'khel',      label: 'کھیل' },
  { name: 'maloomat',  label: 'معلومات' },
  { name: 'kahaniyan', label: 'کہانیاں' },
  { name: 'nazmain',   label: 'نظمیں' },
  { name: 'kitabain',  label: 'کتابیں' },
];

// All sections are now active — remove a name from this array to mark it "coming soon"
const activeComponents = ['qaida', 'ginti', 'rung', 'kahaniyan', 'nazmain', 'khel', 'maloomat', 'kitabain'];

function MainApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const showThumbnails = location.pathname === '/';

  return (
    <div className="app">
      <Mascot />

      {!showThumbnails && (
        <button className="back-button" onClick={() => navigate('/')}>⬅</button>
      )}

      {showThumbnails && (
        <nav className="nav-thumbnails">
          {components.map((comp) =>
            activeComponents.includes(comp.name) ? (
              <Link key={comp.name} to={`/${comp.name}`} className="thumbnail">
                <img src={`/images/${comp.name}.png`} alt={comp.label} loading="lazy" />
                <span className="thumbnail-text">{comp.label}</span>
              </Link>
            ) : (
              <div key={comp.name} className="thumbnail unavailable">
                <img src={`/images/${comp.name}.png`} alt={comp.label} loading="lazy" />
                <span className="thumbnail-text">{comp.label}</span>
                <div className="unavailable-overlay">جلد آ رہا ہے</div>
              </div>
            )
          )}
        </nav>
      )}

      <Routes>
        <Route path="/" />
        <Route path="/qaida"     element={<Qaida />} />
        <Route path="/ginti"     element={<Ginti />} />
        <Route path="/rung"      element={<Rung />} />
        <Route path="/maloomat"  element={<Maloomat />} />
        <Route path="/kahaniyan" element={<Kahaniyan />} />
        <Route path="/nazmain"   element={<Nazmain />} />
        <Route path="/kitabain"  element={<Kitabain />} />
        {/* DndProvider scoped only to /khel — avoids global DnD overhead */}
        <Route
          path="/khel"
          element={
            <DndProvider backend={MultiBackend} options={DND_MULTI_BACKEND}>
              <Khel />
            </DndProvider>
          }
        />
      </Routes>
    </div>
  );
}

export default MainApp;
