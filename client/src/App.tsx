import { NavLink, Route, Routes } from 'react-router-dom';

import AppLayout from './components/AppLayout';
import COABoardView from './views/COABoard';
import DecisionCaptureView from './views/DecisionCapture';
import MapTTLView from './views/MapTTL';
import PlanWizardView from './views/PlanWizard';

const tabs = [
  { path: '/', label: 'Plan Wizard', element: <PlanWizardView /> },
  { path: '/map', label: 'Map & TTL', element: <MapTTLView /> },
  { path: '/coa', label: 'COA Board', element: <COABoardView /> },
  { path: '/decisions', label: 'Decision Log', element: <DecisionCaptureView /> },
];

export default function App() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              style={({ isActive }) => ({
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                textDecoration: 'none',
                background: isActive ? '#2563eb' : '#1e293b',
                color: '#e2e8f0',
              })}
              end={tab.path === '/'}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <Routes>
          <Route path="/" element={<PlanWizardView />} />
          <Route path="/map" element={<MapTTLView />} />
          <Route path="/coa" element={<COABoardView />} />
          <Route path="/decisions" element={<DecisionCaptureView />} />
        </Routes>
      </div>
    </AppLayout>
  );
}
