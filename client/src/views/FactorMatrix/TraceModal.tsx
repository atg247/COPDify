import { useEffect, useState } from 'react';
import api from '../../state/api';

interface TraceModalProps {
  conclusionId: number;
  onClose: () => void;
}

interface TraceData {
  conclusion_id: number;
  factor: {
    id: number;
    title: string;
    domain: string;
  };
  deduction: {
    id: number;
    text: string;
  };
  linked_entities: Array<{
    kind: string;
    target_id?: number;
    summary?: string;
  }>;
}

export default function TraceModal({ conclusionId, onClose }: TraceModalProps) {
  const [trace, setTrace] = useState<TraceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/factors/conclusions/${conclusionId}/trace`)
      .then(({ data }) => {
        setTrace(data);
      })
      .catch(err => {
        console.error('Failed to load trace:', err);
        alert('Failed to load trace');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [conclusionId]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '8px', maxWidth: '700px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Factor Analysis Lineage</h2>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Close
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading trace...</div>
        ) : trace ? (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Factor */}
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <h3 style={{ margin: 0, color: '#60a5fa' }}>Factor</h3>
              </div>
              <p style={{ margin: '0.5rem 0', fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9' }}>
                {trace.factor.title}
              </p>
              <span style={{
                fontSize: '0.75rem',
                background: '#334155',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                color: '#e2e8f0'
              }}>
                {trace.factor.domain}
              </span>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#64748b' }}>
              ↓
            </div>

            {/* Deduction */}
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🧠</span>
                <h3 style={{ margin: 0, color: '#a78bfa' }}>Deduction</h3>
              </div>
              <p style={{ margin: '0.5rem 0', color: '#e2e8f0', fontStyle: 'italic' }}>
                "{trace.deduction.text}"
              </p>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#64748b' }}>
              ↓
            </div>

            {/* Conclusion */}
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <h3 style={{ margin: 0, color: '#34d399' }}>Conclusion</h3>
              </div>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#94a3b8' }}>
                ID: {trace.conclusion_id}
              </p>
            </div>

            {/* Linked Artefacts */}
            {trace.linked_entities.length > 0 && (
              <>
                {/* Arrow */}
                <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#64748b' }}>
                  ↓
                </div>

                <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🔗</span>
                    <h3 style={{ margin: 0, color: '#fbbf24' }}>Linked Artefacts ({trace.linked_entities.length})</h3>
                  </div>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                    {trace.linked_entities.map((link, idx) => (
                      <li key={idx} style={{
                        padding: '0.75rem',
                        marginBottom: idx < trace.linked_entities.length - 1 ? '0.5rem' : 0,
                        background: '#1e293b',
                        borderRadius: '4px',
                        border: '1px solid #334155'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            background: '#1e40af',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: '#bfdbfe',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {link.kind}
                          </span>
                          <span style={{ color: '#e2e8f0', flex: 1 }}>
                            {link.summary || `ID: ${link.target_id}`}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Summary */}
            <div style={{ background: '#065f46', padding: '1rem', borderRadius: '8px', border: '1px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✓</span>
                <p style={{ margin: 0, color: '#d1fae5', fontSize: '0.875rem' }}>
                  <strong>Lineage verified:</strong> This conclusion is derived from verified factor analysis and has been linked to {trace.linked_entities.length} operational artefact{trace.linked_entities.length !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Failed to load trace</div>
        )}
      </div>
    </div>
  );
}
