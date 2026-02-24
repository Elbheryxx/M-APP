
import React from 'react';
import { UserRole, User, Material, Supplier } from './types';

export const BUILDINGS = [
  { name: 'Tower A', units: ['101', '102', '201', '202'] },
  { name: 'Tower B', units: ['G01', '101', '102', 'PH-01'] },
  { name: 'Labor Camp 1', units: ['Room 1', 'Room 2', 'Room 3', 'Room 4'] },
  { name: 'Sunset Villa', units: ['Main Villa', 'Guest House'] },
];

export const STATUS_FLOW: string[] = [
  'New',
  'Awaiting Manager Approval',
  'Awaiting Store Action',
  'In Execution',
  'Pending QA',
  'Completed',
];

export const USERS: User[] = [
  { id: 1, name: 'Qasim', role: UserRole.RECEIVER },
  { id: 2, name: 'Jaleel', role: UserRole.TECH },
  { id: 3, name: 'Sultan', role: UserRole.MANAGER },
  { id: 4, name: 'Sunish', role: UserRole.STORE },
  { id: 5, name: 'Mariam', role: UserRole.QA },
];

export const INITIAL_MATERIALS: Material[] = [
  { id: 1, name: '9W LED Bulb', sku: 'EL-001', stock: 100, minLevel: 20, category: 'Electrical' },
  { id: 2, name: 'Italian Mixer', sku: 'PL-002', stock: 5, minLevel: 10, category: 'Plumbing' },
  { id: 3, name: 'Freon Gas R22', sku: 'AC-003', stock: 50, minLevel: 15, category: 'HVAC' },
  { id: 4, name: 'Door Handle', sku: 'HW-004', stock: 12, minLevel: 5, category: 'Hardware' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 1, name: 'ElectroWorld', code: 'EW001', contact: 'Ahmed', phone: '+971-50-123-4567' },
  { id: 2, name: 'PlumbMaster', code: 'PM002', contact: 'Khalid', phone: '+971-50-234-5678' },
];
