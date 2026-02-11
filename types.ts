
export type Language = 'en' | 'vi';

export enum DocType {
  WORK_PERMIT = 'WORK_PERMIT',
  VISA = 'VISA',
  TRC = 'TRC'
}

export type InfoCategory = 'Rules' | 'Cost' | 'Update';

export interface InfoEntry {
  id: string;
  appType: DocType;
  category: InfoCategory;
  title: string;
  description: string;
  amount?: string;
  status: 'Active' | 'Inactive' | 'Pinned';
  date: string;
}

export type AppStatus = 'Submitted' | 'Payment Pending' | 'Payment Confirmed' | 'Under Review' | 'Approved' | 'Rejected' | 'Expired' | 'Processing' | 'Verified';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';

export interface Application {
  id: string;
  type: DocType;
  fullName: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  nationality: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  currentAddress: string;
  vietnamAddress?: string;
  // Specific Fields
  wpNumber?: string;
  visaNumber?: string;
  visaType?: string;
  visaEntryType?: 'Single' | 'Multiple';
  trcNumber?: string;
  companyName?: string;
  jobPosition?: string;
  sponsorName?: string;
  sponsorCompany?: string;
  sponsorContact?: string;
  issueDate?: string;
  expiryDate?: string;
  // Files
  passport_file?: string;
  photo_file?: string;
  visa_file?: string;
  trc_file_front?: string;
  trc_file_back?: string;
  wp_file?: string;
  contract_file?: string;
  entry_stamp_file?: string;
  payment_receipt_file?: string;
  additional_files: string[];
  
  submissionDate: string;
  status: AppStatus;
  paymentStatus: PaymentStatus;
  amount?: string;
  currency?: string;
  history: Array<{
    date: string;
    action: string;
    by: string;
    notes?: string;
  }>;
  // Added fields to resolve component type errors
  support_files?: string[];
  trc_file?: string;
  details?: any;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'Cash' | 'Bank' | 'Binance' | 'Online';
  details: string; 
  qrCode?: string;
  binanceUid?: string;
  binanceEmail?: string;
  walletAddress?: string;
  networkType?: string;
  enabled: boolean;
}

export interface PaymentEntry {
  id: string;
  applicationId: string;
  methodId: string;
  amount: string;
  transactionId: string;
  screenshot?: string;
  timestamp: string;
  status: 'Completed' | 'Pending' | 'Flagged';
}

export interface DeviceInfo {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  ip: string;
  country: string;
  city: string;
  region: string;
  lastActive: string;
  loginTime: string;
  status: 'Active' | 'Blocked' | 'Suspended';
  isNew?: boolean;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
}

export interface SiteRule {
  id: string;
  title: string;
  content: string;
  category: 'Rule' | 'Update' | 'Cost' | 'Info';
}

export interface AppConfig {
  services: Record<string, any>;
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

export interface Translation {
  [key: string]: {
    en: string;
    vi: string;
  };
}

// Added missing interfaces for verification and records
export interface VerificationResult {
  status: 'valid' | 'invalid' | 'pending' | 'expired';
  documentId: string;
  ownerName?: string;
  issueDate?: string;
  expiryDate?: string;
  message: string;
}

export interface OfficialRecord {
  id: string;
  type: DocType;
  fullName: string;
  passportNumber: string;
  nationality: string;
  email: string;
  phone: string;
  status: AppStatus;
  issueDate: string;
  expiryDate: string;
  sponsorCompany?: string;
  jobTitle?: string;
  passport_copy?: string;
  visa_copy?: string;
  trc_copy?: string;
  pdfUrl: string;
}
