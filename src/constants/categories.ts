import { Colors } from './colors';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'rent',          name: 'Rent',          icon: 'home',          color: Colors.catRent,          bgColor: '#F0EEFF' },
  { id: 'electricity',   name: 'Electricity',   icon: 'zap',           color: Colors.catElectricity,   bgColor: '#FEF6E4' },
  { id: 'water',         name: 'Water',         icon: 'droplet',       color: Colors.catWater,         bgColor: '#EFF6FF' },
  { id: 'gas',           name: 'Gas',           icon: 'flame',         color: Colors.catGas,           bgColor: '#FFF0F0' },
  { id: 'mobile',        name: 'Mobile',        icon: 'smartphone',    color: Colors.catMobile,        bgColor: '#F0FFF4' },
  { id: 'internet',      name: 'Internet',      icon: 'wifi',          color: Colors.catInternet,      bgColor: '#F1F5F9' },
  { id: 'credit_card',   name: 'Credit Card',   icon: 'credit-card',   color: Colors.catCreditCard,    bgColor: '#FEF6E4' },
  { id: 'loan',          name: 'Loan / EMI',    icon: 'briefcase',     color: Colors.catLoan,          bgColor: '#FFF4EE' },
  { id: 'insurance',     name: 'Insurance',     icon: 'shield',        color: Colors.catInsurance,     bgColor: '#F0FDFB' },
  { id: 'entertainment', name: 'Entertainment', icon: 'tv',            color: Colors.catEntertainment, bgColor: '#FAF0FF' },
  { id: 'education',     name: 'Education',     icon: 'book-open',     color: Colors.catEducation,     bgColor: '#EFF6FF' },
  { id: 'vehicle',       name: 'Vehicle',       icon: 'truck',         color: Colors.catVehicle,       bgColor: '#F8FAFC' },
  { id: 'maintenance',   name: 'Maintenance',   icon: 'tool',          color: Colors.catMaintenance,   bgColor: '#FAFAF9' },
  { id: 'shopping',      name: 'Shopping',      icon: 'shopping-cart', color: Colors.catShopping,      bgColor: '#FFF0F8' },
  { id: 'other',         name: 'Other',         icon: 'file-text',     color: Colors.catOther,         bgColor: '#F9FAFB' },
];

export const SUBSCRIPTION_CATEGORY_IDS = ['entertainment', 'internet', 'mobile'];

export function getCategoryById(id: string): Category {
  return DEFAULT_CATEGORIES.find(c => c.id === id) ?? DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
}
