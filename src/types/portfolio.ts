// Portfolio Block Types
export type BlockType = "INTRO" | "SKILL" | "EDUCATION" | "EXPERIMENT" | "PROJECT" | "AWARD" | "ACTIVITIES" | "REFERENCE" | "OTHERINFO";
export type BlockVariant = "INTROONE" | "SKILLONE" | "EDUCATIONONE" | "EXPERIMENTONE" | "PROJECTONE" | "AWARDONE" | "ACTIVITYONE" | "REFERENCEONE" | "OTHERONE";
export type PortfolioStatus = "active" | "inactive" | "draft";
export type UserRole = "RECRUITER" | "EMPLOYEE" | "ADMIN";

// Ranking Information
export interface Ranking {
  totalScore: number;
  averageScore: number;
  rankPosition: number;
}

// Reviewer Information
export interface Reviewer {
  userId: number;
  name: string;
  avatar: string;
  role: UserRole;
}

// Block Data Types (Union of all possible block data structures)
export interface IntroData {
  avatar: string;
  name: string;
  studyField: string;
  description: string;
  email: string;
  phone: string;
}

export interface SkillItem {
  name: string;
}

export interface EducationData {
  schoolName: string;
  school: string;
  time: string;
  department: string;
  major: string;
  certificate: string;
  description: string;
}

export interface ExperienceData {
  jobName: string;
  address: string;
  startDate: string;
  endDate: string;
  time: string;
  description: string;
}

export interface ProjectData {
  name: string;
  image: string;
  description: string;
  role: string;
  technology: string;
  links: string[];
}

export interface AwardData {
  name: string;
  date: string;
  time: string;
  organization: string;
  issuer: string;
  description: string;
}

export interface ActivityData {
  name: string;
  date: string;
  time: string;
  description: string;
}

export interface ReferenceData {
  name: string;
  position: string;
  mail: string;
  email: string;
  phone: string;
  detail: string;
}

export interface OtherInfoItem {
  detail: string;
}

// Portfolio Block
export interface PortfolioBlock {
  id: number;
  type: BlockType;
  variant: BlockVariant;
  order: number;
  data: 
    | IntroData 
    | SkillItem[] 
    | EducationData[] 
    | ExperienceData[] 
    | ProjectData[] 
    | AwardData[] 
    | ActivityData[] 
    | ReferenceData[] 
    | OtherInfoItem[];
}

// Main Portfolio Interface
export interface Portfolio {
  portfolioId: number;
  employeeId: number;
  portfolioName: string;
  status: PortfolioStatus;
  isMain: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  isFollowed: boolean;
  ranking: Ranking;
  reviewers: Reviewer[];
  blocks: PortfolioBlock[];
}

// API Response
export interface PortfolioListResponse {
  items: Portfolio[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
