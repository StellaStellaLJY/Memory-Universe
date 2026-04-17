export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  type: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Drizzle';
}

export interface CityData {
  name: string;
  englishName: string;
  province: string;
  country: string;
  type: 'unlocked' | 'resident' | 'wishlist';
  unlockDate?: string;
  rating?: number;
  residentEmoji?: string;
  wantsToGo?: string[]; // Names of people who want to go
  weather?: WeatherData;
}

export type Page = 'splash' | 'home' | 'map';
