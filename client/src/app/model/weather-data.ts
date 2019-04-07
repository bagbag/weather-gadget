export type WeatherStation = {
  timestamp: number;
  stationId: string;
  stationName?: string;
  modules: WeatherModule[];
};

export type WeatherModule = {
  moduleId: string;
  moduleName?: string;
  lastContact?: number;
  rain?: number;
  noise?: number;
  temperature?: number;
  windSpeed?: number;
  humidity?: number;
  pressure?: number;
  co2?: number;
};

export const moduleDataFields = [
  'rain',
  'noise',
  'temperature',
  'windSpeed',
  'humidity',
  'pressure',
  'co2'
];

export const moduleDataFieldsSet = new Set(moduleDataFields);
