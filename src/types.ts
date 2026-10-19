export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  mask: string;
}

export const COUNTRIES: Country[] = [
  { name: 'عێراق / کوردستان', code: 'IQ', dialCode: '+964', flag: '🇮🇶', mask: '7XX XXX XXXX' },
  { name: 'تورکیا', code: 'TR', dialCode: '+90', flag: '🇹🇷', mask: '5XX XXX XXXX' },
  { name: 'ئێران', code: 'IR', dialCode: '+98', flag: '🇮🇷', mask: '9XX XXX XXXX' },
  { name: 'سوریا', code: 'SY', dialCode: '+963', flag: '🇸🇾', mask: '9XX XXX XXX' },
  { name: 'ئیمارات', code: 'AE', dialCode: '+971', flag: '🇦🇪', mask: '5X XXX XXXX' },
  { name: 'سعوودیە', code: 'SA', dialCode: '+966', flag: '🇸🇦', mask: '5X XXX XXXX' },
  { name: 'ئوردن', code: 'JO', dialCode: '+962', flag: '🇯🇴', mask: '7 XXXX XXXX' },
  { name: 'کوەیت', code: 'KW', dialCode: '+965', flag: '🇰🇼', mask: 'XXXX XXXX' },
  { name: 'ئەڵمانیا', code: 'DE', dialCode: '+49', flag: '🇩🇪', mask: '1XX XXXXXXX' },
  { name: 'بەریتانیا', code: 'GB', dialCode: '+44', flag: '🇬🇧', mask: '7XXX XXXXXX' },
  { name: 'سوید', code: 'SE', dialCode: '+46', flag: '🇸🇪', mask: '7X XXX XXXX' },
  { name: 'ویلایەتە یەکگرتووەکان', code: 'US', dialCode: '+1', flag: '🇺🇸', mask: 'XXX XXX XXXX' },
];

export type NavigationTab = 'general' | 'video' | 'post' | 'profile';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  authProvider: 'google.com' | 'phone' | 'custom';
  createdAt?: string;
  lastLoginAt?: string;
}
