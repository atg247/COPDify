export interface Plan {
  id: number;
  name: string;
  description?: string;
  scope?: string;
  theater?: string;
}

export interface Phase {
  id: number;
  name: string;
  sequence: number;
  objectives?: string;
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  category: string;
  phase_id?: number;
}

export interface TTL {
  id: number;
  task_id: number;
  phase_id?: number;
  area_id?: number;
  coa_id?: number;
  start_offset_hours?: number;
  end_offset_hours?: number;
  relative_to?: string;
  status: string;
}

export interface Factor {
  id: number;
  plan_id: number;
  phase_id?: number;
  coa_id?: number;
  title: string;
  description?: string;
  domain: string;
  source_ref?: string;
  confidence?: number;
  created_by?: string;
  created_at: string;
}

export interface FactorDeduction {
  id: number;
  factor_id: number;
  text: string;
  confidence?: number;
  created_at: string;
}

export interface FactorConclusion {
  id: number;
  factor_id: number;
  deduction_id: number;
  type: string;
  text: string;
  priority?: number;
  status: 'DRAFT' | 'REVIEWED' | 'APPROVED';
  owner?: string;
  created_at: string;
  has_links?: boolean;
}

export interface ConclusionLink {
  id: number;
  conclusion_id: number;
  target_kind: string;
  target_id?: number;
}

export interface FactorMatrixRow {
  factor: Factor;
  deduction?: FactorDeduction;
  conclusion?: FactorConclusion;
  links?: ConclusionLink[];
}

// Legacy type for backward compatibility
export interface FactorRow {
  id: number;
  title: string;
  domain: string;
  description?: string;
}

export interface Decision {
  id: number;
  decision_text: string;
  author?: string;
  created_at: string;
}
