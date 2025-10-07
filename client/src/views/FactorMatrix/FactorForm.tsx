import { FormEvent, useState } from 'react';
import { useFactorStore } from '../../state/useFactorStore';

interface FactorFormProps {
  planId: number;
  onClose: () => void;
}

export default function FactorForm({ planId, onClose }: FactorFormProps) {
  const { createFactor } = useFactorStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('MIL');
  const [sourceRef, setSourceRef] = useState('');
  const [confidence, setConfidence] = useState(0.8);
  const [createdBy, setCreatedBy] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createFactor({
      plan_id: planId,
      title,
      description,
      domain,
      source_ref: sourceRef,
      confidence,
      created_by: createdBy
    });

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
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>Add Factor</h2>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          A factor is a verifiable fact with operational impact. What is the current state or trend?
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Enemy Brigade deploying to northern sector"
              required
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

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed observation or intelligence..."
              rows={3}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                Domain (PMESII)
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  color: '#e2e8f0'
                }}
              >
                <option value="POL">Political</option>
                <option value="MIL">Military</option>
                <option value="ECO">Economic</option>
                <option value="SOC">Social</option>
                <option value="INF">Information</option>
                <option value="INFRA">Infrastructure</option>
                <option value="NATENV">Natural Environment</option>
                <option value="LEGAL">Legal</option>
                <option value="OTHER">Other</option>
              </select>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                Source Reference
              </label>
              <input
                type="text"
                value={sourceRef}
                onChange={(e) => setSourceRef(e.target.value)}
                placeholder="e.g., INTSUM-2024-045"
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

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                Created By
              </label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="e.g., S2 Analyst"
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
              Create Factor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
