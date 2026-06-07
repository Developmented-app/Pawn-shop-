import { 
  Customer, 
  PawnContract, 
  Loan, 
  InstallmentContract, 
  PaymentReceipt, 
  Expense, 
  Income, 
  ActivityLog, 
  Notification, 
  CompanySettings,
  User
} from './types';

// Mock Users
export const initialUsers: User[] = [
  {
    id: 'USR-001',
    name: 'Sok Mean',
    email: 'sok.mean@riem.com',
    role: 'Super Admin',
    permissions: ['all'],
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    branch: 'Phnom Penh Main Branch'
  },
  {
    id: 'USR-002',
    name: 'Chanthou Sopheap',
    email: 'chanthou.s@riem.com',
    role: 'Admin',
    permissions: ['manage_customers', 'manage_pawn', 'manage_loans', 'manage_installments', 'view_reports'],
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    branch: 'Phnom Penh Main Branch'
  },
  {
    id: 'USR-003',
    name: 'Vannak Boramey',
    email: 'vannak.b@riem.com',
    role: 'Manager',
    permissions: ['manage_customers', 'manage_pawn', 'manage_loans', 'manage_installments', 'view_reports', 'approve_loans'],
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    branch: 'Siem Reap Branch'
  },
  {
    id: 'USR-004',
    name: 'Kosal Sreyneath',
    email: 'sreyneath.k@riem.com',
    role: 'Staff',
    permissions: ['manage_customers', 'create_pawn', 'create_loan', 'receive_payment'],
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60',
    branch: 'Phnom Penh Main Branch'
  },
  {
    id: 'USR-005',
    name: 'Rithy Chetra',
    email: 'chetra.rithy@riem.com',
    role: 'Accountant',
    permissions: ['view_reports', 'manage_expenses', 'manage_income', 'reconcile_accounts'],
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?w=100&auto=format&fit=crop&q=60',
    branch: 'Phnom Penh Main Branch'
  }
];

// Mock Customers
export const initialCustomers: Customer[] = [
  {
    id: 'CUST-0001',
    fullName: 'Keo Sovann',
    gender: 'Male',
    dob: '1988-05-12',
    nationalId: '012948274',
    phoneNumber: '012 888 999',
    address: 'St. 271, Sangkat Boeung Keng Kang III, Phnom Penh',
    occupation: 'Grocery store owner',
    emergencyContact: {
      name: 'Ngin Sophorn',
      phone: '012 777 666',
      relation: 'Wife'
    },
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2026-01-10T08:30:00Z'
  },
  {
    id: 'CUST-0002',
    fullName: 'Seng Sreypich',
    gender: 'Female',
    dob: '1995-10-24',
    nationalId: '034981726',
    phoneNumber: '093 555 444',
    address: 'St. 150, Sangkat Toek Laark II, Tuol Kouk, Phnom Penh',
    occupation: 'Online seller (Clothes)',
    emergencyContact: {
      name: 'Seng Dara',
      phone: '093 111 222',
      relation: 'Father'
    },
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    createdAt: '2026-02-15T09:12:00Z'
  },
  {
    id: 'CUST-0003',
    fullName: 'Chea Vandy',
    gender: 'Male',
    dob: '1991-03-08',
    nationalId: '011245812',
    phoneNumber: '077 333 111',
    address: 'St. 360, Sangkat Boeung Keng Kang I, Phnom Penh',
    occupation: 'Delivery driver',
    emergencyContact: {
      name: 'Chea Sreymom',
      phone: '077 222 333',
      relation: 'Sister'
    },
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    createdAt: '2026-03-02T14:45:00Z'
  },
  {
    id: 'CUST-0004',
    fullName: 'Chhim Sophal',
    gender: 'Male',
    dob: '1984-12-18',
    nationalId: '025617261',
    phoneNumber: '017 444 888',
    address: 'National Road 6, Sangkat Slor Kram, Siem Reap',
    occupation: 'Tuk Tuk driver',
    emergencyContact: {
      name: 'Sophal Kunthea',
      phone: '017 222 111',
      relation: 'Spouse'
    },
    photo: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150',
    createdAt: '2026-03-20T11:20:00Z'
  }
];

