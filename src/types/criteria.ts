export type CriteriaKind = "EXPERIENCE" | "PROJECT" | "EDUCATION";

export interface Criteria {
  id: number;
  name: string;
  kind: CriteriaKind;
  isActive: boolean;
}

export type CriteriaListResponse = Criteria[];
