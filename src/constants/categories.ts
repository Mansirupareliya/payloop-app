import { Colors } from './colors';

export interface Category {
  id: string;
  name: string;
  icon: string; // Now a Feather icon name
  color: string;
  bgColor: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'rent',          name: 'Rent',          icon: 'home',         color: Colors.catRent,          bgColor: '#EDE9FE' },
  { id: 'electricity',   name: 'Electricity',   icon: 'zap',          color: Colors.catElectricity,   bgColor: '#FEF3C7' },
  { id: 'water',         name: 'Water',         icon: 'droplet',      color: Colors.catWater,         bgColor: '#DBEAFE' },
  { id: 'gas',           name: 'Gas',           icon: 'flame',        color: Colors.catGas,           bgColor: '#FEE2E2' },
  { id: 'mobile',        name: 'Mobile',        icon: 'smartphone',   color: Colors.catMobile,        bgColor: '#D1FAE5' },
  { id: 'internet',      name: 'Internet',      icon: 'wifi',         color: Colors.catInternet,      bgColor: '#EEF2FF' },
  { id: 'credit_card',   name: 'Credit Card',   icon: 'credit-card',  color: Colors.catCreditCard,    bgColor: '#FCE7F3' },
  { id: 'loan',          name: 'Loan / EMI',    icon: 'briefcase',    color: Colors.catLoan,          bgColor: '#FFEDD5' },
  { id: 'insurance',     name: 'Insurance',     icon: 'shield',       color: Colors.catInsurance,     bgColor: '#CCFBF1' },
  { id: 'entertainment', name: 'Entertainment', icon: 'tv',           color: Colors.catEntertainment, bgColor: '#F3E8FF' },
  { id: 'education',     name: 'Education',     icon: 'book-open',    color: Colors.catEducation,     bgColor: '#E0F2FE' },
  { id: 'vehicle',       name: 'Vehicle',       icon: 'truck',        color: Colors.catVehicle,       bgColor: '#F1F5F9' },
  { id: 'maintenance',   name: 'Maintenance',   icon: 'tool',         color: Colors.catMaintenance,   bgColor: '#F5F5F4' },
  { id: 'shopping',      name: 'Shopping',      icon: 'shopping-cart',color: Colors.catShopping,      bgColor: '#FFE4E6' },
  { id: 'other',         name: 'Other',         icon: 'file-text',    color: Colors.catOther,         bgColor: '#F1F5F9' },
];

export const SUBSCRIPTION_CATEGORY_IDS = ['entertainment', 'internet', 'mobile'];

export function getCategoryById(id: string): Category {
  return DEFAULT_CATEGORIES.find(c => c.id === id) ?? DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
}

