export interface CompanyPost {
  postId: number;
  companyId: number;
  companyName: string;
  companyAvatar: string;
  mediaUrl: string;
  position: string;
  address: string;
  salary: string;
  employmentType: string;
  experienceYear: number;
  quantity: number;
  jobDescription: string;
  requirementsMandatory: string;
  requirementsPreferred: string;
  benefits: string;
  createAt: Date;
  status: number;
}
export interface PostMedia {
  type: "image" | "video";
  url: string;
}
export interface CompanyPostDetail {
  postId: number;
  companyId: number;
  position: string;
  companyName: string;
  companyAvatar: string | null;
  coverImageUrl: string | null;
  address: string;
  salary: string;
  employmentType: string;
  experienceYear: number | null;
  quantity: number | null;
  jobDescription: string | null;
  requirementsMandatory: string | null;
  requirementsPreferred: string | null;
  benefits: string | null;
  createdAt: string;
  status: number;
  media: PostMedia[];
  isSaved: boolean;
}