// Mock Pawn Contracts
export const initialPawnContracts: PawnContract[] = [
  {
    id: 'PAWN-1001',
    contractNo: 'P-1001',
    customerId: 'CUST-0001',
    customerName: 'Keo Sovann',
    itemName: 'Solid Gold Necklace',
    category: 'Gold',
    brand: 'Custom Chinese Gold 99%',
    serialNumber: 'GLD-192-K',
    estimatedValue: 2500,
    loanAmount: 1800,
    interestRate: 3.5, // 3.5% monthly
    pawnDate: '2026-04-01',
    expiryDate: '2026-08-01',
    status: 'Active',
    storageLocation: 'Safe Vault Drawer-A3',
    extensionCount: 0
  },
  {
    id: 'PAWN-1002',
    contractNo: 'P-1002',
    customerId: 'CUST-0002',
    customerName: 'Seng Sreypich',
    itemName: 'iPhone 15 Pro Max 256GB Black',
    category: 'Phone',
    brand: 'Apple',
    serialNumber: 'IMEI-3549817263541',
    estimatedValue: 1100,
    loanAmount: 700,
    interestRate: 4.0,
    pawnDate: '2026-05-10',
    expiryDate: '2026-07-10',
    status: 'Active',
    storageLocation: 'Box Shelf-B12',
    extensionCount: 0
  },
  {
    id: 'PAWN-1003',
    contractNo: 'P-1003',
    customerId: 'CUST-0003',
    customerName: 'Chea Vandy',
    itemName: 'Honda Dream C125 2024 Black',
    category: 'Motorbike',
    brand: 'Honda',
    serialNumber: 'ND125-1948274',
    estimatedValue: 2600,
    loanAmount: 1500,
    interestRate: 3.0,
    pawnDate: '2026-03-01',
    expiryDate: '2026-06-01', // Expiring/Expired today relative to June 6, 2026 !
    status: 'Expired',
    storageLocation: 'Warehouse Garage-Spot 04',
    extensionCount: 1
  },
  {
    id: 'PAWN-1004',
    contractNo: 'P-1004',
    customerId: 'CUST-0004',
    customerName: 'Chhim Sophal',
    itemName: 'Asus ROG Strix G16 Gaming Laptop',
    category: 'Laptop',
    brand: 'ASUS',
    serialNumber: 'ASU-75H2910-K',
    estimatedValue: 1300,
    loanAmount: 800,
    interestRate: 4.2,
    pawnDate: '2026-02-15',
    expiryDate: '2026-05-15',
    status: 'Auction',
    storageLocation: 'Display Cabinet Drawer-C1',
    extensionCount: 0
  }
];

