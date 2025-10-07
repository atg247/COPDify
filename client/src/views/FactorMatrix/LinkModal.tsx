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
  const [targetType, setTargetType] = useState('task');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    text: '',
    title: '',
    actor_name: '',
    cog_type: 'critical_capability',
    kind: 'CCIR',
    success_criteria: '',
    moe: '',
    mop: '',
    trigger_time: '',
    trigger_event: '',
  });
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

    setIsSubmitting(true);
    try {
      let create_payload: any = {};

      switch (targetType) {
        case 'task':
          if (!formData.name.trim()) {
            alert('Task name is required');
            return;
          }
          create_payload = {
            name: formData.name,
            description: formData.description || conclusion.text,
            category: 'implied',
            priority: conclusion.priority || 2
          };
          break;

        case 'risk':
          if (!formData.title.trim()) {
            alert('Risk title is required');
            return;
          }
          create_payload = {
            title: formData.title,
            description: formData.description || conclusion.text,
            likelihood: 3,
            impact: 3
          };
          break;

        case 'constraint':
          if (!formData.text.trim()) {
            alert('Constraint text is required');
            return;
          }
          create_payload = {
            text: formData.text
          };
          break;

        case 'assumption':
          if (!formData.text.trim()) {
            alert('Assumption text is required');
            return;
          }
          create_payload = {
            text: formData.text,
            validated: false
          };
          break;

        case 'decisive_condition':
          if (!formData.name.trim()) {
            alert('Decisive Condition name is required');
            return;
          }
          create_payload = {
            name: formData.name,
            description: formData.description,
            success_criteria: formData.success_criteria,
            moe: formData.moe,
            mop: formData.mop
          };
          break;

        case 'decision_point':
          if (!formData.name.trim()) {
            alert('Decision Point name is required');
            return;
          }
          create_payload = {
            name: formData.name,
            description: formData.description,
            trigger_time: formData.trigger_time,
            trigger_event: formData.trigger_event
          };
          break;

        case 'ccir':
          if (!formData.text.trim()) {
            alert('CCIR text is required');
            return;
          }
          create_payload = {
            kind: formData.kind,
            text: formData.text
          };
          break;

        case 'cog_item':
          if (!formData.actor_name.trim()) {
            alert('Actor name is required');
            return;
          }
          create_payload = {
            actor_name: formData.actor_name,
            cog_type: formData.cog_type,
            description: formData.description || conclusion.text
          };
          break;

        default:
          alert('Unknown target type');
          return;
      }

      await linkConclusion(conclusion.id, {
        target_kind: targetType,
        create_payload
      });

      // Reload links after creating
      const { data } = await api.get(`/factors/conclusions/${conclusion.id}/trace`);
      setExistingLinks(data.linked_entities || []);

      // Clear form
      setFormData({
        name: '',
        description: '',
        text: '',
        title: '',
        actor_name: '',
        cog_type: 'critical_capability',
        kind: 'CCIR',
        success_criteria: '',
        moe: '',
        mop: '',
        trigger_time: '',
        trigger_event: '',
      });
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
            {/* Artefact Type Selector */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                Artefact Type *
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
              >
                <option value="task">Task</option>
                <option value="risk">Risk</option>
                <option value="constraint">Constraint</option>
                <option value="assumption">Assumption</option>
                <option value="decisive_condition">Decisive Condition (DC)</option>
                <option value="decision_point">Decision Point (DP)</option>
                <option value="ccir">CCIR</option>
                <option value="cog_item">COG Item</option>
              </select>
            </div>

            {/* Dynamic Form Fields Based on Type */}
            {targetType === 'task' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    Task Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter task name..."
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description (defaults to conclusion text)"
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
              </>
            )}

            {targetType === 'risk' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    Risk Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter risk title..."
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description (defaults to conclusion text)"
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
              </>
            )}

            {(targetType === 'constraint' || targetType === 'assumption') && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                  {targetType === 'constraint' ? 'Constraint' : 'Assumption'} Text *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder={`Enter ${targetType} text...`}
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                />
              </div>
            )}

            {targetType === 'decisive_condition' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    DC Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Enemy air defense suppressed"
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    Success Criteria
                  </label>
                  <input
                    type="text"
                    value={formData.success_criteria}
                    onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
                    placeholder="What defines success?"
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                      MOE
                    </label>
                    <input
                      type="text"
                      value={formData.moe}
                      onChange={(e) => setFormData({ ...formData, moe: e.target.value })}
                      placeholder="Measure of Effectiveness"
                      style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                      MOP
                    </label>
                    <input
                      type="text"
                      value={formData.mop}
                      onChange={(e) => setFormData({ ...formData, mop: e.target.value })}
                      placeholder="Measure of Performance"
                      style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                    />
                  </div>
                </div>
              </>
            )}

            {targetType === 'decision_point' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    DP Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Commit reserve forces"
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    Trigger (Time)
                  </label>
                  <input
                    type="text"
                    value={formData.trigger_time}
                    onChange={(e) => setFormData({ ...formData, trigger_time: e.target.value })}
                    placeholder="e.g., D+3, H+6"
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    Trigger (Event)
                  </label>
                  <input
                    type="text"
                    value={formData.trigger_event}
                    onChange={(e) => setFormData({ ...formData, trigger_event: e.target.value })}
                    placeholder="e.g., Enemy crosses Phase Line Blue"
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
              </>
            )}

            {targetType === 'ccir' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    CCIR Type *
                  </label>
                  <select
                    value={formData.kind}
                    onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  >
                    <option value="CCIR">CCIR (Commander's Critical Information Requirement)</option>
                    <option value="PIR">PIR (Priority Intelligence Requirement)</option>
                    <option value="FFIR">FFIR (Friendly Force Information Requirement)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    CCIR Text *
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="What information is critical?"
                    rows={3}
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
              </>
            )}

            {targetType === 'cog_item' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    Actor Name *
                  </label>
                  <input
                    type="text"
                    value={formData.actor_name}
                    onChange={(e) => setFormData({ ...formData, actor_name: e.target.value })}
                    placeholder="e.g., Enemy 1st Brigade, Friendly Forces"
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    COG Type *
                  </label>
                  <select
                    value={formData.cog_type}
                    onChange={(e) => setFormData({ ...formData, cog_type: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  >
                    <option value="critical_capability">Critical Capability</option>
                    <option value="critical_requirement">Critical Requirement</option>
                    <option value="critical_vulnerability">Critical Vulnerability</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description (defaults to conclusion text)"
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {existingLinks.length > 0 ? 'Close' : 'Cancel'}
              </button>
              <button type="submit" disabled={isSubmitting} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {isSubmitting ? 'Creating...' : `Create & Link ${targetType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
