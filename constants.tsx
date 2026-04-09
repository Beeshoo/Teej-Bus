
import { BusType, TripSchedule } from './types';

export const CITIES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 
  'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 
  'المنيا', 'القليوبية', 'الوادي الجديد', 'الشرقية', 'السويس', 
  'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا', 
  'شمال سيناء', 'سوهاج'
];

export const BUS_PRICES: Record<BusType, number> = {
  [BusType.STANDARD]: 150,
  [BusType.VIP]: 300,
  [BusType.ROYAL]: 550
};

export const TRIP_SCHEDULES: TripSchedule[] = [
  { id: 't1', departureTime: '06:00', arrivalTime: '09:00', label: 'الرحلة الصباحية' },
  { id: 't2', departureTime: '10:00', arrivalTime: '13:00', label: 'رحلة الظهيرة' },
  { id: 't3', departureTime: '15:00', arrivalTime: '18:00', label: 'رحلة العصر' },
  { id: 't4', departureTime: '20:00', arrivalTime: '23:00', label: 'الرحلة المسائية' },
  { id: 't5', departureTime: '01:00', arrivalTime: '04:00', label: 'رحلة المبيت' }
];
