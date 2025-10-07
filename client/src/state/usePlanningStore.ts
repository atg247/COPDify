import { create } from 'zustand';

import api from './api';
import { Decision, FactorRow, Phase, Plan, TTL, Task } from './types';

interface Risk {
  id: number;
  title: string;
  description?: string;
  likelihood?: number;
  impact?: number;
}

interface DecisiveCondition {
  id: number;
  name: string;
  description?: string;
  success_criteria?: string;
  moe?: string;
  mop?: string;
}

interface DecisionPoint {
  id: number;
  name: string;
  description?: string;
  trigger_time?: string;
  trigger_event?: string;
}

interface Constraint {
  id: number;
  text: string;
}

interface Assumption {
  id: number;
  text: string;
  validated?: boolean;
}

interface CCIR {
  id: number;
  kind: string;
  text: string;
}

interface PlanDetails {
  phases: Phase[];
  tasks: Task[];
  ttl: TTL[];
  risks: Risk[];
  decisive_conditions: DecisiveCondition[];
  decision_points: DecisionPoint[];
  constraints: Constraint[];
  assumptions: Assumption[];
  ccirs: CCIR[];
}

interface PlanningStore {
  plans: Plan[];
  selectedPlanId?: number;
  planDetails?: PlanDetails;
  factors: FactorRow[];
  decisions: Decision[];
  loading: boolean;
  loadPlans: () => Promise<void>;
  createPlan: (payload: Partial<Plan>) => Promise<void>;
  selectPlan: (planId: number) => Promise<void>;
  createPhase: (payload: { name: string; sequence?: number }) => Promise<void>;
  createTask: (payload: { name: string; phase_id?: number; category?: string }) => Promise<void>;
  createTTL: (payload: { task_id: number; phase_id?: number; start_offset_hours?: number; end_offset_hours?: number }) => Promise<void>;
  loadFactors: () => Promise<void>;
  recordDecision: (payload: { decision_text: string; author?: string }) => Promise<void>;
}

export const usePlanningStore = create<PlanningStore>((set, get) => ({
  plans: [],
  factors: [],
  decisions: [],
  loading: false,
  loadPlans: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get<Plan[]>('/plans/');
      set({ plans: data });
      const { selectedPlanId } = get();
      if (!selectedPlanId && data.length > 0) {
        await get().selectPlan(data[0].id);
      }
    } finally {
      set({ loading: false });
    }
  },
  createPlan: async (payload) => {
    const { data } = await api.post<Plan>('/plans/', payload);
    set((state) => ({ plans: [...state.plans, data] }));
    await get().selectPlan(data.id);
  },
  selectPlan: async (planId) => {
    set({ selectedPlanId: planId });
    const { data } = await api.get(`/plans/${planId}`);
    const planDetails: PlanDetails = {
      phases: data.phases,
      tasks: data.tasks,
      ttl: data.ttl,
      risks: data.risks || [],
      decisive_conditions: data.decisive_conditions || [],
      decision_points: data.decision_points || [],
      constraints: data.constraints || [],
      assumptions: data.assumptions || [],
      ccirs: data.ccirs || [],
    };
    set({ planDetails });
    await get().loadFactors();
    const decisions = await api.get<Decision[]>('/decisions', { params: { plan_id: planId } });
    set({ decisions: decisions.data });
  },
  createPhase: async (payload) => {
    const { selectedPlanId, planDetails } = get();
    if (!selectedPlanId) return;
    const { data } = await api.post(`/plans/${selectedPlanId}/phases`, payload);
    set({ planDetails: { ...(planDetails ?? { phases: [], tasks: [], ttl: [] }), phases: [...(planDetails?.phases ?? []), data] } });
  },
  createTask: async (payload) => {
    const { selectedPlanId, planDetails } = get();
    if (!selectedPlanId) return;
    const { data } = await api.post(`/plans/${selectedPlanId}/tasks`, payload);
    set({ planDetails: { ...(planDetails ?? { phases: [], tasks: [], ttl: [] }), tasks: [...(planDetails?.tasks ?? []), data] } });
  },
  createTTL: async (payload) => {
    const { selectedPlanId, planDetails } = get();
    if (!selectedPlanId) return;
    const { data } = await api.post(`/plans/${selectedPlanId}/ttl`, payload);
    set({ planDetails: { ...(planDetails ?? { phases: [], tasks: [], ttl: [] }), ttl: [...(planDetails?.ttl ?? []), data] } });
  },
  loadFactors: async () => {
    const { selectedPlanId } = get();
    if (!selectedPlanId) return;
    const { data } = await api.get<FactorRow[]>('/factors', { params: { plan_id: selectedPlanId } });
    set({ factors: data });
  },
  recordDecision: async (payload) => {
    const { selectedPlanId } = get();
    if (!selectedPlanId) return;
    const response = await api.post<Decision>('/decisions', { ...payload, plan_id: selectedPlanId });
    set((state) => ({ decisions: [response.data, ...state.decisions] }));
  },
}));
