export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'teacher';
  class?: number;
  division?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Student {
  id: string;
  admissionNumber: string;
  name: string;
  mobile: string;
  class: number;
  division: string;
  busStop: string;
  busNumber: number;
  tripNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  studentId: string;
  student: Student;
  paymentType: 'development' | 'bus' | 'special';
  amount: number;
  description: string;
  receiptNumber: string;
  createdAt: Date;
  createdBy: string;
  specialPaymentType?: string;
}

export interface FeeConfiguration {
  id: string;
  class: number;
  developmentFee: number;
  updatedAt: Date;
}

export interface BusStop {
  id: string;
  name: string;
  amount: number;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

export interface DashboardStats {
  totalStudents: number;
  totalCollections: number;
  developmentFeeCollections: number;
  busFeeCollections: number;
  specialPaymentCollections: number;
  classWiseBreakup: { class: number; division: string; count: number }[];
  recentPayments: Payment[];
}