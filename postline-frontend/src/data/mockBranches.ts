import { type Branch } from '../types/branches';

export const mockBranches: Branch[] = [
  { id: 1, number: '№1', type: 'Вантажне', address: 'вул. Шевченка, 15', city: 'Львів', schedule: 'Пн-Пт: 08:00-20:00, Сб-Нд: 09:00-18:00', phone: '0 800 123 451', maxWeight: 'До 1000 кг', openNow: true },
  { id: 2, number: '№2', type: 'Поштове', address: 'просп. Свободи, 45', city: 'Львів', schedule: 'Пн-Пт: 08:00-21:00, Сб-Нд: 09:00-19:00', phone: '0 800 123 452', maxWeight: 'До 30 кг', openNow: true },
  { id: 3, number: '№3', type: 'Поштове', address: 'вул. Стрийська, 108', city: 'Львів', schedule: 'Пн-Пт: 09:00-20:00, Сб: 10:00-18:00, Нд: вихідний', phone: '0 800 123 453', maxWeight: 'До 30 кг', openNow: false },
  { id: 4, number: '№4', type: 'Міні-відділення', address: 'вул. Городоцька, 220', city: 'Львів', schedule: 'Пн-Нд: 09:00-21:00', phone: '0 800 123 454', maxWeight: 'До 10 кг', openNow: true },
];