
export type Language = 'en' | 'zh';

export type PaymentMode = 'Yearly' | 'Half-Yearly' | 'Quarterly' | 'Monthly';

export interface Product {
  name: string;
  provider: string;
  type: 'Life' | 'Medical' | 'Auto' | 'Property' | 'Critical Illness' | 'Savings' | 'Accident';
  defaultTags: string[];
}

export interface Rider {
  name: string;
  type: string;
  premiumAmount: number;
}

export interface PolicyData {
  id: string;
  policyNumber: string;
  planName: string;
  holderName: string;
  clientBirthday?: string; // New field for capturing birthday
  type: 'Life' | 'Medical' | 'Auto' | 'Property' | 'Critical Illness' | 'Savings' | 'Accident';
  policyAnniversaryDate: string; // Format: DD/MM
  paymentMode: PaymentMode;
  premiumAmount: number; // Base Premium
  status: 'Active' | 'Pending' | 'Expired';
  extractedTags?: string[]; // Tags derived from Product Library
  riders?: Rider[]; // Nested Rider Plans
  
  // --- Plan Specific Features ---
  
  // Medical
  medicalPlanType?: 'Ward' | 'Semi-Private' | 'Private';
  medicalExcess?: number; // For High-end medical
  
  // Life / Critical Illness / Accident (Critical)
  sumInsured?: number; 
  
  // Critical Illness
  isMultipay?: boolean; // 多重保
  
  // Term Life
  policyEndDate?: string; // YYYY-MM-DD
  
  // Savings
  capitalInvested?: number;
  
  // Accident
  accidentMedicalLimit?: number; // Sum insured for each accident
  accidentSectionLimit?: number; // Limitation on sum insured for each section
  accidentPhysioVisits?: number; // Number of times each year
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string; // YYYY-MM-DD
  totalPolicies: number;
  lastContact: string;
  status: 'Active' | 'Lead';
  tags: string[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  UPLOAD = 'UPLOAD',
  CLIENTS = 'CLIENTS',
  CLIENT_DETAILS = 'CLIENT_DETAILS',
  PRODUCTS = 'PRODUCTS',
  REMINDERS = 'REMINDERS'
}

export enum UploadStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
