import { FormEvent, useState } from 'react';
import { useFactorStore } from '../../state/useFactorStore';

interface DeductionFormProps {
  factorId: number;
  onClose: () => void;
}

export default function DeductionForm({ factorId, onClose }: DeductionFormProps) {
  const { createDeduction } = useFactorStore();

  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState(0.8);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    await createDeduction(factorId, { text, confidence });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1e293b',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>Add Deduction</h2>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          What is the implication of this factor? So what?
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Deduction Text *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Enemy force composition suggests defensive intent. Northern approach will be heavily contested."
              required
              rows={4}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '4px',
                color: '#e2e8f0',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Confidence (0-1)
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '4px',
                color: '#e2e8f0'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                background: '#334155',
                color: '#e2e8f0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add Deduction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
