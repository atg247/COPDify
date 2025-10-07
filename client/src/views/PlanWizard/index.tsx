import { FormEvent, useState, useEffect } from 'react';

import { usePlanningStore } from '../../state/usePlanningStore';

export default function PlanWizardView() {
  const { selectedPlanId, plans, planDetails, createPhase, createTask, factors, loadFactors, selectPlan } = usePlanningStore();
  const [phaseName, setPhaseName] = useState('');
  const [taskName, setTaskName] = useState('');

  // Reload plan details when component mounts or when navigating back to this tab
  useEffect(() => {
    if (selectedPlanId) {
      selectPlan(selectedPlanId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedPlanId) {
    return <p>Select or create a plan to begin the COPD wizard.</p>;
  }

  const currentPlan = plans.find((plan) => plan.id === selectedPlanId);

  const handleAddPhase = async (event: FormEvent) => {
    event.preventDefault();
    if (!phaseName.trim()) return;
    await createPhase({ name: phaseName });
    setPhaseName('');
  };

  const handleAddTask = async (event: FormEvent) => {
    event.preventDefault();
    if (!taskName.trim()) return;
    await createTask({ name: taskName, category: 'assigned' });
    setTaskName('');
  };

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <header>
        <h1>Operational Design Wizard</h1>
        <p>{currentPlan?.description || 'Step through COPD / AJP-5 milestones.'}</p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <article style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
          <h2>Phases</h2>
          <form onSubmit={handleAddPhase} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              value={phaseName}
              onChange={(e) => setPhaseName(e.target.value)}
              placeholder="Phase title"
              style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
            />
            <button type="submit">Add</button>
          </form>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {planDetails?.phases.map((phase) => (
              <li key={phase.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #0f172a' }}>
                <strong>Phase {phase.sequence}:</strong> {phase.name}
              </li>
            ))}
          </ul>
        </article>

        <article style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
          <h2>Tasks</h2>
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Task title"
              style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
            />
            <button type="submit">Add</button>
          </form>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {planDetails?.tasks.map((task) => (
              <li key={task.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #0f172a' }}>
                {task.name} <span style={{ color: '#64748b' }}>({task.category})</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Planning Artefacts Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Risks */}
        <article style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
          <h2>Risks</h2>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {planDetails?.risks.map((risk) => (
              <li key={risk.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #0f172a' }}>
                <strong>{risk.title}</strong>
                {risk.description && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>{risk.description}</p>}
              </li>
            ))}
            {(!planDetails?.risks || planDetails.risks.length === 0) && <p style={{ color: '#64748b' }}>No risks identified yet.</p>}
          </ul>
        </article>

        {/* Decisive Conditions */}
        <article style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
          <h2>Decisive Conditions</h2>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {planDetails?.decisive_conditions.map((dc) => (
              <li key={dc.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #0f172a' }}>
                <strong>{dc.name}</strong>
                {dc.success_criteria && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>✓ {dc.success_criteria}</p>}
                {dc.moe && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>MOE: {dc.moe}</p>}
              </li>
            ))}
            {(!planDetails?.decisive_conditions || planDetails.decisive_conditions.length === 0) && <p style={{ color: '#64748b' }}>No DCs defined yet.</p>}
          </ul>
        </article>

        {/* Decision Points */}
        <article style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
          <h2>Decision Points</h2>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {planDetails?.decision_points.map((dp) => (
              <li key={dp.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #0f172a' }}>
                <strong>{dp.name}</strong>
                {dp.trigger_time && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>⏰ {dp.trigger_time}</p>}
                {dp.trigger_event && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>🎯 {dp.trigger_event}</p>}
              </li>
            ))}
            {(!planDetails?.decision_points || planDetails.decision_points.length === 0) && <p style={{ color: '#64748b' }}>No DPs defined yet.</p>}
          </ul>
        </article>

        {/* CCIRs */}
        <article style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
          <h2>CCIRs</h2>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {planDetails?.ccirs.map((ccir) => (
              <li key={ccir.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #0f172a' }}>
                <span style={{ fontSize: '0.75rem', background: '#2563eb', padding: '0.25rem 0.5rem', borderRadius: '4px', marginRight: '0.5rem' }}>{ccir.kind}</span>
                <span>{ccir.text}</span>
              </li>
            ))}
            {(!planDetails?.ccirs || planDetails.ccirs.length === 0) && <p style={{ color: '#64748b' }}>No CCIRs defined yet.</p>}
          </ul>
        </article>
      </section>

      {/* Constraints & Assumptions */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <article style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
          <h2>Constraints</h2>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {planDetails?.constraints.map((constraint) => (
              <li key={constraint.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #0f172a', color: '#e2e8f0' }}>
                {constraint.text}
              </li>
            ))}
            {(!planDetails?.constraints || planDetails.constraints.length === 0) && <p style={{ color: '#64748b' }}>No constraints identified.</p>}
          </ul>
        </article>

        <article style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
          <h2>Assumptions</h2>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {planDetails?.assumptions.map((assumption) => (
              <li key={assumption.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #0f172a' }}>
                <span style={{ color: '#e2e8f0' }}>{assumption.text}</span>
                {assumption.validated && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#22c55e' }}>✓ Validated</span>}
              </li>
            ))}
            {(!planDetails?.assumptions || planDetails.assumptions.length === 0) && <p style={{ color: '#64748b' }}>No assumptions recorded.</p>}
          </ul>
        </article>
      </section>

      <section style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>Factor Analysis Snapshot</h2>
          <button onClick={() => loadFactors()}>Refresh</button>
        </header>
        <p style={{ color: '#94a3b8' }}>Factor → Deduction → Conclusion lineage powers tasks, DCs, and commander decisions.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {factors.map((factor) => (
            <article key={factor.id} style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0 }}>{factor.title}</h3>
              <p style={{ color: '#94a3b8' }}>{factor.description || 'No description provided.'}</p>
              <span style={{ fontSize: '0.75rem', background: '#2563eb', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>{factor.domain}</span>
            </article>
          ))}
          {factors.length === 0 && <p>No factors captured yet.</p>}
        </div>
      </section>
    </div>
  );
}
