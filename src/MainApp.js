import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

import Qaida from './components/Qaida';
import Ginti from './components/Ginti';
import Rung from './components/Rung';
import Khel from './components/Khel';
import Kahaniyan from './components/Kahaniyan';
import Maloomat from './components/Maloomat';
import Nazmain from './components/Nazmain';
import Kitabain from './components/Kitabain';
import Mascot from './components/Mascot';

import './index.css';

// ✅ Correct drag-and-drop setup
import { DndProvider } from 'react-dnd';
import { MultiBackend, createTransition } from 'react-dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

const DND_MULTI_BACKEND = {
  backends: [
    {
      backend: HTML5Backend,
    },
    {
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      transition: createTransition('touchstart', (e) => e.touches != null),
    },
  ],
};

function MainApp() {
  const [showThumbnails, setShowThumbnails] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const activeComponents = ["qaida", "ginti", "rung", "kahaniyan", "nazmain", "khel", "maloomat", "kitabain"];

  const components = [
    { name: "qaida", label: "قاعدہ" },
    { name: "ginti", label: "گنتی" },
    { name: "rung", label: "رنگ" },
    { name: "khel", label: "کھیل" },
    { name: "maloomat", label: "معلومات" },
    { name: "kahaniyan", label: "کہانیاں" },
    { name: "nazmain", label: "نظمیں" },
    { name: "kitabain", label: "کتابیں" }
  ];

  useEffect(() => {
    setShowThumbnails(location.pathname === "/");
  }, [location]);

  return (
    <div className="app">
      <Mascot />
      {!showThumbnails && (
        <button className="back-button" onClick={() => navigate("/")}>
          ⬅
        </button>
      )}

      {showThumbnails && (
        <nav className="nav-thumbnails">
          {components.map((comp) =>
            activeComponents.includes(comp.name) ? (
              <Link key={comp.name} to={`/${comp.name}`} className="thumbnail">
                <img src={`/images/${comp.name}.png`} alt={comp.label} />
                <span className="thumbnail-text">{comp.label}</span>
              </Link>
            ) : (
              <div key={comp.name} className="thumbnail unavailable">
                <img src={`/images/${comp.name}.png`} alt={comp.label} />
                <span className="thumbnail-text">{comp.label}</span>
                <div className="unavailable-overlay">جلد آ رہا ہے</div>
              </div>
            )
          )}
        </nav>
      )}

      <Routes>
        <Route path="/" />
        <Route path="/qaida" element={<Qaida />} />
        <Route path="/ginti" element={<Ginti />} />
        <Route path="/rung" element={<Rung />} />
        {/* ✅ Reliable Khel route with DnD context */}
        <Route
          path="/khel"
          element={
            <DndProvider backend={MultiBackend} options={DND_MULTI_BACKEND}>
              <Khel />
            </DndProvider>
          }
        />

        <Route path="/maloomat" element={<Maloomat />} />
        <Route path="/kahaniyan" element={<Kahaniyan />} />
        <Route path="/nazmain" element={<Nazmain />} />
        <Route path="/kitabain" element={<Kitabain />} />
      </Routes>
    </div>
  );
}

export default MainApp;
