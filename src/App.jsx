import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { ControlPanel } from './pages/ControlPanel';
import { Demo } from './pages/Demo';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/panel" element={<ControlPanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App;
