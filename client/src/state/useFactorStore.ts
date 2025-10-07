import { create } from 'zustand';
import api from './api';
import { Factor, FactorDeduction, FactorConclusion, ConclusionLink } from './types';

interface FactorStore {
  factors: Factor[];
  selectedFactorId?: number;
  deductions: Record<number, FactorDeduction[]>; // keyed by factor_id
  conclusions: Record<number, FactorConclusion[]>; // keyed by factor_id
  loading: boolean;

  // Actions
  loadFactors: (planId: number) => Promise<void>;
  createFactor: (payload: Partial<Factor>) => Promise<Factor>;
  selectFactor: (factorId: number) => Promise<void>;

  createDeduction: (factorId: number, payload: Partial<FactorDeduction>) => Promise<FactorDeduction>;

  createConclusion: (factorId: number, payload: Partial<FactorConclusion>) => Promise<FactorConclusion>;
  updateConclusionStatus: (conclusionId: number, status: string) => Promise<void>;

  linkConclusion: (conclusionId: number, payload: { target_kind: string; target_id?: number; create_payload?: any }) => Promise<ConclusionLink>;

  deleteFactor: (factorId: number) => Promise<void>;
  deleteDeduction: (deductionId: number) => Promise<void>;
  deleteConclusion: (conclusionId: number) => Promise<void>;

  clearFactors: () => void;
}

export const useFactorStore = create<FactorStore>((set, get) => ({
  factors: [],
  deductions: {},
  conclusions: {},
  loading: false,

  loadFactors: async (planId: number) => {
    set({ loading: true });
    try {
      const { data: factors } = await api.get<Factor[]>(`/factors`, { params: { plan_id: planId } });

      const deductions: Record<number, FactorDeduction[]> = {};
      const conclusions: Record<number, FactorConclusion[]> = {};

      // Fetch full details for each factor
      for (const factor of factors) {
        try {
          const { data: fullFactor } = await api.get<{
            factor: Factor;
            deductions: FactorDeduction[];
            conclusions: FactorConclusion[];
          }>(`/factors/${factor.id}/full`);

          deductions[factor.id] = fullFactor.deductions;
          conclusions[factor.id] = fullFactor.conclusions;
        } catch (err) {
          console.error(`Failed to load details for factor ${factor.id}:`, err);
          deductions[factor.id] = [];
          conclusions[factor.id] = [];
        }
      }

      set({ factors, deductions, conclusions });
    } finally {
      set({ loading: false });
    }
  },

  createFactor: async (payload) => {
    const { data } = await api.post<Factor>('/factors/', payload);
    set((state) => ({
      factors: [...state.factors, data],
      deductions: { ...state.deductions, [data.id]: [] },
      conclusions: { ...state.conclusions, [data.id]: [] }
    }));
    return data;
  },

  selectFactor: async (factorId: number) => {
    set({ selectedFactorId: factorId });
    // Could load additional details here if needed
  },

  createDeduction: async (factorId: number, payload) => {
    const { data } = await api.post<FactorDeduction>(`/factors/${factorId}/deductions`, payload);
    set((state) => ({
      deductions: {
        ...state.deductions,
        [factorId]: [...(state.deductions[factorId] || []), data]
      }
    }));
    return data;
  },

  createConclusion: async (factorId: number, payload) => {
    const { data } = await api.post<FactorConclusion>(`/factors/${factorId}/conclusions`, payload);
    set((state) => ({
      conclusions: {
        ...state.conclusions,
        [factorId]: [...(state.conclusions[factorId] || []), data]
      }
    }));
    return data;
  },

  updateConclusionStatus: async (conclusionId: number, status: string) => {
    try {
      const { data } = await api.post<FactorConclusion>(`/factors/conclusions/${conclusionId}/status`, { status });

      // Update the conclusion in state
      set((state) => {
        const newConclusions = { ...state.conclusions };
        for (const factorId in newConclusions) {
          const index = newConclusions[factorId].findIndex(c => c.id === conclusionId);
          if (index !== -1) {
            newConclusions[factorId] = [
              ...newConclusions[factorId].slice(0, index),
              data,
              ...newConclusions[factorId].slice(index + 1)
            ];
            break;
          }
        }
        return { conclusions: newConclusions };
      });
    } catch (error: any) {
      // Show error message to user
      const message = error.response?.data?.detail || 'Failed to update conclusion status';
      alert(message);
      throw error;
    }
  },

  linkConclusion: async (conclusionId: number, payload) => {
    const { data } = await api.post<ConclusionLink>(`/factors/conclusions/${conclusionId}/links`, payload);

    // Update the conclusion to mark it as having links
    set((state) => {
      const newConclusions = { ...state.conclusions };
      for (const factorId in newConclusions) {
        const index = newConclusions[factorId].findIndex(c => c.id === conclusionId);
        if (index !== -1) {
          newConclusions[factorId] = [
            ...newConclusions[factorId].slice(0, index),
            { ...newConclusions[factorId][index], has_links: true },
            ...newConclusions[factorId].slice(index + 1)
          ];
          break;
        }
      }
      return { conclusions: newConclusions };
    });

    return data;
  },

  deleteFactor: async (factorId: number) => {
    await api.delete(`/factors/${factorId}`);
    set((state) => {
      const newDeductions = { ...state.deductions };
      const newConclusions = { ...state.conclusions };
      delete newDeductions[factorId];
      delete newConclusions[factorId];
      return {
        factors: state.factors.filter(f => f.id !== factorId),
        deductions: newDeductions,
        conclusions: newConclusions
      };
    });
  },

  deleteDeduction: async (deductionId: number) => {
    await api.delete(`/factors/deductions/${deductionId}`);
    set((state) => {
      const newDeductions = { ...state.deductions };
      const newConclusions = { ...state.conclusions };

      // Find and remove the deduction
      for (const factorId in newDeductions) {
        newDeductions[factorId] = newDeductions[factorId].filter(d => d.id !== deductionId);
        // Also remove conclusions that belonged to this deduction
        newConclusions[factorId] = newConclusions[factorId].filter(c => c.deduction_id !== deductionId);
      }

      return { deductions: newDeductions, conclusions: newConclusions };
    });
  },

  deleteConclusion: async (conclusionId: number) => {
    await api.delete(`/factors/conclusions/${conclusionId}`);
    set((state) => {
      const newConclusions = { ...state.conclusions };

      // Find and remove the conclusion
      for (const factorId in newConclusions) {
        newConclusions[factorId] = newConclusions[factorId].filter(c => c.id !== conclusionId);
      }

      return { conclusions: newConclusions };
    });
  },

  clearFactors: () => {
    set({ factors: [], deductions: {}, conclusions: {}, selectedFactorId: undefined });
  },
}));
