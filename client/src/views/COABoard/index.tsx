import { useMemo } from 'react';

import { usePlanningStore } from '../../state/usePlanningStore';

export default function COABoardView() {
  const { planDetails } = usePlanningStore();

  const groupedTasks = useMemo(() => {
    if (!planDetails) return {} as Record<string, string[]>;
    return planDetails.tasks.reduce<Record<string, string[]>>((acc, task) => {
      const key = task.category ?? 'uncategorised';
      if (!acc[key]) acc[key] = [];
      acc[key].push(task.name);
      return acc;
    }, {});
  }, [planDetails]);

  if (!planDetails) {
    return <p>Plan data unavailable. Create a plan and tasks to compare COAs.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <header>
        <h1>COA Board & Comparison</h1>
        <p style={{ color: '#94a3b8' }}>Drag-and-drop lanes pending. Current view clusters tasks by doctrinal category with quick scoring placeholders.</p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {Object.entries(groupedTasks).map(([category, tasks]) => (
          <article key={category} style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', minHeight: '220px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ marginTop: 0, textTransform: 'capitalize' }}>{category}</h2>
              <span style={{ fontSize: '0.75rem', background: '#0f172a', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>{tasks.length} tasks</span>
            </header>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {tasks.map((task) => (
                <li key={task} style={{ padding: '0.25rem 0', borderBottom: '1px solid #0f172a' }}>
                  {task}
                </li>
              ))}
            </ul>
          </article>
        ))}
        {Object.keys(groupedTasks).length === 0 && <p>No tasks yet to evaluate COAs.</p>}
      </section>

      <section style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
        <h2>Quick Metrics</h2>
        <p style={{ color: '#94a3b8' }}>
          Attach MoE/MoP metrics per COA via backend endpoints. This panel renders aggregated stats once COA data is populated.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <SummaryCard title="Risk (Approved)" value="0" description="Link factor conclusions to RISK artefacts to auto-populate." />
          <SummaryCard title="Constraints" value="0" description="Constraints derived from factor conclusions appear here." />
          <SummaryCard title="Decision Points" value="0" description="Wizarded decision points track upcoming DC/DP triggers." />
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <article style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{value}</p>
      <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{description}</p>
    </article>
  );
}
