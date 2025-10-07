import { useEffect, useState } from 'react';
import { usePlanningStore } from '../../state/usePlanningStore';
import { useFactorStore } from '../../state/useFactorStore';
import { Factor, FactorDeduction, FactorConclusion } from '../../state/types';
import FactorForm from './FactorForm';
import DeductionForm from './DeductionForm';
import ConclusionForm from './ConclusionForm';
import LinkModal from './LinkModal';

export default function FactorMatrixView() {
  const { selectedPlanId } = usePlanningStore();
  const {
    factors,
    deductions,
    conclusions,
    loading,
    loadFactors,
    updateConclusionStatus,
    deleteFactor,
    deleteDeduction,
    deleteConclusion
  } = useFactorStore();

  const [showFactorForm, setShowFactorForm] = useState(false);
  const [showDeductionForm, setShowDeductionForm] = useState<number | null>(null);
  const [showConclusionForm, setShowConclusionForm] = useState<{ factorId: number; deductionId: number } | null>(null);
  const [showLinkModal, setShowLinkModal] = useState<FactorConclusion | null>(null);

  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (selectedPlanId) {
      loadFactors(selectedPlanId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanId]);

  if (!selectedPlanId) {
    return <p>Select a plan to view Factor Analysis</p>;
  }

  const filteredFactors = factors.filter(factor => {
    if (domainFilter !== 'ALL' && factor.domain !== domainFilter) return false;
    return true;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-600';
      case 'REVIEWED': return 'bg-yellow-600';
      case 'APPROVED': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const domains = ['ALL', 'POL', 'MIL', 'ECO', 'SOC', 'INF', 'INFRA', 'NATENV', 'LEGAL', 'OTHER'];

  return (
    <div style={{ display: 'grid', gap: '1rem', padding: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>Factor Analysis Matrix</h1>
          <p style={{ margin: '0.25rem 0', color: '#94a3b8' }}>
            Factor → Deduction → Conclusion lineage powers tasks, DCs, and commander decisions.
          </p>
        </div>
        <button
          onClick={() => setShowFactorForm(true)}
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Add Factor
        </button>
      </header>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#1e293b', borderRadius: '8px' }}>
        <div>
          <label style={{ marginRight: '0.5rem', color: '#94a3b8' }}>Domain:</label>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              background: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: '4px'
            }}
          >
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={{ marginRight: '0.5rem', color: '#94a3b8' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              background: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: '4px'
            }}
          >
            <option value="ALL">ALL</option>
            <option value="DRAFT">DRAFT</option>
            <option value="REVIEWED">REVIEWED</option>
            <option value="APPROVED">APPROVED</option>
          </select>
        </div>
        <div style={{ marginLeft: 'auto', color: '#94a3b8' }}>
          {filteredFactors.length} factor{filteredFactors.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Factor Matrix Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading factors...</div>
      ) : filteredFactors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', background: '#1e293b', borderRadius: '8px' }}>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>No factors captured yet.</p>
          <button
            onClick={() => setShowFactorForm(true)}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Create First Factor
          </button>
        </div>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1e293b', borderRadius: '8px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #334155' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Factor</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Deduction</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Conclusion</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Link</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Owner</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFactors.map((factor) => {
                const factorDeductions = deductions[factor.id] || [];
                const factorConclusions = conclusions[factor.id] || [];

                // If no deductions yet, show add deduction button
                if (factorDeductions.length === 0) {
                  return (
                    <tr key={`factor-${factor.id}`} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '0.75rem', verticalAlign: 'top' }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#f1f5f9' }}>{factor.title}</div>
                          <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                            <span style={{ background: '#334155', padding: '0.125rem 0.5rem', borderRadius: '4px', marginRight: '0.5rem', color: '#e2e8f0' }}>
                              {factor.domain}
                            </span>
                            {factor.description}
                          </div>
                        </div>
                      </td>
                      <td colSpan={6} style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b' }}>
                        <button
                          onClick={() => setShowDeductionForm(factor.id)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: '#334155',
                            color: '#e2e8f0',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          + Add Deduction
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            if (confirm('Delete this factor and all its deductions/conclusions?')) {
                              deleteFactor(factor.id);
                            }
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: 'transparent',
                            color: '#ef4444',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem'
                          }}
                          title="Delete factor"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                }

                return factorDeductions.flatMap((deduction, dedIndex) => {
                  const dedConclusions = factorConclusions.filter(c => c.deduction_id === deduction.id);

                  if (dedConclusions.length === 0) {
                    return (
                      <tr key={`ded-${deduction.id}`} style={{ borderBottom: '1px solid #334155' }}>
                        {dedIndex === 0 && (
                          <td style={{ padding: '0.75rem', verticalAlign: 'top', borderRight: '1px solid #334155' }} rowSpan={factorDeductions.length}>
                            <div>
                              <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#f1f5f9' }}>{factor.title}</div>
                              <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                                <span style={{ background: '#334155', padding: '0.125rem 0.5rem', borderRadius: '4px', marginRight: '0.5rem', color: '#e2e8f0' }}>
                                  {factor.domain}
                                </span>
                                {factor.description}
                              </div>
                            </div>
                          </td>
                        )}
                        <td style={{ padding: '0.75rem', color: '#e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ flex: 1 }}>{deduction.text}</span>
                            <button
                              onClick={() => {
                                if (confirm('Delete this deduction and all its conclusions?')) {
                                  deleteDeduction(deduction.id);
                                }
                              }}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: 'transparent',
                                color: '#ef4444',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                              title="Delete deduction"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                        <td colSpan={5} style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b' }}>
                          <button
                            onClick={() => setShowConclusionForm({ factorId: factor.id, deductionId: deduction.id })}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: '#334155',
                              color: '#e2e8f0',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            + Add Conclusion
                          </button>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {dedIndex === 0 && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this factor and all its deductions/conclusions?')) {
                                  deleteFactor(factor.id);
                                }
                              }}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: 'transparent',
                                color: '#ef4444',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem'
                              }}
                              title="Delete factor"
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }

                  return dedConclusions.map((conclusion, conIndex) => (
                    <tr key={`con-${conclusion.id}`} style={{ borderBottom: '1px solid #334155' }}>
                      {dedIndex === 0 && conIndex === 0 && (
                        <td style={{ padding: '0.75rem', verticalAlign: 'top', borderRight: '1px solid #334155' }} rowSpan={factorDeductions.reduce((sum, d) => sum + Math.max(1, factorConclusions.filter(c => c.deduction_id === d.id).length), 0)}>
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#f1f5f9' }}>{factor.title}</div>
                            <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                              <span style={{ background: '#334155', padding: '0.125rem 0.5rem', borderRadius: '4px', marginRight: '0.5rem', color: '#e2e8f0' }}>
                                {factor.domain}
                              </span>
                              {factor.description}
                            </div>
                          </div>
                        </td>
                      )}
                      {conIndex === 0 && (
                        <td style={{ padding: '0.75rem', verticalAlign: 'top', borderRight: '1px solid #334155', color: '#e2e8f0' }} rowSpan={Math.max(1, dedConclusions.length)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ flex: 1 }}>{deduction.text}</span>
                            <button
                              onClick={() => {
                                if (confirm('Delete this deduction and all its conclusions?')) {
                                  deleteDeduction(deduction.id);
                                }
                              }}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: 'transparent',
                                color: '#ef4444',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                              title="Delete deduction"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                      <td style={{ padding: '0.75rem', color: '#f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ flex: 1 }}>{conclusion.text}</span>
                          <button
                            onClick={() => {
                              if (confirm('Delete this conclusion?')) {
                                deleteConclusion(conclusion.id);
                              }
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: 'transparent',
                              color: '#ef4444',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                            title="Delete conclusion"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ background: '#1e40af', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: '#bfdbfe' }}>
                          {conclusion.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => setShowLinkModal(conclusion)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: conclusion.has_links ? '#1e40af' : '#0f172a',
                            color: conclusion.has_links ? '#bfdbfe' : '#60a5fa',
                            border: '1px solid #334155',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title={conclusion.has_links ? 'View/add links' : 'Create link'}
                        >
                          {conclusion.has_links ? '🔗 Linked' : 'Link'}
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ position: 'relative' }} title={!conclusion.has_links ? 'Link to an artefact before approving' : ''}>
                          <select
                            value={conclusion.status}
                            onChange={(e) => {
                              if (e.target.value === 'APPROVED' && !conclusion.has_links) {
                                alert('Cannot approve a conclusion without at least one link. Please link to a task, risk, DC, DP, or other artefact first.');
                                return;
                              }
                              updateConclusionStatus(conclusion.id, e.target.value);
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#0f172a',
                              color: '#e2e8f0',
                              border: '1px solid #334155',
                              borderRadius: '4px',
                              fontSize: '0.75rem'
                            }}
                            className={getStatusBadgeClass(conclusion.status)}
                          >
                            <option value="DRAFT">DRAFT</option>
                            <option value="REVIEWED">REVIEWED</option>
                            <option value="APPROVED" disabled={!conclusion.has_links}>
                              APPROVED {!conclusion.has_links ? '(needs link)' : ''}
                            </option>
                          </select>
                          {!conclusion.has_links && conclusion.status !== 'APPROVED' && (
                            <span style={{
                              position: 'absolute',
                              right: '-20px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              fontSize: '0.875rem',
                              color: '#fbbf24'
                            }} title="Link required before approval">
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>{conclusion.owner || '-'}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                          <button
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: 'transparent',
                              color: '#64748b',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                            title="View trace"
                          >
                            🔍
                          </button>
                          {dedIndex === 0 && conIndex === 0 && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this factor and all its deductions/conclusions?')) {
                                  deleteFactor(factor.id);
                                }
                              }}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: 'transparent',
                                color: '#ef4444',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem'
                              }}
                              title="Delete factor"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ));
                });
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Forms and Modals */}
      {showFactorForm && (
        <FactorForm
          planId={selectedPlanId}
          onClose={() => setShowFactorForm(false)}
        />
      )}

      {showDeductionForm && (
        <DeductionForm
          factorId={showDeductionForm}
          onClose={() => setShowDeductionForm(null)}
        />
      )}

      {showConclusionForm && (
        <ConclusionForm
          factorId={showConclusionForm.factorId}
          deductionId={showConclusionForm.deductionId}
          onClose={() => setShowConclusionForm(null)}
        />
      )}

      {showLinkModal && (
        <LinkModal
          conclusion={showLinkModal}
          onClose={() => setShowLinkModal(null)}
        />
      )}
    </div>
  );
}
