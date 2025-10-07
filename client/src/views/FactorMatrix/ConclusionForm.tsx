import { FormEvent, useState } from 'react';
import { useFactorStore } from '../../state/useFactorStore';

interface ConclusionFormProps {
  factorId: number;
  deductionId: number;
  onClose: () => void;
}

export default function ConclusionForm({ factorId, deductionId, onClose }: ConclusionFormProps) {
  const { createConclusion } = useFactorStore();

  const [text, setText] = useState('');
  const [type, setType] = useState('TASK');
  const [priority, setPriority] = useState(2);
  const [owner, setOwner] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    await createConclusion(factorId, {
      deduction_id: deductionId,
      type,
      text,
      priority,
      owner
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '8px', maxWidth: '600px', width: '100%' }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>Add Conclusion</h2>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          What should be done? This becomes a planning artefact.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Conclusion Type *
            </label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}>
              <option value="TASK">Task</option>
              <option value="RISK">Risk</option>
              <option value="CONSTRAINT">Constraint</option>
              <option value="ASSUMPTION">Assumption</option>
              <option value="DC">Decisive Condition</option>
              <option value="DP">Decision Point</option>
              <option value="CCIR">CCIR (PIR/EEFI/FFIR)</option>
              <option value="COG">COG Element</option>
              <option value="SYNC">Sync Requirement</option>
              <option value="INFO">Info Requirement</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Conclusion Text *
            </label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g., Conduct reconnaissance of northern sector to confirm enemy strength" required rows={3} style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>Priority</label>
              <input type="number" min="1" max="5" value={priority} onChange={(e) => setPriority(parseInt(e.target.value))} style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>Owner</label>
              <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g., S3" style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create Conclusion</button>
          </div>
        </form>
      </div>
    </div>
  );
}
