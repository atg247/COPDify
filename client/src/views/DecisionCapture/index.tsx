import { FormEvent, useState } from 'react';

import { usePlanningStore } from '../../state/usePlanningStore';

export default function DecisionCaptureView() {
  const { selectedPlanId, recordDecision, decisions } = usePlanningStore();
  const [decisionText, setDecisionText] = useState('');
  const [author, setAuthor] = useState('');

  if (!selectedPlanId) {
    return <p>Select a plan to capture commander decisions.</p>;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!decisionText.trim()) return;
    await recordDecision({ decision_text: decisionText, author });
    setDecisionText('');
    setAuthor('');
  };

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
        <h2>Decision Capture</h2>
        <p style={{ color: '#94a3b8' }}>Keep CPM-lite traceability by linking key commander decisions to plan artefacts.</p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          <textarea
            value={decisionText}
            onChange={(e) => setDecisionText(e.target.value)}
            placeholder="Decision rationale, assumptions, constraints"
            rows={4}
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
          />
          <button type="submit">Record Decision</button>
        </form>
      </section>

      <section style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
        <h3>Decision Log</h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {decisions.map((decision) => (
            <li key={decision.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #0f172a', paddingBottom: '1rem' }}>
              <p>{decision.decision_text}</p>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                {decision.author || 'Unknown'} • {new Date(decision.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {decisions.length === 0 && <p>No decisions captured yet.</p>}
        </ul>
      </section>
    </div>
  );
}
