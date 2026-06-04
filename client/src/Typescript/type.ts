export interface CampaignData {
  campaignId: string;
  title?: string;
  ngoId?: string;
}

interface User {
  _id: string;        
  id?: string;       
  name: string;
  email: string;
  role: string;
  isFirstLogin?: boolean; // Matches your dynamic onboarding checks safely
}

export interface CampaignApproveData {
  campaignId: string;
}

export interface CampaignCompleteData {
  campaignId: string;
}

export interface CleaningRequest {
  _id: string;
  location: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Add these missing property fields:
  wasteType?: string | string[]; // Can be an array or string based on backend parsing
  description?: string;
  type?: string;                 // Fallback key used in your layout card
  companyId?: {
    _id: string;
    companyName: string;
    phone: string;
  } | string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  } | string;
}

export interface TeamMember {
  name: string;
  role: string;
  status: "Active" | "On Leave";
}

export interface CleaningCompany {
  _id: string;
  companyName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  inaugurationDate?: string;
  teamMembers?: TeamMember[];
}

type CompanyForm = {
  companyName: string;
  licenseNumber: string;
  about: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

interface ICompanyEditInput {
    companyName: string;
    licenseNumber: string;
    about: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    workersCount: number;     
    experienceYears: number;  
    coverImage?: FileList;
}