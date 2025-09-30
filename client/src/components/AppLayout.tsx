import { PropsWithChildren, useEffect, useState } from 'react';
import { usePlanningStore } from '../state/usePlanningStore';

export default function AppLayout({ children }: PropsWithChildren) {
  const { plans, selectedPlanId, loadPlans, createPlan, selectPlan } = usePlanningStore();
  const [newPlanName, setNewPlanName] = useState('');

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return;
    await createPlan({ name: newPlanName });
    setNewPlanName('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh' }}>
      <aside style={{ background: '#111827', padding: '1rem', borderRight: '1px solid #1e293b' }}>
        <h2 style={{ marginTop: 0 }}>COPDify</h2>
        <div style={{ marginBottom: '1rem' }}>
          <input
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            placeholder="New plan name"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
          />
          <button style={{ marginTop: '0.5rem', width: '100%' }} onClick={handleCreatePlan}>
            Create Plan
          </button>
        </div>
        <nav>
          <h3>Plans</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {plans.map((plan) => (
              <li key={plan.id}>
                <button
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    background: plan.id === selectedPlanId ? '#1d4ed8' : 'transparent',
                    color: plan.id === selectedPlanId ? '#e2e8f0' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => selectPlan(plan.id)}
                >
                  {plan.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main style={{ padding: '1.5rem', overflow: 'auto' }}>{children}</main>
    </div>
  );
}
