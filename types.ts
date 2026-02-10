export type Language = 'en' | 'vi';

export enum DocType {
  WORK_PERMIT = 'WORK_PERMIT',
  VISA = 'VISA',
  TRC = 'TRC'
}

export type AppStatus = 'Submitted' | 'Payment Pending' | 'Payment Confirmed' | 'Under Review' | 'Approved' | 'Rejected' | 'Expired';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';

export interface AppDocument {
  id: string;
  name: string;
  type: string; // 'passport_file', 'photo_file', 'support_doc'
  url: string;
}

export interface Application {
  id: string;
  type: DocType;
  // Personal & Identity
  fullName: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  nationality: string;
  dob: string;
  gender: string;
  // Contact
  email: string;
  phone: string;
  currentAddress: string;
  vietnamAddress?: string;
  // Document Specifics (flexible object for different types)
  details: any; 
  // Files - Specifically mapped for the system
  passport_file?: string;
  photo_file?: string;
  support_files: string[];
  // Metadata
  submissionDate: string;
  status: AppStatus;
  paymentStatus: PaymentStatus;
  amount?: string;
  currency?: string;
  paymentProof?: {
    method: string;
    transactionId: string;
    imageUrl: string;
    amount: string;
    timestamp: string;
  };
  history: Array<{
    date: string;
    action: string;
    by: string;
    notes?: string;
  }>;
}

export interface PaymentMethod {
  id: string;
  name: string;
  details: string;
  enabled: boolean;
}

export interface OfficialRecord {
  id: string;
  type: DocType;
  fullName: string;
  passportNumber: string;
  nationality: string;
  dob?: string;
  email?: string;
  phone?: string;
  issueDate: string;
  expiryDate: string;
  status: 'Verified' | 'Expired' | 'Revoked';
  pdfUrl: string;
  authorityReference?: string;
  employer?: string;
  jobTitle?: string;
}

export interface ServiceConfig {
  id: string;
  type: DocType;
  title: { en: string; vi: string };
  fees: { en: string; vi: string };
  applyEnabled: boolean;
}

export interface AppConfig {
  services: Record<string, ServiceConfig>;
  paymentMethods: PaymentMethod[];
  theme: {
    primaryColor: string;
    textColor: string;
    backgroundColor: string;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface VerificationResult {
  status: 'valid' | 'invalid' | 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'success' | 'expired';
  documentId: string;
  ownerName?: string;
  issueDate?: string;
  expiryDate?: string;
  submissionDate?: string;
  message: string;
}

export interface Translation {
  [key: string]: {
    en: string;
    vi: string;
  };
}