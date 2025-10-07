import { FormEvent, useState, useEffect } from 'react';
import { useFactorStore } from '../../state/useFactorStore';
import { FactorConclusion } from '../../state/types';
import api from '../../state/api';

interface LinkModalProps {
  conclusion: FactorConclusion;
  onClose: () => void;
}

interface TraceLink {
  kind: string;
  target_id?: number;
  summary?: string;
}

export default function LinkModal({ conclusion, onClose }: LinkModalProps) {
  const { linkConclusion } = useFactorStore();
  const [taskName, setTaskName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingLinks, setExistingLinks] = useState<TraceLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch existing links via trace endpoint
    api.get(`/factors/conclusions/${conclusion.id}/trace`)
      .then(({ data }) => {
        setExistingLinks(data.linked_entities || []);
      })
      .catch(err => {
        console.error('Failed to load links:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [conclusion.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    setIsSubmitting(true);
    try {
      await linkConclusion(conclusion.id, {
        target_kind: 'task',
        create_payload: {
          name: taskName,
          description: conclusion.text,
          category: 'implied',
          priority: conclusion.priority || 2
        }
      });

      // Reload links after creating
      const { data } = await api.get(`/factors/conclusions/${conclusion.id}/trace`);
      setExistingLinks(data.linked_entities || []);
      setTaskName(''); // Clear form
    } catch (err) {
      console.error('Failed to create link:', err);
      alert('Failed to create link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '8px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>Link Conclusion to Artefact</h2>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          Type: <strong>{conclusion.type}</strong><br />
          Text: {conclusion.text}
        </p>

        {/* Existing Links Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: 600 }}>
            Existing Links ({existingLinks.length})
          </h3>
          {loading ? (
            <div style={{ padding: '1rem', background: '#0f172a', borderRadius: '4px', color: '#64748b', textAlign: 'center' }}>
              Loading links...
            </div>
          ) : existingLinks.length === 0 ? (
            <div style={{ padding: '1rem', background: '#0f172a', borderRadius: '4px', color: '#64748b', textAlign: 'center' }}>
              No links yet. Create one below.
            </div>
          ) : (
            <div style={{ background: '#0f172a', borderRadius: '4px', padding: '0.5rem' }}>
              {existingLinks.map((link, idx) => (
                <div key={idx} style={{ padding: '0.5rem', borderBottom: idx < existingLinks.length - 1 ? '1px solid #334155' : 'none' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      background: '#1e40af',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: '#bfdbfe',
                      textTransform: 'uppercase'
                    }}>
                      {link.kind}
                    </span>
                    <span style={{ color: '#e2e8f0', fontSize: '0.875rem', flex: 1 }}>
                      {link.summary || `ID: ${link.target_id}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create New Link Section */}
        <div>
          <h3 style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: 600 }}>
            Create New Link
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                Task Name *
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Enter task name..."
                required
                style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {existingLinks.length > 0 ? 'Close' : 'Cancel'}
              </button>
              <button type="submit" disabled={isSubmitting} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {isSubmitting ? 'Creating...' : 'Create & Link Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