// Mock Loans
export const initialLoans: Loan[] = [
  {
    id: 'LOAN-2001',
    loanNo: 'L-2001',
    customerId: 'CUST-0001',
    customerName: 'Keo Sovann',
    principalAmount: 3000,
    interestRate: 1.5, // 1.5% monthly principal amortization
    loanTerm: 6, // 6 months
    startDate: '2026-01-15',
    endDate: '2026-07-15',
    paymentFrequency: 'Monthly',
    status: 'Active',
    remainingBalance: 1000,
    penaltyRate: 0.2, // 0.2% per day overdue
    schedule: [
      { installmentNo: 1, dueDate: '2026-02-15', amountDue: 545, principalDue: 500, interestDue: 45, paidAmount: 545, paidDate: '2026-02-14', status: 'Paid' },
      { installmentNo: 2, dueDate: '2026-03-15', amountDue: 537.5, principalDue: 500, interestDue: 37.5, paidAmount: 537.5, paidDate: '2026-03-14', status: 'Paid' },
      { installmentNo: 3, dueDate: '2026-04-15', amountDue: 530, principalDue: 500, interestDue: 30, paidAmount: 530, paidDate: '2026-04-15', status: 'Paid' },
      { installmentNo: 4, dueDate: '2026-05-15', amountDue: 522.5, principalDue: 500, interestDue: 22.5, paidAmount: 522.5, paidDate: '2026-05-14', status: 'Paid' },
      { installmentNo: 5, dueDate: '2026-06-15', amountDue: 515, principalDue: 500, interestDue: 15, paidAmount: 0, status: 'Unpaid' },
      { installmentNo: 6, dueDate: '2026-07-15', amountDue: 507.5, principalDue: 500, interestDue: 7.5, paidAmount: 0, status: 'Unpaid' }
    ]
  },
  {
    id: 'LOAN-2002',
    loanNo: 'L-2002',
    customerId: 'CUST-0002',
    customerName: 'Seng Sreypich',
    principalAmount: 1500,
    interestRate: 2.0,
    loanTerm: 5,
    startDate: '2026-02-10',
    endDate: '2026-07-10',
    paymentFrequency: 'Monthly',
    status: 'Overdue', // Payment due May 10 is missed or unpaid
    remainingBalance: 900,
    penaltyRate: 0.5,
    schedule: [
      { installmentNo: 1, dueDate: '2026-03-10', amountDue: 330, principalDue: 300, interestDue: 30, paidAmount: 330, paidDate: '2026-03-10', status: 'Paid' },
      { installmentNo: 2, dueDate: '2026-04-10', amountDue: 324, principalDue: 300, interestDue: 24, paidAmount: 324, paidDate: '2026-04-09', status: 'Paid' },
      { installmentNo: 3, dueDate: '2026-05-10', amountDue: 318, principalDue: 300, interestDue: 18, paidAmount: 0, status: 'Overdue' },
      { installmentNo: 4, dueDate: '2026-06-10', amountDue: 312, principalDue: 300, interestDue: 12, paidAmount: 0, status: 'Unpaid' },
      { installmentNo: 5, dueDate: '2026-07-10', amountDue: 306, principalDue: 300, interestDue: 6, paidAmount: 0, status: 'Unpaid' }
    ]
  },
  {
    id: 'LOAN-2003',
    loanNo: 'L-2003',
    customerId: 'CUST-0003',
    customerName: 'Chea Vandy',
    principalAmount: 500,
    interestRate: 1.0, // Weekly amortization
    loanTerm: 4, // 4 weeks
    startDate: '2026-05-15',
    endDate: '2026-06-12',
    paymentFrequency: 'Weekly',
    status: 'Active',
    remainingBalance: 125,
    penaltyRate: 0.2,
    schedule: [
      { installmentNo: 1, dueDate: '2026-05-22', amountDue: 130, principalDue: 125, interestDue: 5, paidAmount: 130, paidDate: '2026-05-22', status: 'Paid' },
      { installmentNo: 2, dueDate: '2026-05-29', amountDue: 128.75, principalDue: 125, interestDue: 3.75, paidAmount: 128.75, paidDate: '2026-05-29', status: 'Paid' },
      { installmentNo: 3, dueDate: '2026-06-05', amountDue: 127.5, principalDue: 125, interestDue: 2.5, paidAmount: 0, status: 'Overdue' }, // Overdue since yesterday
      { installmentNo: 4, dueDate: '2026-06-12', amountDue: 126.25, principalDue: 125, interestDue: 1.25, paidAmount: 0, status: 'Unpaid' }
    ]
  }
];

// Mock Installment Contracts
export const initialInstallmentContracts: InstallmentContract[] = [
  {
    id: 'INS-3001',
    contractNo: 'INS-101',
    customerId: 'CUST-0002',
    customerName: 'Seng Sreypich',
    productName: 'iPhone 15 Pro 128GB Blue',
    productPrice: 1000,
    downPayment: 200,
    remainingBalance: 800,
    interestRate: 1.2, // 1.2% monthly finance fee
    termMonths: 4,
    monthlyPayment: 212, // (800 / 4) + (800 * 0.012)
    startDate: '2026-03-20',
    status: 'Active',
    schedule: [
      { monthNo: 1, dueDate: '2026-04-20', amountDue: 212, paidAmount: 212, paidDate: '2026-04-19', status: 'Paid' },
      { monthNo: 2, dueDate: '2026-05-20', amountDue: 212, paidAmount: 212, paidDate: '2026-05-20', status: 'Paid' },
      { monthNo: 3, dueDate: '2026-06-20', amountDue: 212, paidAmount: 0, status: 'Pending' },
      { monthNo: 4, dueDate: '2026-07-20', amountDue: 212, paidAmount: 0, status: 'Pending' }
    ]
  },
  {
    id: 'INS-3002',
    contractNo: 'INS-102',
    customerId: 'CUST-0004',
    customerName: 'Chhim Sophal',
    productName: 'Honda Wave Helix 110cc',
    productPrice: 1800,
    downPayment: 300,
    remainingBalance: 1500,
    interestRate: 1.5,
    termMonths: 6,
    monthlyPayment: 272.5, // (1500 / 6) + (1500 * 0.015)
    startDate: '2026-01-10',
    status: 'Active',
    schedule: [
      { monthNo: 1, dueDate: '2026-02-10', amountDue: 272.5, paidAmount: 272.5, paidDate: '2026-02-10', status: 'Paid' },
      { monthNo: 2, dueDate: '2026-03-10', amountDue: 272.5, paidAmount: 272.5, paidDate: '2026-03-09', status: 'Paid' },
      { monthNo: 3, dueDate: '2026-04-10', amountDue: 272.5, paidAmount: 272.5, paidDate: '2026-04-10', status: 'Paid' },
      { monthNo: 4, dueDate: '2026-05-10', amountDue: 272.5, paidAmount: 0, status: 'Late' }, // Due May 10 is late!
      { monthNo: 5, dueDate: '2026-06-10', amountDue: 272.5, paidAmount: 0, status: 'Pending' },
      { monthNo: 6, dueDate: '2026-07-10', amountDue: 272.5, paidAmount: 0, status: 'Pending' }
    ]
  }
];

