/**
 * Main App Component with Routing
 *
 * Sets up client-side routing:
 * - / → Strategy Map (main application)
 * - /dashboard → Analytics Dashboard
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StrategyMap } from './pages/StrategyMap';
import { Dashboard } from './pages/Dashboard';
import { ViewDiagram } from './pages/ViewDiagram';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StrategyMap />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/view/:id" element={<ViewDiagram />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
