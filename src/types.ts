export type Role = 'Super Admin' | 'Admin' | 'Manager' | 'Staff' | 'Accountant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
  status: 'Active' | 'Inactive';
  avatar?: string;
  branch: string;
  lastLogin?: string;
}

export interface Customer {
  id: string; // e.g. "CUST-0001"
  fullName: string;
  gender: string;
  dob: string;
  nationalId: string;
  phoneNumber: string;
  address: string;
  occupation: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  photo: string;
  createdAt: string;
}

export type PawnItemCategory = 'Gold' | 'Silver' | 'Phone' | 'Laptop' | 'Motorbike' | 'Car' | 'Electronics' | 'Others';
export type PawnStatus = 'Active' | 'Extended' | 'Redeemed' | 'Auction' | 'Expired';

export interface PawnContract {
  id: string;
  contractNo: string;
  customerId: string;
  customerName: string;
  itemName: string;
  category: PawnItemCategory;
  brand: string;
  serialNumber: string;
  estimatedValue: number;
  loanAmount: number;
  interestRate: number; // e.g. 3 for 3% monthly
  pawnDate: string;
  expiryDate: string;
  status: PawnStatus;
  storageLocation: string;
  extensionCount: number;
  qrCodeData?: string;
  barcodeData?: string;
}

export type LoanFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
export type LoanStatus = 'Active' | 'Paid' | 'Overdue' | 'Written Off';

export interface LoanScheduleItem {
  installmentNo: number;
  dueDate: string;
  amountDue: number;
  principalDue: number;
  interestDue: number;
  paidAmount: number;
  paidDate?: string;
  status: 'Unpaid' | 'Paid' | 'Overdue' | 'Partial';
}

export interface Loan {
  id: string;
  loanNo: string;
  customerId: string;
  customerName: string;
  principalAmount: number;
  interestRate: number; // monthly or relative based on type
  loanTerm: number; // in months or days
  startDate: string;
  endDate: string;
  paymentFrequency: LoanFrequency;
  status: LoanStatus;
  remainingBalance: number;
  schedule: LoanScheduleItem[];
  penaltyRate: number; // percent per overdue installment
}

export type InstallmentStatus = 'Active' | 'Completed' | 'Late' | 'Defaulted';

export interface InstallmentScheduleItem {
  monthNo: number;
  dueDate: string;
  amountDue: number;
  paidAmount: number;
  paidDate?: string;
  status: 'Pending' | 'Paid' | 'Late' | 'Partial';
}

export interface InstallmentContract {
  id: string;
  contractNo: string;
  customerId: string;
  customerName: string;
  productName: string;
  productPrice: number;
  downPayment: number;
  remainingBalance: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  startDate: string;
  status: InstallmentStatus;
  schedule: InstallmentScheduleItem[];
}

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'KHQR' | 'ABA' | 'ACLEDA' | 'Wing' | 'TrueMoney';
export type PaymentType = 'Loan Payment' | 'Pawn Redeem' | 'Pawn Interest Renew' | 'Installment Pay' | 'Fee' | string;

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  customerId: string;
  customerName: string;
  paymentType: PaymentType;
  referenceId: string; // Loan ID, Pawn Contract ID, Installment ID
  amount: number;
  paymentMethod: PaymentMethod;
  currency?: 'USD' | 'KHR';
  exchangeRate: number; // relative to USD, e.g. 4100
  paymentDate: string;
  collectedBy: string;
  note?: string;
  khqrString?: string;
}

export interface Expense {
  id: string;
  category: 'Staff Salary' | 'Office Rent' | 'Utilities' | 'Maintenance' | 'Marketing' | 'Other';
  amount: number;
  currency?: 'USD' | 'KHR';
  date: string;
  description: string;
}

export interface Income {
  id: string;
  category: 'Pawn Interest' | 'Loan Interest' | 'Installment Profit' | 'Late Fees' | 'Auction Income' | 'Other';
  amount: number;
  currency?: 'USD' | 'KHR';
  date: string;
  description: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  role?: Role;
  action?: string;
  details?: string;
  module?: string;
  description?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  customerId: string;
  customerName: string;
  type: 'Payment Due' | 'Overdue Alert' | 'Pawn Expiring';
  message: string;
  channel: 'SMS' | 'Telegram' | 'Email';
  status: 'Pending' | 'Sent' | 'Failed';
  sentAt?: string;
}

export interface CompanySettings {
  companyName: string;
  logo: string;
  address?: string;
  addressKh?: string;
  addressEn?: string;
  phone: string;
  email: string;
  defaultInterestRate: number;
  penaltyRate: number;
  currency: 'USD' | 'KHR' | 'Dual';
  taxRate: number;
  branchName: string;
}

export type Language = 'EN' | 'KH';
export type NavValue = string;

export interface SystemSettings {
  companyName: string;
  address: string;
  phone: string;
  interestRatePawn: number;
  interestRateLoan: number;
  interestRateInstallment: number;
  exchangeRateUsdToKhr: number;
}