// Mock Payment History / Receipts
export const initialPayments: PaymentReceipt[] = [
  {
    id: 'REC-0001',
    receiptNo: 'R-26-0001',
    customerId: 'CUST-0001',
    customerName: 'Keo Sovann',
    paymentType: 'Loan Payment',
    referenceId: 'LOAN-2001',
    amount: 545,
    paymentMethod: 'KHQR',
    currency: 'USD',
    exchangeRate: 4100,
    paymentDate: '2026-02-14T11:20:00Z',
    collectedBy: 'Kosal Sreyneath',
    note: 'First installment payment via G-Shield KHQR',
    khqrString: '00020101021230380016AbaBankCambodia0114ABA0129482745204599953038405802KH5910KEO_SOVANN6010PHNOM_PENH62140110REC-26-00016304ABCD'
  },
  {
    id: 'REC-0002',
    receiptNo: 'R-26-0002',
    customerId: 'CUST-0001',
    customerName: 'Keo Sovann',
    paymentType: 'Loan Payment',
    referenceId: 'LOAN-2001',
    amount: 537.5,
    paymentMethod: 'ABA',
    currency: 'USD',
    exchangeRate: 4100,
    paymentDate: '2026-03-14T09:15:00Z',
    collectedBy: 'Chanthou Sopheap',
    note: 'Second installment via bank transfer'
  },
  {
    id: 'REC-0003',
    receiptNo: 'R-26-0003',
    customerId: 'CUST-0002',
    customerName: 'Seng Sreypich',
    paymentType: 'Pawn Interest Renew',
    referenceId: 'PAWN-1002',
    amount: 28, // (700 * 4%) monthly interest renewal
    paymentMethod: 'ACLEDA',
    currency: 'USD',
    exchangeRate: 4080,
    paymentDate: '2026-06-05T15:30:00Z',
    collectedBy: 'Kosal Sreyneath',
    note: 'Paid monthly interest to extend phone pawn contract by 30 days.'
  },
  {
    id: 'REC-0004',
    receiptNo: 'R-26-0004',
    customerId: 'CUST-0002',
    customerName: 'Seng Sreypich',
    paymentType: 'Installment Pay',
    referenceId: 'INS-3001',
    amount: 212,
    paymentMethod: 'KHQR',
    currency: 'USD',
    exchangeRate: 4100,
    paymentDate: '2026-05-20T10:45:00Z',
    collectedBy: 'Kosal Sreyneath',
    note: 'Installment month 2 pay',
    khqrString: '00020101021230380016AbaBankCambodia0114ABA0129482745204599953038405802KH5910SENG_SREYPICH6010PHNOM_PENH62140110REC-26-00046304EFAB'
  }
];

// Mock Expenses
export const initialExpenses: Expense[] = [
  {
    id: 'EXP-4001',
    category: 'Staff Salary',
    amount: 1200,
    currency: 'USD',
    date: '2026-05-30',
    description: 'May payroll for Kosal Sreyneath and Rithy Chetra'
  },
  {
    id: 'EXP-4002',
    category: 'Office Rent',
    amount: 450,
    currency: 'USD',
    date: '2026-05-01',
    description: 'Rent for BKK3 Phnom Penh branch premises'
  },
  {
    id: 'EXP-4003',
    category: 'Utilities',
    amount: 210,
    currency: 'USD',
    date: '2026-05-15',
    description: 'Electricity & High-speed fiber internet subscription'
  },
  {
    id: 'EXP-4004',
    category: 'Maintenance',
    amount: 85,
    currency: 'USD',
    date: '2026-05-22',
    description: 'Replacing fluorescent LED tubes and backup keyboard'
  }
];

