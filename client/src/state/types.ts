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
