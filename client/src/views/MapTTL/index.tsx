import { FormEvent, useState } from 'react';

import { usePlanningStore } from '../../state/usePlanningStore';

export default function MapTTLView() {
  const { planDetails, createTTL } = usePlanningStore();
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);
  const [startOffset, setStartOffset] = useState<number>(0);
  const [endOffset, setEndOffset] = useState<number>(24);

  if (!planDetails) {
    return <p>Load or create a plan to manage task–time–location objects.</p>;
  }

  const handleCreateTTL = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedTaskId) return;
    await createTTL({ task_id: selectedTaskId, start_offset_hours: startOffset, end_offset_hours: endOffset });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <section style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', height: '70vh' }}>
        <header style={{ marginBottom: '1rem' }}>
          <h2>Map Workspace</h2>
          <p style={{ color: '#94a3b8' }}>Integrates MapLibre tiles for AO/AI control measures. Placeholder canvas shown.</p>
        </header>
        <div style={{ background: '#0f172a', borderRadius: '8px', height: '100%', border: '1px dashed #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
          Map canvas placeholder (add MapLibre GL integration with offline tiles via assets/tiles).
        </div>
      </section>

      <aside style={{ display: 'grid', gap: '1rem' }}>
        <form onSubmit={handleCreateTTL} style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', display: 'grid', gap: '0.5rem' }}>
          <h3>New TTL</h3>
          <label>
            Task
            <select
              value={selectedTaskId ?? ''}
              onChange={(e) => setSelectedTaskId(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
            >
              <option value="" disabled>
                Pick a task
              </option>
              {planDetails.tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Start offset (h)
            <input
              type="number"
              value={startOffset}
              onChange={(e) => setStartOffset(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
            />
          </label>
          <label>
            End offset (h)
            <input
              type="number"
              value={endOffset}
              onChange={(e) => setEndOffset(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
            />
          </label>
          <button type="submit">Create TTL</button>
        </form>

        <section style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
          <h3>TTL List</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th>Task</th>
                <th>Window</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {planDetails.ttl.map((ttl) => {
                const task = planDetails.tasks.find((t) => t.id === ttl.task_id);
                return (
                  <tr key={ttl.id} style={{ borderBottom: '1px solid #0f172a' }}>
                    <td>{task?.name ?? `Task ${ttl.task_id}`}</td>
                    <td>
                      {ttl.relative_to} +{ttl.start_offset_hours ?? '-'}h ? +{ttl.end_offset_hours ?? '-'}h
                    </td>
                    <td>{ttl.status}</td>
                  </tr>
                );
              })}
              {planDetails.ttl.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                    No TTL objects created.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </aside>
    </div>
  );
}
