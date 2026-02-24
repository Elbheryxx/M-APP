
export enum UserRole {
  RECEIVER = 'RECEIVER',
  TECH = 'TECH',
  MANAGER = 'MANAGER',
  STORE = 'STORE',
  QA = 'QA'
}

export interface User {
  id: number;
  name: string;
  role: UserRole;
}

export interface Material {
  id: number;
  name: string;
  sku: string;
  stock: number;
  minLevel: number;
  category: string;
}

export interface Supplier {
  id: number;
  name: string;
  code: string;
  contact: string;
  phone: string;
}

export interface Message {
  id: number;
  requestId: number;
  fromUserId: number;
  text: string;
  createdAt: string;
}

export type RequestStatus = 
  | 'Pending Assessment'        // Initial state after creation, waiting for Technician assessment
  | 'Returned to Tech'          // Manager returned for revision
  | 'Awaiting Approval'         // Manager reviewing cost
  | 'Approved - Awaiting Store' // Approved, Store preparing materials
  | 'Materials Ready'           // Materials ready for Tech pickup
  | 'In Execution'              // Tech collected materials and started work
  | 'Pending Verification'      // Work finished, waiting for QA/Tenant verification
  | 'Completed'                 // Successfully finished
  | 'Rejected';                 // Rejected by Manager

export interface RequestMaterial {
  id: number;
  name: string;
  cost: number;
}

export interface HistoryEntry {
  id: number;
  text: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: number;
  requestNo: string;
  building: string;
  unit: string;
  description: string;
  tenantName: string;
  tenantPhone: string;
  status: RequestStatus;
  createdAt: string;
  createdBy: string;
  createdById: number;
  priority: 'Low' | 'Medium' | 'High';
  materialsRequested: RequestMaterial[];
  laborCost: number;
  totalCost: number;
  managerFeedback?: string;
  history: HistoryEntry[];
  assessmentPhotos: string[]; // Photos before starting
  completionPhotos: string[]; // Photos after finishing
}

export interface Building {
  name: string;
  units: string[];
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}