// Mock Incomes (not compiled direct from receipts for manual additions or seed reports)
export const initialIncomeLogs: Income[] = [
  {
    id: 'INC-5001',
    category: 'Pawn Interest',
    amount: 63,
    currency: 'USD',
    date: '2026-05-10',
    description: 'Completed gold necklace pawn interest collection'
  },
  {
    id: 'INC-5002',
    category: 'Loan Interest',
    amount: 135,
    currency: 'USD',
    date: '2026-04-15',
    description: 'Keo Sovann Loan L-2001 installment interest portion'
  },
  {
    id: 'INC-5003',
    category: 'Installment Profit',
    amount: 95,
    currency: 'USD',
    date: '2026-05-20',
    description: 'iPhone finance charges profit portion'
  }
];

// Mock Activity Logs
export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'ACT-001',
    userId: 'USR-001',
    userName: 'Sok Mean',
    role: 'Super Admin',
    action: 'Settings Update',
    details: 'Configured default late interest rates and changed tax metrics to 1.5%',
    timestamp: '2026-06-06T14:22:10Z'
  },
  {
    id: 'ACT-002',
    userId: 'USR-004',
    userName: 'Kosal Sreyneath',
    role: 'Staff',
    action: 'Receive Payment',
    details: 'Processed cash payment receipt R-26-0003 for Seng Sreypich ($28.00)',
    timestamp: '2026-06-05T15:30:00Z'
  },
  {
    id: 'ACT-003',
    userId: 'USR-002',
    userName: 'Chanthou Sopheap',
    role: 'Admin',
    action: 'Create Customer',
    details: 'Registered customer Chea Vandy (National ID: 011245812)',
    timestamp: '2026-03-02T14:45:00Z'
  },
  {
    id: 'ACT-004',
    userId: 'USR-001',
    userName: 'Sok Mean',
    role: 'Super Admin',
    action: 'System Seed',
    details: 'Initialized secure database tables structure with 4 major clients.',
    timestamp: '2026-01-01T08:00:00Z'
  }
];

// Mock Notifications Sent
export const initialNotifications: Notification[] = [
  {
    id: 'NOT-001',
    customerId: 'CUST-0002',
    customerName: 'Seng Sreypich',
    type: 'Payment Due',
    message: 'Your iPhone 15 Installment (INS-101) due of $212 is coming up on June 20. Please prepare payment.',
    channel: 'Telegram',
    status: 'Sent',
    sentAt: '2026-06-05T08:00:00Z'
  },
  {
    id: 'NOT-002',
    customerId: 'CUST-0003',
    customerName: 'Chea Vandy',
    type: 'Overdue Alert',
    message: 'URGENT: Your Motorbike Pawn (P-1003) expired on June 1st. Please visit Riem Pawnshop or contact us immediately at 012 888 999 to avoid auction liquidation.',
    channel: 'SMS',
    status: 'Sent',
    sentAt: '2026-06-02T09:30:00Z'
  },
  {
    id: 'NOT-003',
    customerId: 'CUST-0002',
    customerName: 'Seng Sreypich',
    type: 'Overdue Alert',
    message: 'Overdue Warning: Loan L-2002 payment of $318 due on May 10 remains outstanding. Penalties of $0.50/day are accumulating.',
    channel: 'Email',
    status: 'Pending'
  }
];

// Default Company Settings
export const defaultSettings: CompanySettings = {
  companyName: 'Riem Pawn & Micro-Amortization Co., Ltd',
  logo: '🦁',
  addressKh: 'ផ្ទះលេខ ១២A ផ្លូវ ២៧១ សង្កាត់បឹងកេងកងទី ៣ ខណ្ឌបឹងកេងកង ភ្នំពេញ',
  addressEn: 'House 12A, Street 271, Boeung Keng Kang 3, Phnom Penh, Cambodia',
  phone: '012 888 999 / 093 555 444',
  email: 'support@riem-pawn.com.kh',
  defaultInterestRate: 3.0,
  penaltyRate: 0.2, // 0.2% per day secondary penalty rate
  currency: 'Dual',
  taxRate: 5.0,
  branchName: 'Phnom Penh Main Headquarters'
};
